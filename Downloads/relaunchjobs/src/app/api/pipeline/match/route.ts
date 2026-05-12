import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import type { CandidateIntake, ExtractResult, RiskResult } from "@/types/pipeline"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, intake, extract, risk }: {
      candidate_id: string
      intake: CandidateIntake
      extract: ExtractResult
      risk: RiskResult
    } = body

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: PROMPTS.MATCH_ROLES.system,
      messages: [{
        role: "user",
        content: PROMPTS.MATCH_ROLES.buildUser(
          JSON.stringify({ intake, extract }),
          JSON.stringify(risk)
        ),
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
      })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error("Pipeline match error:", error)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
