import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  // Stats
  const [
    { count: totalCandidates },
    { count: waitlistCount },
    { count: analysesCount },
    { count: profilesCount },
  ] = await Promise.all([
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
    supabase.from("skills_analyses").select("*", { count: "exact", head: true }),
    supabase.from("candidate_profiles").select("*", { count: "exact", head: true }),
  ])

  // Last 14 days of signups for chart
  const since = new Date()
  since.setDate(since.getDate() - 13)
  const { data: recentSignups } = await supabase
    .from("candidates")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })

  // Build chart data: 14 buckets
  const chartData: { label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const count = (recentSignups ?? []).filter(r => r.created_at?.slice(0, 10) === key).length
    chartData.push({ label, count })
  }
  const chartMax = Math.max(1, ...chartData.map(d => d.count))

  // Recent candidates for activity feed
  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("old_job_title, industry, displacement_reason, onboarding_completed, created_at")
    .order("created_at", { ascending: false })
    .limit(8)

  // Displacement breakdown
  const { data: allCandidates } = await supabase
    .from("candidates")
    .select("displacement_reason")
  const reasons: Record<string, number> = {}
  for (const c of allCandidates ?? []) {
    const r = c.displacement_reason || "Unknown"
    reasons[r] = (reasons[r] ?? 0) + 1
  }
  const reasonEntries = Object.entries(reasons).sort((a, b) => b[1] - a[1])
  const reasonMax = Math.max(1, ...reasonEntries.map(e => e[1]))

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Dashboard</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>Overview of RelaunchJobs activity</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Users" value={totalCandidates ?? 0} delta={null} accent="#2563eb" />
        <StatCard label="Waitlist" value={waitlistCount ?? 0} delta={null} accent="#2563eb" />
        <StatCard label="Analyses Run" value={analysesCount ?? 0} delta={null} accent="#2563eb" />
        <StatCard label="Profiles Built" value={profilesCount ?? 0} delta={null} accent="#2563eb" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Signups chart */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>New Signups — Last 14 Days</h2>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(2, (d.count / chartMax) * 100)}%`,
                      background: d.count > 0 ? "#2563eb" : "#e5e7eb",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.3s",
                      minHeight: "2px",
                    }}
                    title={`${d.label}: ${d.count} signup${d.count !== 1 ? "s" : ""}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>{chartData[0]?.label}</span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>{chartData[chartData.length - 1]?.label}</span>
          </div>
        </div>

        {/* Displacement breakdown */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px" }}>Displacement Reasons</h2>
          {reasonEntries.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>No data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reasonEntries.map(([reason, count]) => (
                <div key={reason}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#374151", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reason}</span>
                    <span style={{ color: "#6b7280", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{count}</span>
                  </div>
                  <div style={{ height: "4px", background: "#f3f4f6", borderRadius: "2px" }}>
                    <div style={{ height: "4px", background: "#2563eb", borderRadius: "2px", width: `${(count / reasonMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Recent Signups</h2>
          <a href="/admin/waitlist" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>View waitlist →</a>
        </div>
        {(recentCandidates ?? []).length === 0 ? (
          <p style={{ fontSize: "13px", color: "#9ca3af" }}>No signups yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                {["Job Title", "Industry", "Reason", "Status", "Date"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0 8px 10px 0", color: "#6b7280", fontWeight: 500, fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentCandidates ?? []).map((c: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "10px 8px 10px 0", color: "#111827", fontWeight: 500 }}>{c.old_job_title || "—"}</td>
                  <td style={{ padding: "10px 8px 10px 0", color: "#6b7280" }}>{c.industry || "—"}</td>
                  <td style={{ padding: "10px 8px 10px 0", color: "#6b7280", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.displacement_reason || "—"}</td>
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "99px",
                      background: c.onboarding_completed ? "#d1fae5" : "#f3f4f6",
                      color: c.onboarding_completed ? "#059669" : "#6b7280",
                    }}>
                      {c.onboarding_completed ? "Complete" : "In progress"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 0", color: "#9ca3af", fontSize: "12px" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, accent = "#111827" }: {
  label: string
  value: number
  delta: number | null
  accent?: string
}) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
      <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 700, color: accent, margin: 0, letterSpacing: "-1px", fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
