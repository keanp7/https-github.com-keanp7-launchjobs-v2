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
    const { candidate_id } = body

    const { data: skills, error: skillsError } = await supabase
      .from("skills_analyses")
      .select("hard_skills, soft_skills, domain_knowledge, safe_skills, at_risk_skills, hybrid_skills")
      .eq("candidate_id", candidate_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (skillsError) throw skillsError

    const { data: roles, error: rolesError } = await supabase
      .from("role_matches")
      .select("target_roles")
      .eq("candidate_id", candidate_id)
      .single()

    if (rolesError) throw rolesError

    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: PROMPTS.GAP_ANALYSIS.system,
      messages: [{
        role: "user",
        content: PROMPTS.GAP_ANALYSIS.buildUser(JSON.stringify(roles), JSON.stringify(skills)),
      }],
    })

    const raw = response.content[0].type === "text" ? response.content[0].text : ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      throw new Error(`AI returned invalid JSON: ${clean.substring(0, 200)}`)
    }

    const { error } = await supabase
      .from("gap_analyses")
      .upsert({
        candidate_id,
        gap_analysis: parsed.gap_analysis,
      }, { onConflict: "candidate_id" })

    if (error) throw error

    return NextResponse.json({ success: true, data: parsed })
  } catch (error: any) {
    console.error("Pipeline gap error:", error)
    return NextResponse.json({ error: "Pipeline failed", details: error?.message }, { status: 500 })
  }
}
