"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { CandidateIntake, ExtractResult, RiskResult, MatchResult, GapResult, LearningResult, ProfileResult } from "@/types/pipeline"

export function ProfileCard() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const stored = sessionStorage.getItem("pipeline_profile")
      if (stored) { setProfile(JSON.parse(stored)); setLoading(false); return }

      const intake: CandidateIntake = JSON.parse(sessionStorage.getItem("pipeline_intake") ?? "{}")
      const extract: ExtractResult = JSON.parse(sessionStorage.getItem("pipeline_extract") ?? "{}")
      const risk: RiskResult = JSON.parse(sessionStorage.getItem("pipeline_risk") ?? "{}")
      const match: MatchResult = JSON.parse(sessionStorage.getItem("pipeline_match") ?? "{}")
      const gap: GapResult = JSON.parse(sessionStorage.getItem("pipeline_gap") ?? "{}")
      const learning: LearningResult = JSON.parse(sessionStorage.getItem("pipeline_learning") ?? "{}")

      const res = await fetch("/api/pipeline/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, extract, risk, match, gap, learning }),
      })
      const data: ProfileResult = await res.json()
      sessionStorage.setItem("pipeline_profile", JSON.stringify(data))
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  function copyAll() {
    if (!profile) return
    const text = [
      profile.headline,
      "",
      profile.positioning_statement,
      "",
      "Top skills: " + profile.top_skills.join(", "),
      "",
      ...profile.proof_points.map((p) => `• ${p.claim} — ${p.evidence}`),
      "",
      profile.employer_pitch,
      "",
      "Open to: " + profile.open_to.join(", "),
    ].join("\n")
    copy(text, "Full profile")
  }

  if (loading) return <p className="text-muted-foreground animate-pulse">Writing your profile…</p>
  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Headline */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-base">Headline</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => copy(profile.headline, "Headline")}>Copy</Button>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-slate-900">{profile.headline}</p>
        </CardContent>
      </Card>

      {/* Positioning Statement */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-base">Positioning Statement</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => copy(profile.positioning_statement, "Positioning statement")}>Copy</Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-700">{profile.positioning_statement}</p>
        </CardContent>
      </Card>

      {/* Top Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.top_skills.map((s) => (
            <span key={s} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">{s}</span>
          ))}
        </CardContent>
      </Card>

      {/* Proof Points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proof Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.proof_points.map((p, i) => (
            <div key={i}>
              <p className="text-sm font-medium">{p.claim}</p>
              <p className="text-xs text-muted-foreground">{p.evidence}</p>
              {i < profile.proof_points.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Employer Pitch */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-base">Employer Pitch</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => copy(profile.employer_pitch, "Employer pitch")}>Copy</Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-blue-700 leading-relaxed">{profile.employer_pitch}</p>
        </CardContent>
      </Card>

      {/* Open To */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open To</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.open_to.map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{s}</span>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" variant="outline" onClick={copyAll}>
        Copy full profile
      </Button>
    </div>
  )
}
