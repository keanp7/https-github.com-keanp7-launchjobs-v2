"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { ProfileResult } from "@/types/pipeline"

export function ProfileCard() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        // ── Auth ──────────────────────────────────────────────────────────────
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log("[ProfileCard] user:", user?.id, userError?.message)
        if (!user) { setError("Not signed in. Please sign in and try again."); setLoading(false); return }

        // ── Candidate ─────────────────────────────────────────────────────────
        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("profile_id", user.id)
          .single()
        console.log("[ProfileCard] candidate:", candidate?.id, candidateError?.message)
        if (!candidate) { setError("No candidate profile found. Please complete the intake form."); setLoading(false); return }

        // ── Read from DB first ────────────────────────────────────────────────
        const { data: profileRow, error: profileError } = await supabase
          .from("candidate_profiles")
          .select("headline, positioning_statement, top_skills, proof_points, employer_pitch, open_to")
          .eq("candidate_id", candidate.id)
          .single()
        console.log("[ProfileCard] candidate_profiles DB row:", profileRow ? "found" : "null", profileError?.message)

        if (profileRow?.headline) {
          setProfile(profileRow as ProfileResult)
          setLoading(false)
          return
        }

        // ── No profile yet — call API (route fetches all data from DB itself) ─
        console.log("[ProfileCard] no profile in DB — calling API with candidate_id:", candidate.id)
        const res = await fetch("/api/pipeline/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidate_id: candidate.id }),
        })
        const json = await res.json()
        console.log("[ProfileCard] API response fallback:", json?.fallback, "headline:", json?.data?.headline?.substring(0, 60))

        if (!res.ok) throw new Error(json?.error ?? "Profile API failed")

        if (json.fallback) setIsFallback(true)
        setProfile(json.data as ProfileResult)
      } catch (err: any) {
        console.error("[ProfileCard] error:", err?.message)
        setError(err?.message ?? "Something went wrong loading your profile.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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

  if (loading) return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <p className="text-muted-foreground animate-pulse">Building your skills profile… (up to 60s)</p>
    </div>
  )

  if (error) {
    return (
      <div style={{ padding: "32px", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
        <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "8px" }}>Could not load your profile</p>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{error}</p>
        <button
          onClick={() => router.push("/learning")}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#1a3a6b", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back to learning sprint
        </button>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      {isFallback && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
          <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
            ⚡ We generated a standard profile because the AI took too long on your specific one. You can still use it — edit it to match your actual experience.
          </p>
        </div>
      )}

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
