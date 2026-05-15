import { NextRequest, NextResponse } from "next/server"
import { getAnthropicClient, MODEL } from "@/lib/anthropic/client"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, intake_data } = body

    // Form sends camelCase; prompt builder expects CandidateIntake (snake_case)
    const normalized = {
      old_job_title: intake_data.jobTitle,
      years_experience: parseInt(intake_data.yearsExp) || 1,
      industry: intake_data.industry,
      displacement_reason: intake_data.reason,
      extra_context: intake_data.context || "",
    }

    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: PROMPTS.EXTRACT_SKILLS.system,
      messages: [{
        role: "user",
        content: PROMPTS.EXTRACT_SKILLS.buildUser(normalized),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { error } = await supabase
      .from("skills_analyses")
      .upsert({
        candidate_id,
        hard_skills: parsed.hard_skills,
        soft_skills: parsed.soft_skills,
        domain_knowledge: parsed.domain_knowledge,
        hidden_strengths: parsed.hidden_strengths,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error: any) {
    console.error('Pipeline extract error:', error)
    console.error('Error message:', error?.message)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: 'Pipeline failed',
        details: error?.message || 'Unknown error',
        stack: error?.stack
      },
      { status: 500 }
    )
  }
}
