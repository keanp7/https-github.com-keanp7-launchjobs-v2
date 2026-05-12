"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExtractResult, RiskResult, CandidateIntake } from "@/types/pipeline"

const PROFICIENCY_COLOR: Record<string, string> = {
  expert: "bg-blue-100 text-blue-800",
  intermediate: "bg-slate-100 text-slate-700",
  basic: "bg-zinc-100 text-zinc-600",
}

const DEPTH_COLOR: Record<string, string> = {
  deep: "bg-purple-100 text-purple-800",
  moderate: "bg-indigo-100 text-indigo-700",
  surface: "bg-gray-100 text-gray-600",
}

export function SkillsDisplay() {
  const router = useRouter()
  const [extract, setExtract] = useState<ExtractResult | null>(null)
  const [risk, setRisk] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const storedExtract = sessionStorage.getItem("pipeline_extract")
      const storedIntake = sessionStorage.getItem("pipeline_intake")
      if (!storedExtract || !storedIntake) { router.push("/intake"); return }

      const extractData: ExtractResult = JSON.parse(storedExtract)
      const intake: CandidateIntake = JSON.parse(storedIntake)
      setExtract(extractData)

      const storedRisk = sessionStorage.getItem("pipeline_risk")
      if (storedRisk) {
        setRisk(JSON.parse(storedRisk))
        setLoading(false)
        return
      }

      const res = await fetch("/api/pipeline/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extract: extractData, industry: intake.industry }),
      })
      const riskData: RiskResult = await res.json()
      sessionStorage.setItem("pipeline_risk", JSON.stringify(riskData))
      setRisk(riskData)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return <p className="text-muted-foreground animate-pulse">Analyzing your skills and market position…</p>
  }
  if (!extract || !risk) return null

  return (
    <div className="space-y-6">
      {/* Hard Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hard Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {extract.hard_skills.map((s) => (
            <span key={s.skill} className={`rounded-full px-3 py-1 text-xs font-medium ${PROFICIENCY_COLOR[s.proficiency]}`}>
              {s.skill}
              <span className="ml-1 opacity-60">· {s.proficiency}</span>
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Soft Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Soft Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {extract.soft_skills.map((s) => (
            <div key={s.skill} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 font-medium">{s.skill}</span>
              <span className="text-muted-foreground">— {s.evidence}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Domain Knowledge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domain Knowledge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {extract.domain_knowledge.map((d) => (
            <span key={d.area} className={`rounded-full px-3 py-1 text-xs font-medium ${DEPTH_COLOR[d.depth]}`}>
              {d.area}
              <span className="ml-1 opacity-60">· {d.depth}</span>
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Hidden Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hidden Strengths</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {extract.hidden_strengths.map((h) => (
            <div key={h.strength} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 font-medium text-green-700">{h.strength}</span>
              <span className="text-muted-foreground">— inferred from: {h.inferred_from}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Displacement Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Safe Skills</p>
            <div className="flex flex-wrap gap-2">
              {risk.safe_skills.map((s) => (
                <span key={s.skill} className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                  {s.skill}
                  <Badge variant="outline" className="ml-2 text-[10px] border-green-400 text-green-700">
                    {s.market_demand} demand
                  </Badge>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">At Risk</p>
            <div className="space-y-1">
              {risk.at_risk_skills.map((s) => (
                <div key={s.skill} className="flex items-center justify-between text-sm">
                  <span className="text-red-700">{s.skill}</span>
                  <span className="text-xs text-muted-foreground">{s.timeline}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Hybrid — AI Multipliers</p>
            <div className="space-y-1">
              {risk.hybrid_skills.map((s) => (
                <div key={s.skill} className="flex items-center justify-between text-sm">
                  <span>{s.skill}</span>
                  <span className="text-xs text-blue-600">+ {s.ai_tool_pairing}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => router.push("/roles")}>
        See my target roles →
      </Button>
    </div>
  )
}
