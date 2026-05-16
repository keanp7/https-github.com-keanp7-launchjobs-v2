import { NextRequest, NextResponse } from "next/server"
import { getAnthropicClient, MODEL } from "@/lib/anthropic/client"
import { createClient, throwOnDbError } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import { validateRequiredFields } from "@/lib/validateFields"
import type { CandidateIntake, GapResult } from "@/types/pipeline"

// ── Fallback sprint used when the AI call fails or times out ─────────────────
function buildFallbackSprint(targetRole: string): object {
  return {
    target_role: targetRole || "Your Target Role",
    total_weeks: 4,
    weekly_hours: 10,
    is_fallback: true,
    weeks: [
      {
        week: 1,
        focus: "Positioning and LinkedIn rewrite",
        goal: "Reframe your experience so every recruiter immediately sees the fit for your target role",
        resources: [
          { name: "LinkedIn Profile Optimisation Checklist", type: "article", platform: "LinkedIn Help", cost: "free", url: "https://www.linkedin.com/help/linkedin/answer/a554352", hours: 2 },
          { name: "Resume Worded — free resume and LinkedIn scorer", type: "article", platform: "resumeworded.com", cost: "free", url: "https://resumeworded.com", hours: 3 },
        ],
        milestone: "Updated LinkedIn headline, about section, and top 3 experience bullets are live and keyword-targeted",
      },
      {
        week: 2,
        focus: "Targeted applications and networking",
        goal: "Send 15 quality applications and make 10 genuine outreach connections in your target field",
        resources: [
          { name: "How to cold-message hiring managers on LinkedIn", type: "article", platform: "LinkedIn", cost: "free", url: "https://www.linkedin.com/pulse/how-cold-message-hiring-managers-linkedin-get-response-jeff-su", hours: 1 },
          { name: "Teal — job application tracker", type: "article", platform: "tealhq.com", cost: "free", url: "https://www.tealhq.com", hours: 4 },
        ],
        milestone: "15 applications sent, 10 connection requests with personalised notes dispatched, responses tracked",
      },
      {
        week: 3,
        focus: "Interview preparation",
        goal: "Build a repeatable STAR-format story bank covering your top 8 transferable achievements",
        resources: [
          { name: "STAR Method Interview Prep — Google Slides template", type: "article", platform: "Google", cost: "free", url: "https://docs.google.com/presentation/d/1tbsKkDbfKlpwZOiJiZrPWd5VoZPBFJiGGHFLdXlWVpM/edit", hours: 3 },
          { name: "Pramp — free peer mock interviews", type: "practice", platform: "pramp.com", cost: "free", url: "https://www.pramp.com", hours: 4 },
        ],
        milestone: "8 STAR stories written, 2 mock interviews completed with recorded feedback reviewed",
      },
      {
        week: 4,
        focus: "Follow-up and closing",
        goal: "Re-engage every warm lead, ask for feedback from rejections, and negotiate any offers",
        resources: [
          { name: "Salary negotiation scripts (Fearless Salary Negotiation)", type: "article", platform: "fearlesssalarynegotiation.com", cost: "free", url: "https://fearlesssalarynegotiation.com/salary-negotiation-email-sample", hours: 2 },
          { name: "How to follow up after an interview — templates", type: "article", platform: "HBR", cost: "free", url: "https://hbr.org/2021/11/how-to-follow-up-after-an-interview", hours: 1 },
        ],
        milestone: "All pending applications followed up, at least one offer or next-round interview secured",
      },
    ],
    final_proof: "A tracked record of 15+ applications, recruiter conversations, and at least one live offer or active interview process",
    interview_angle: "Lead with the specific impact numbers from your previous role, then connect them directly to the priorities of the target position. Displaced workers who can articulate their value in market language stand out.",
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  let { candidate_id, gap, intake }: { candidate_id: string; gap: GapResult; intake: CandidateIntake } = body

  // ── If gap/intake not provided, read from DB ─────────────────────────────
  if (!gap || !intake) {
    console.log("[learning] gap/intake not in body — fetching from DB for candidate:", candidate_id)

    const { data: gapRow } = await supabase
      .from("gap_analyses")
      .select("gap_analysis")
      .eq("candidate_id", candidate_id)
      .single()

    const { data: candidateRow } = await supabase
      .from("candidates")
      .select("old_job_title, years_experience, industry, displacement_reason, extra_context")
      .eq("id", candidate_id)
      .single()

    gap = gap ?? { gap_analysis: gapRow?.gap_analysis ?? [] }
    intake = intake ?? {
      old_job_title: candidateRow?.old_job_title ?? "",
      years_experience: candidateRow?.years_experience ?? 1,
      industry: candidateRow?.industry ?? "",
      displacement_reason: candidateRow?.displacement_reason ?? "",
      extra_context: candidateRow?.extra_context ?? "",
    }
  }

  const targetRole = (gap?.gap_analysis?.[0]?.role) ?? intake?.old_job_title ?? "Your Target Role"
  let parsed: any
  let usedFallback = false

  try {
    // ── Build prompt ─────────────────────────────────────────────────────────
    const userPrompt = PROMPTS.LEARNING_PATH.buildUser(JSON.stringify(gap), JSON.stringify(intake))
    console.log("[learning] prompt preview:", userPrompt.substring(0, 300))

    // ── 50-second hard timeout ────────────────────────────────────────────────
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn("[learning] AI call exceeded 50s — aborting and using fallback")
      controller.abort()
    }, 50_000)

    try {
      const response = await getAnthropicClient().messages.create(
        {
          model: MODEL,
          max_tokens: 4000,
          system: PROMPTS.LEARNING_PATH.system,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      const raw = response.content[0].type === "text" ? response.content[0].text : ""
      console.log("[learning] raw AI response preview:", raw.substring(0, 400))

      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(clean)
      console.log("[learning] parsed OK — weeks:", parsed.total_weeks, "role:", parsed.target_role)
    } catch (aiError: any) {
      clearTimeout(timeoutId)
      const reason = aiError?.name === "AbortError" ? "timeout (50s)" : aiError?.message
      console.warn("[learning] AI call failed:", reason, "— using fallback sprint")
      parsed = buildFallbackSprint(targetRole)
      usedFallback = true
    }
  } catch (outerError: any) {
    console.error("[learning] outer error:", outerError?.message)
    parsed = buildFallbackSprint(targetRole)
    usedFallback = true
  }

  // ── Save to DB (always, fallback or not) ─────────────────────────────────
  validateRequiredFields({ candidate_id }, ["candidate_id"], "learning_paths")

  const { data: savedRow, error: dbError } = await supabase
    .from("learning_paths")
    .upsert({
      candidate_id,
      target_role: parsed.target_role,
      total_weeks: parsed.total_weeks,
      weekly_hours: parsed.weekly_hours,
      weeks: parsed.weeks,
      final_proof: parsed.final_proof,
      interview_angle: parsed.interview_angle,
    }, { onConflict: "candidate_id" })
    .select()
    .single()

  console.log("[learning] DB save response:", savedRow ? "saved OK" : "null", "error:", dbError?.message)

  if (dbError) {
    console.error("[learning] DB upsert failed:", dbError)
    throwOnDbError(dbError, "learning/learning_paths upsert")
  }

  return NextResponse.json({
    success: true,
    data: parsed,
    fallback: usedFallback,
  })
}
