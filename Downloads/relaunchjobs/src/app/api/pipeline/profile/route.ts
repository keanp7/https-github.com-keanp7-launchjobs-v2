import { NextRequest, NextResponse } from "next/server"
import { getAnthropicClient, MODEL } from "@/lib/anthropic/client"
import { createClient, throwOnDbError } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import { validateRequiredFields } from "@/lib/validateFields"

// ── Fallback profile used when AI call fails or times out ────────────────────
function buildFallbackProfile(jobTitle: string): object {
  return {
    is_fallback: true,
    headline: `Experienced ${jobTitle || "Professional"} | Transferable Skills | Open to New Opportunities`,
    positioning_statement:
      "A results-driven professional with proven experience delivering impact in fast-paced environments. " +
      "Known for cross-functional collaboration, clear communication, and the ability to adapt quickly to new tools and challenges. " +
      "Actively transitioning and bringing deep domain knowledge that complements modern AI-augmented workflows.",
    top_skills: [
      "Cross-functional collaboration",
      "Project coordination",
      "Stakeholder communication",
      "Process improvement",
      "Adaptability",
      "Problem-solving",
      "Documentation and reporting",
    ],
    proof_points: [
      {
        claim: "Proven track record of delivery in complex environments",
        evidence: `Years of hands-on experience as ${jobTitle || "a professional"} — sustained tenure is direct evidence of consistent performance under real operational conditions`,
      },
      {
        claim: "Transferable skills that map directly to adjacent roles",
        evidence: "Core competencies in coordination, communication, and execution translate across industries and role types without retraining",
      },
      {
        claim: "First-hand understanding of AI-driven change in the workplace",
        evidence: "Having navigated displacement, brings authentic insight into how organisations must adapt — valuable to any team managing automation transitions",
      },
    ],
    employer_pitch:
      "This candidate brings deep operational experience and the specific credibility of having worked through AI-driven change firsthand. " +
      "They are not approaching this transition with a resume gap — they are approaching it with a clear narrative, transferable proof points, and the self-awareness that comes from having done the hard work of understanding their own value in a shifting market.",
    open_to: [
      "Operations roles at mid-market companies",
      "Project or programme management positions",
      "Coordinator or analyst roles in adjacent industries",
      "Contract or interim assignments to build new-sector experience",
    ],
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { candidate_id } = body
  let { intake, extract, risk, match, gap, learning } = body

  // ── Fetch any missing pipeline data from DB ──────────────────────────────
  if (!intake || !extract || !risk || !match || !gap || !learning) {
    console.log("[profile] some inputs missing — fetching from DB for candidate:", candidate_id)

    const [candidateRes, skillsRes, matchRes, gapRes, learningRes] = await Promise.all([
      supabase.from("candidates").select("old_job_title,years_experience,industry,displacement_reason,extra_context").eq("id", candidate_id).single(),
      supabase.from("skills_analyses").select("hard_skills,soft_skills,domain_knowledge,hidden_strengths,safe_skills,at_risk_skills,hybrid_skills").eq("candidate_id", candidate_id).order("created_at", { ascending: false }).limit(1).single(),
      supabase.from("role_matches").select("target_roles").eq("candidate_id", candidate_id).single(),
      supabase.from("gap_analyses").select("gap_analysis").eq("candidate_id", candidate_id).single(),
      supabase.from("learning_paths").select("target_role,total_weeks,weekly_hours,weeks,final_proof,interview_angle").eq("candidate_id", candidate_id).single(),
    ])

    intake = intake ?? {
      old_job_title: candidateRes.data?.old_job_title ?? "",
      years_experience: candidateRes.data?.years_experience ?? 1,
      industry: candidateRes.data?.industry ?? "",
      displacement_reason: candidateRes.data?.displacement_reason ?? "",
      extra_context: candidateRes.data?.extra_context ?? "",
    }
    extract = extract ?? { hard_skills: skillsRes.data?.hard_skills ?? [], soft_skills: skillsRes.data?.soft_skills ?? [], domain_knowledge: skillsRes.data?.domain_knowledge ?? [], hidden_strengths: skillsRes.data?.hidden_strengths ?? [] }
    risk = risk ?? { safe_skills: skillsRes.data?.safe_skills ?? [], at_risk_skills: skillsRes.data?.at_risk_skills ?? [], hybrid_skills: skillsRes.data?.hybrid_skills ?? [] }
    match = match ?? { target_roles: matchRes.data?.target_roles ?? [] }
    gap = gap ?? { gap_analysis: gapRes.data?.gap_analysis ?? [] }
    learning = learning ?? learningRes.data ?? {}
  }

  const allOutputs = { extract, risk, match, gap, learning }
  const userPrompt = PROMPTS.BUILD_PROFILE.buildUser(JSON.stringify(allOutputs), JSON.stringify(intake))
  console.log("[profile] prompt preview:", userPrompt.substring(0, 300))

  let parsed: any
  let usedFallback = false

  // ── 50-second hard timeout ────────────────────────────────────────────────
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.warn("[profile] AI call exceeded 50s — aborting, using fallback")
    controller.abort()
  }, 50_000)

  try {
    const response = await getAnthropicClient().messages.create(
      {
        model: MODEL,
        max_tokens: 1500,
        system: PROMPTS.BUILD_PROFILE.system,
        messages: [{ role: "user", content: userPrompt }],
      },
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    console.log("[profile] raw AI response preview:", raw.substring(0, 400))

    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    parsed = JSON.parse(clean)
    console.log("[profile] parsed OK — headline:", parsed.headline?.substring(0, 80))
  } catch (aiErr: any) {
    clearTimeout(timeoutId)
    const reason = aiErr?.name === "AbortError" ? "timeout (50s)" : aiErr?.message
    console.warn("[profile] AI call failed:", reason, "— using fallback profile")
    parsed = buildFallbackProfile(intake?.old_job_title ?? "")
    usedFallback = true
  }

  // ── Save to DB (always) ──────────────────────────────────────────────────
  validateRequiredFields({ candidate_id }, ["candidate_id"], "candidate_profiles")

  const { data: savedRow, error: dbError } = await supabase
    .from("candidate_profiles")
    .upsert({
      candidate_id,
      headline: parsed.headline,
      positioning_statement: parsed.positioning_statement,
      top_skills: parsed.top_skills,
      proof_points: parsed.proof_points,
      employer_pitch: parsed.employer_pitch,
      open_to: parsed.open_to,
    }, { onConflict: "candidate_id" })
    .select()
    .single()

  console.log("[profile] DB save:", savedRow ? "OK" : "null", "error:", dbError?.message)
  if (dbError) throwOnDbError(dbError, "profile/candidate_profiles upsert")

  return NextResponse.json({ success: true, data: parsed, fallback: usedFallback })
}
