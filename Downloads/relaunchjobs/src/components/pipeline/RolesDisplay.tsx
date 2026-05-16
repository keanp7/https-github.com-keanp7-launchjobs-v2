"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { TargetRole } from "@/types/pipeline"

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
        <Badge className={DEMAND_COLOR[role.market_demand] ?? "bg-gray-100 text-gray-800"}>
          {role.market_demand} demand
        </Badge>
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
  const [roles, setRoles] = useState<TargetRole[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log("[RolesDisplay] user:", user?.id, userError?.message)
        if (!user) { setError("Not signed in. Please sign in and try again."); setLoading(false); return }

        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("id", user.id)
          .single()
        console.log("[RolesDisplay] candidate:", candidate, candidateError?.message)
        if (!candidate) { setError("No candidate profile found. Please complete the intake form."); setLoading(false); return }

        const { data: roleMatch, error: matchError } = await supabase
          .from("role_matches")
          .select("target_roles")
          .eq("candidate_id", candidate.id)
          .single()
        console.log("[RolesDisplay] role_matches row:", JSON.stringify(roleMatch))
        console.log("[RolesDisplay] role_matches error:", matchError?.message)

        if (matchError || !roleMatch?.target_roles) {
          setError("No role matches found yet. Return to the intake form and complete the analysis.")
          setLoading(false)
          return
        }

        setRoles(roleMatch.target_roles)
      } catch (err: any) {
        console.error("[RolesDisplay] unexpected error:", err)
        setError(err?.message ?? "Something went wrong loading your roles.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleNext() {
    if (!selected) return
    sessionStorage.setItem("pipeline_target_role", selected)
    router.push("/learning")
  }

  if (loading) return <p className="text-muted-foreground animate-pulse">Loading your target roles…</p>

  if (error) {
    return (
      <div style={{ padding: "32px", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
        <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "8px" }}>Could not load roles</p>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{error}</p>
        <button
          onClick={() => router.push("/intake")}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#1a3a6b", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back to intake
        </button>
      </div>
    )
  }

  if (!roles || roles.length === 0) {
    return (
      <div style={{ padding: "32px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>No roles found. Please complete the full analysis first.</p>
        <button
          onClick={() => router.push("/intake")}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#1a3a6b", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back to intake
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Best-Fit Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.map((role) => (
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
        {selected ? `Build my gap analysis for "${selected}" →` : "Select a role to continue"}
      </Button>
    </div>
  )
}
