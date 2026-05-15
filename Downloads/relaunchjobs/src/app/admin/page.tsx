import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const TESTIMONIALS = [
  {
    name: "Maria S.",
    role: "Former Data Entry Clerk → Operations Coordinator",
    quote: "I didn't know what to do after my role was automated. RelaunchJobs gave me a clear path in 30 minutes.",
    date: "2026-03-12",
  },
  {
    name: "James T.",
    role: "Former Accounts Payable → Financial Analyst",
    quote: "The skill gap analysis was spot on. I landed interviews within 3 weeks of following the sprint.",
    date: "2026-04-01",
  },
  {
    name: "Priya N.",
    role: "Former Customer Support → UX Researcher",
    quote: "I had no idea my listening and empathy skills were actually research skills. The profile changed how I pitch myself.",
    date: "2026-04-18",
  },
]

// Admin access: check ADMIN_EMAILS env var (comma-separated)
function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    redirect("/login?error=admin_only")
  }

  // ── Fetch stats in parallel ───────────────────────────────────────────────
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

  // ── Recent signups ────────────────────────────────────────────────────────
  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("old_job_title, industry, displacement_reason, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={{ background: "#1a3a6b", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "white", margin: 0 }}>
            RelaunchJobs — Admin
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "4px 0 0" }}>{user.email}</p>
        </div>
        <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", textDecoration: "none" }}>← Public site</a>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <StatCard label="Total Users" value={totalCandidates ?? 0} icon="👤" color="#1a3a6b" />
          <StatCard label="Waitlist Signups" value={waitlistCount ?? 0} icon="📧" color="#c9952a" />
          <StatCard label="Completed Analyses" value={analysesCount ?? 0} icon="🧠" color="#7c3aed" />
          <StatCard label="Generated Profiles" value={profilesCount ?? 0} icon="📄" color="#1a6b4a" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Recent signups */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Recent Signups</h2>
            {(recentCandidates ?? []).length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>No signups yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0ede6" }}>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#6b7280", fontWeight: 600 }}>Job Title</th>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#6b7280", fontWeight: 600 }}>Industry</th>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#6b7280", fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentCandidates ?? []).map((c: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f8f8f8" }}>
                      <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 500 }}>{c.old_job_title || "—"}</td>
                      <td style={{ padding: "8px 0", color: "#6b7280" }}>{c.industry || "—"}</td>
                      <td style={{ padding: "8px 0", color: "#9ca3af" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Testimonials */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Testimonials</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ borderLeft: "3px solid #c9952a", paddingLeft: "14px" }}>
                  <p style={{ fontSize: "13px", color: "#374151", fontStyle: "italic", margin: "0 0 6px" }}>"{t.quote}"</p>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a3a6b", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Displacement breakdown */}
        <DisplacementBreakdown candidates={recentCandidates ?? []} />
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "36px", fontWeight: 800, color, lineHeight: 1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function DisplacementBreakdown({ candidates }: { candidates: any[] }) {
  const counts: Record<string, number> = {}
  for (const c of candidates) {
    const reason = c.displacement_reason || "Unknown"
    counts[reason] = (counts[reason] ?? 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null
  const max = entries[0][1]

  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: "24px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Displacement Reasons (Recent)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {entries.map(([reason, count]) => (
          <div key={reason}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "#374151" }}>{reason}</span>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>{count}</span>
            </div>
            <div style={{ height: "6px", background: "#f0ede6", borderRadius: "3px" }}>
              <div style={{ height: "6px", background: "#1a3a6b", borderRadius: "3px", width: `${(count / max) * 100}%`, transition: "width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
