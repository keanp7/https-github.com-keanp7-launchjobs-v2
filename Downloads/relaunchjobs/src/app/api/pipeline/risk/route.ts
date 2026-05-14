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
      .select("id, hard_skills, soft_skills, domain_knowledge, hidden_strengths")
      .eq("candidate_id", candidate_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (fetchError) throw fetchError

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: PROMPTS.RISK_SCORE.system,
      messages: [{
        role: "user",
        content: PROMPTS.RISK_SCORE.buildUser(JSON.stringify({ hard_skills: existing.hard_skills, soft_skills: existing.soft_skills, domain_knowledge: existing.domain_knowledge, hidden_strengths: existing.hidden_strengths }), intake_data.industry),
      }],
    })

    console.log('RAW RISK RESPONSE:', response.content[0])
    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)
    console.log('PARSED RISK:', JSON.stringify(parsed, null, 2))
    console.log('SAFE SKILLS:', parsed?.safe_skills)

    const { error } = await supabase
      .from("skills_analyses")
      .update({
        safe_skills: parsed.safe_skills,
        at_risk_skills: parsed.at_risk_skills,
        hybrid_skills: parsed.hybrid_skills,
      })
      .eq("id", existing.id)

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error: any) {
    console.error("Pipeline risk error:", error)
    return NextResponse.json({ error: "Pipeline failed", details: error?.message }, { status: 500 })
  }
}
