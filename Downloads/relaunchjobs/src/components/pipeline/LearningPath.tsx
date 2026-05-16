"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GapDisplay } from "./GapDisplay"
import type { LearningResult, RoleGapAnalysis } from "@/types/pipeline"

export function LearningPath() {
  const router = useRouter()
  const [topGap, setTopGap] = useState<RoleGapAnalysis | null>(null)
  const [learning, setLearning] = useState<LearningResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        // ── Auth ────────────────────────────────────────────────────────────
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log("[LearningPath] user:", user?.id, userError?.message)
        if (!user) { setError("Not signed in. Please sign in and try again."); setLoading(false); return }

        // ── Candidate ───────────────────────────────────────────────────────
        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id, old_job_title, years_experience, industry, displacement_reason, extra_context")
          .eq("id", user.id)
          .single()
        console.log("[LearningPath] candidate:", candidate?.id, candidateError?.message)
        if (!candidate) { setError("No candidate profile found. Please complete the intake form."); setLoading(false); return }

        // ── Gap analysis ────────────────────────────────────────────────────
        const { data: gapRow, error: gapError } = await supabase
          .from("gap_analyses")
          .select("gap_analysis")
          .eq("candidate_id", candidate.id)
          .single()
        console.log("[LearningPath] gap_analyses:", gapRow ? `${gapRow.gap_analysis?.length} roles` : "null", gapError?.message)

        if (gapRow?.gap_analysis?.length) {
          const targetRole = sessionStorage.getItem("pipeline_target_role")
          const match = gapRow.gap_analysis.find(
            (g: any) => targetRole && g.role.toLowerCase() === targetRole.toLowerCase()
          ) ?? gapRow.gap_analysis[0]
          setTopGap(match)
        }

        // ── Learning path — read from DB first ──────────────────────────────
        const { data: lpRow, error: lpError } = await supabase
          .from("learning_paths")
          .select("target_role, total_weeks, weekly_hours, weeks, final_proof, interview_angle")
          .eq("candidate_id", candidate.id)
          .single()
        console.log("[LearningPath] learning_paths DB row:", lpRow ? `${lpRow.total_weeks}wk sprint` : "null", lpError?.message)

        if (lpRow?.weeks?.length) {
          setLearning(lpRow as LearningResult)
          setLoading(false)
          return
        }

        // ── No learning path yet — trigger API ──────────────────────────────
        console.log("[LearningPath] no learning path in DB — calling API with candidate_id:", candidate.id)
        const intake = {
          old_job_title: candidate.old_job_title,
          years_experience: candidate.years_experience,
          industry: candidate.industry,
          displacement_reason: candidate.displacement_reason,
          extra_context: candidate.extra_context ?? "",
        }
        const gap = { gap_analysis: gapRow?.gap_analysis ?? [] }

        const res = await fetch("/api/pipeline/learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidate_id: candidate.id, gap, intake }),
        })
        const json = await res.json()
        console.log("[LearningPath] API response:", json?.data?.total_weeks, "weeks, fallback:", json?.fallback)

        if (!res.ok) throw new Error(json?.error ?? "Learning API failed")

        if (json.fallback) setIsFallback(true)
        setLearning(json.data as LearningResult)
      } catch (err: any) {
        console.error("[LearningPath] error:", err?.message)
        setError(err?.message ?? "Something went wrong loading your learning sprint.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <p className="text-muted-foreground animate-pulse">Building your week-by-week sprint… (up to 60s)</p>
    </div>
  )

  if (error) {
    return (
      <div style={{ padding: "32px", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
        <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "8px" }}>Could not load learning sprint</p>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{error}</p>
        <button
          onClick={() => router.push("/roles")}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#1a3a6b", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back to roles
        </button>
      </div>
    )
  }

  if (!learning) return null

  return (
    <div className="space-y-6">
      {isFallback && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
          <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
            ⚡ We generated a standard 4-week job search sprint because the AI took too long on your specific plan. You can still use it — it covers all the essentials.
          </p>
        </div>
      )}

      {topGap && <GapDisplay roleGap={topGap} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {learning.total_weeks}-Week Sprint · {learning.weekly_hours}h/week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(learning.weeks ?? []).map((week) => (
            <div key={week.week} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="shrink-0 font-mono text-xs font-bold text-blue-600 bg-blue-50 rounded px-2 py-0.5">
                  Week {week.week}
                </span>
                <span className="font-medium text-sm">{week.focus}</span>
              </div>
              <p className="text-xs text-muted-foreground">{week.goal}</p>
              <div className="space-y-1">
                {(week.resources ?? []).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.cost === "free" ? "outline" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {r.cost}
                      </Badge>
                      <span>{r.name}</span>
                      <span className="text-muted-foreground">· {r.platform} · {r.hours}h</span>
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-green-700">✓ Milestone: {week.milestone}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm font-medium">Final proof of work</p>
          <p className="text-sm text-slate-700">{learning.final_proof}</p>
          <p className="text-sm font-medium pt-2">Interview angle</p>
          <p className="text-sm text-slate-700">{learning.interview_angle}</p>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => router.push("/profile")}>
        Build my skills profile →
      </Button>
    </div>
  )
}
