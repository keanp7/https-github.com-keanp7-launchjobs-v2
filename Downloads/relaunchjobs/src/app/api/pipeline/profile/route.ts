import { NextRequest, NextResponse } from "next/server"
import { getAnthropicClient, MODEL } from "@/lib/anthropic/client"
import { createClient } from "@/lib/supabase/server"
import { PROMPTS } from "@/lib/anthropic/prompts"
import type { CandidateIntake, ExtractResult, RiskResult, MatchResult, GapResult, LearningResult } from "@/types/pipeline"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { candidate_id, intake, extract, risk, match, gap, learning }: {
      candidate_id: string
      intake: CandidateIntake
      extract: ExtractResult
      risk: RiskResult
      match: MatchResult
      gap: GapResult
      learning: LearningResult
    } = body

    const allOutputs = { extract, risk, match, gap, learning }

    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: PROMPTS.BUILD_PROFILE.system,
      messages: [{
        role: "user",
        content: PROMPTS.BUILD_PROFILE.buildUser(
          JSON.stringify(allOutputs),
          JSON.stringify(intake)
        ),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(clean)

    const { error } = await supabase
      .from("candidate_profiles")
      .upsert({
        candidate_id,
        headline: parsed.headline,
        positioning_statement: parsed.positioning_statement,
        top_skills: parsed.top_skills,
        proof_points: parsed.proof_points,
        employer_pitch: parsed.employer_pitch,
        open_to: parsed.open_to,
      })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error("Pipeline profile error:", error)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
