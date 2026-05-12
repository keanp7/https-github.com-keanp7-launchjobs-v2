import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import type { ExtractResult } from "@/types/pipeline"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, extract, industry }: {
      candidate_id: string
      extract: ExtractResult
      industry: string
    } = body

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: PROMPTS.RISK_SCORE.system,
      messages: [{
        role: "user",
        content: PROMPTS.RISK_SCORE.buildUser(JSON.stringify(extract), industry),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { error } = await supabase
      .from("risk_analyses")
      .upsert({
        candidate_id,
        safe_skills: parsed.safe_skills,
        at_risk_skills: parsed.at_risk_skills,
        hybrid_skills: parsed.hybrid_skills,
      })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error("Pipeline risk error:", error)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
