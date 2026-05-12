"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { MatchResult, TargetRole, CandidateIntake, ExtractResult, RiskResult } from "@/types/pipeline"

const DEMAND_COLOR: Record<string, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-red-100 text-red-800",
}

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: TargetRole
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-slate-900">{role.title}</span>
        <Badge className={DEMAND_COLOR[role.market_demand]}>{role.market_demand} demand</Badge>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Match score</span>
          <span className="font-medium">{role.match_score}%</span>
        </div>
        <Progress value={role.match_score} className="h-1.5" />
      </div>

      <p className="mt-2 text-xs text-slate-600">{role.why_realistic}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{role.avg_salary_range}</span>
        <span>· {role.time_to_hire_weeks}w to hire</span>
        <span>· {role.already_qualified_percent}% qualified now</span>
      </div>
    </button>
  )
}

export function RolesDisplay() {
  const router = useRouter()
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const stored = sessionStorage.getItem("pipeline_match")
      if (stored) { setMatch(JSON.parse(stored)); setLoading(false); return }

      const extract: ExtractResult = JSON.parse(sessionStorage.getItem("pipeline_extract") ?? "{}")
      const risk: RiskResult = JSON.parse(sessionStorage.getItem("pipeline_risk") ?? "{}")
      const intake: CandidateIntake = JSON.parse(sessionStorage.getItem("pipeline_intake") ?? "{}")

      const res = await fetch("/api/pipeline/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, extract, risk }),
      })
      const data: MatchResult = await res.json()
      sessionStorage.setItem("pipeline_match", JSON.stringify(data))
      setMatch(data)
      setLoading(false)
    }
    load()
  }, [])

  function handleNext() {
    if (!selected) return
    sessionStorage.setItem("pipeline_target_role", selected)
    router.push("/learning")
  }

  if (loading) return <p className="text-muted-foreground animate-pulse">Finding your fastest path to reemployment…</p>
  if (!match) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Best-Fit Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {match.target_roles.map((role) => (
            <RoleCard
              key={role.title}
              role={role}
              selected={selected === role.title}
              onSelect={() => setSelected(role.title)}
            />
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" disabled={!selected} onClick={handleNext}>
        {selected
          ? `Build my gap analysis for "${selected}" →`
          : "Select a role to continue"}
      </Button>
    </div>
  )
}
