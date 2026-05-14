import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, intake_data } = body

    const { data: existing, error: fetchError } = await supabase
      .from("skills_analyses")
      .select("hard_skills, soft_skills, domain_knowledge, hidden_strengths, safe_skills, at_risk_skills, hybrid_skills")
      .eq("candidate_id", candidate_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (fetchError) throw fetchError

    const normalizedIntake = {
      old_job_title: intake_data.jobTitle,
      years_experience: parseInt(intake_data.yearsExp) || 1,
      industry: intake_data.industry,
      displacement_reason: intake_data.reason,
      extra_context: intake_data.context || "",
    }
    const candidateJSON = JSON.stringify({ intake: normalizedIntake, skills: existing })
    const riskJSON = JSON.stringify({
      safe_skills: existing.safe_skills,
      at_risk_skills: existing.at_risk_skills,
      hybrid_skills: existing.hybrid_skills,
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: PROMPTS.MATCH_ROLES.system,
      messages: [{
        role: "user",
        content: PROMPTS.MATCH_ROLES.buildUser(candidateJSON, riskJSON),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { error } = await supabase
      .from("role_matches")
      .upsert({
        candidate_id,
        target_roles: parsed.target_roles,
      }, { onConflict: "candidate_id" })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error: any) {
    console.error("Pipeline match error:", error)
    return NextResponse.json({ error: "Pipeline failed", details: error?.message }, { status: 500 })
  }
}
