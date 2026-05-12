import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import type { CandidateIntake, GapResult } from "@/types/pipeline"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, gap, intake }: {
      candidate_id: string
      gap: GapResult
      intake: CandidateIntake
    } = body

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: PROMPTS.LEARNING_PATH.system,
      messages: [{
        role: "user",
        content: PROMPTS.LEARNING_PATH.buildUser(
          JSON.stringify(gap),
          JSON.stringify(intake)
        ),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { error } = await supabase
      .from("learning_paths")
      .upsert({
        candidate_id,
        target_role: parsed.target_role,
        total_weeks: parsed.total_weeks,
        weekly_hours: parsed.weekly_hours,
        weeks: parsed.weeks,
        final_proof: parsed.final_proof,
        interview_angle: parsed.interview_angle,
      })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error("Pipeline learning error:", error)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
