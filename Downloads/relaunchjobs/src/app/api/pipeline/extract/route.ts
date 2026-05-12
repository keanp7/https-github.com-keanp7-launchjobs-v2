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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: PROMPTS.EXTRACT_SKILLS.system,
      messages: [{
        role: "user",
        content: PROMPTS.EXTRACT_SKILLS.buildUser(intake_data),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Pipeline extract error:", error)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
