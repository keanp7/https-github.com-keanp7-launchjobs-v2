import { NextRequest, NextResponse } from "next/server"
import { getAnthropicClient, MODEL } from "@/lib/anthropic/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { candidate_id, full_name, phone, city_state } = body

  if (!candidate_id) return NextResponse.json({ error: "candidate_id required" }, { status: 400 })
  if (!full_name)    return NextResponse.json({ error: "full_name required" }, { status: 400 })

  const [profileRes, candidateRes] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("headline, positioning_statement, top_skills, proof_points, employer_pitch, open_to")
      .eq("candidate_id", candidate_id)
      .single(),
    supabase
      .from("candidates")
      .select("old_job_title, years_experience, industry")
      .eq("id", candidate_id)
      .single(),
  ])

  if (!profileRes.data) {
    return NextResponse.json(
      { error: "Profile not found. Complete the profile step first." },
      { status: 404 }
    )
  }

  const profile = profileRes.data
  const candidate = candidateRes.data

  const userPrompt = `
Worker profile:
- Previous job title: ${candidate?.old_job_title ?? "Not specified"}
- Years of experience: ${candidate?.years_experience ?? "Unknown"}
- Industry: ${candidate?.industry ?? "Not specified"}
- Headline: ${profile.headline}
- Positioning statement: ${profile.positioning_statement}
- Top skills: ${Array.isArray(profile.top_skills) ? profile.top_skills.join(", ") : ""}
- Proof points: ${JSON.stringify(profile.proof_points ?? [])}
- Open to: ${Array.isArray(profile.open_to) ? profile.open_to.join(", ") : ""}

Write professional resume content for this worker.
`

  const system = `You are a professional resume writer specialising in career transitions.
Given a displaced worker's skills profile, produce clean, ATS-friendly resume content.
Output ONLY valid JSON. No preamble, no markdown fences.
Schema: {
  "experience_title": string,
  "professional_summary": string,
  "experience_bullets": string[],
  "core_skills": string[]
}
Rules:
- experience_title: derive a concise job title from their old role and industry (e.g. "Senior Operations Manager"). One line, no dates.
- professional_summary: 2-3 tight sentences. Lead with years + field. Close with their transition value prop. No clichés or buzzwords.
- experience_bullets: exactly 5-6 bullets. Each starts with a strong past-tense action verb. Quantify where the proof points imply a number. One sentence each, under 20 words. No sub-bullets.
- core_skills: 10-12 specific, ATS-friendly noun phrases derived from top_skills + proof points. No soft-skill generics like "team player".
- Never fabricate company names, specific dates, or metrics not implied by the input.`

  let parsed: any
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45_000)

  try {
    const response = await getAnthropicClient().messages.create(
      {
        model: MODEL,
        max_tokens: 900,
        system,
        messages: [{ role: "user", content: userPrompt }],
      },
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    parsed = JSON.parse(clean)
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.error("[resume] Claude error:", err?.message)
    // Fallback: build from existing profile data
    parsed = {
      experience_title: candidate?.old_job_title ?? "Professional",
      professional_summary: profile.positioning_statement ?? "",
      experience_bullets: Array.isArray(profile.proof_points)
        ? profile.proof_points.slice(0, 6).map((p: any) => `${p.claim} — ${p.evidence}`)
        : [],
      core_skills: Array.isArray(profile.top_skills) ? profile.top_skills : [],
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      full_name,
      phone: phone ?? "",
      city_state: city_state ?? "",
      headline: profile.headline ?? "",
      open_to: Array.isArray(profile.open_to) ? profile.open_to : [],
      years_experience: candidate?.years_experience ?? null,
      industry: candidate?.industry ?? "",
      ...parsed,
    },
  })
}
