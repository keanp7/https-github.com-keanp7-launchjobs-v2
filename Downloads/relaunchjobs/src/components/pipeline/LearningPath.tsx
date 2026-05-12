"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GapDisplay } from "./GapDisplay"
import type { CandidateIntake, ExtractResult, RiskResult, MatchResult, GapResult, LearningResult, RoleGapAnalysis } from "@/types/pipeline"

export function LearningPath() {
  const router = useRouter()
  const [topGap, setTopGap] = useState<RoleGapAnalysis | null>(null)
  const [learning, setLearning] = useState<LearningResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const targetRole = sessionStorage.getItem("pipeline_target_role")
      if (!targetRole) { router.push("/roles"); return }

      const intake: CandidateIntake = JSON.parse(sessionStorage.getItem("pipeline_intake") ?? "{}")
      const extract: ExtractResult = JSON.parse(sessionStorage.getItem("pipeline_extract") ?? "{}")
      const risk: RiskResult = JSON.parse(sessionStorage.getItem("pipeline_risk") ?? "{}")
      const match: MatchResult = JSON.parse(sessionStorage.getItem("pipeline_match") ?? "{}")

      // Gap analysis
      let gapData: GapResult
      const storedGap = sessionStorage.getItem("pipeline_gap")
      if (storedGap) {
        gapData = JSON.parse(storedGap)
      } else {
        const r = await fetch("/api/pipeline/gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match, extract, risk }),
        })
        gapData = await r.json()
        sessionStorage.setItem("pipeline_gap", JSON.stringify(gapData))
      }

      // Find the gap entry for the selected role
      const roleGap = gapData.gap_analysis.find(
        (g) => g.role.toLowerCase() === targetRole.toLowerCase()
      ) ?? gapData.gap_analysis[0]
      setTopGap(roleGap)

      // Learning path
      let learningData: LearningResult
      const storedLearning = sessionStorage.getItem("pipeline_learning")
      if (storedLearning) {
        learningData = JSON.parse(storedLearning)
      } else {
        const r2 = await fetch("/api/pipeline/learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gap: gapData, intake }),
        })
        learningData = await r2.json()
        sessionStorage.setItem("pipeline_learning", JSON.stringify(learningData))
      }
      setLearning(learningData)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <p className="text-muted-foreground animate-pulse">Building your week-by-week sprint…</p>
  if (!topGap || !learning) return null

  return (
    <div className="space-y-6">
      <GapDisplay roleGap={topGap} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {learning.total_weeks}-Week Sprint · {learning.weekly_hours}h/week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {learning.weeks.map((week) => (
            <div key={week.week} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="shrink-0 font-mono text-xs font-bold text-blue-600 bg-blue-50 rounded px-2 py-0.5">
                  Week {week.week}
                </span>
                <span className="font-medium text-sm">{week.focus}</span>
              </div>
              <p className="text-xs text-muted-foreground">{week.goal}</p>
              <div className="space-y-1">
                {week.resources.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.cost === "free" ? "outline" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {r.cost}
                      </Badge>
                      <span>{r.name}</span>
                      <span className="text-muted-foreground">· {r.platform} · {r.hours}h</span>
                    </div>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-green-700">
                ✓ Milestone: {week.milestone}
              </p>
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
