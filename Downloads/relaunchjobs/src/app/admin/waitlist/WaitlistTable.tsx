"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type WaitlistEntry = {
  id: string
  email: string
  language: string | null
  source: string | null
  created_at: string
  contacted_at: string | null
}

export function WaitlistTable({ initial }: { initial: WaitlistEntry[] }) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initial)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = entries.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.source ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.language ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function markContacted(id: string) {
    setLoading(id)
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("waitlist")
      .update({ contacted_at: now })
      .eq("id", id)
    if (!error) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, contacted_at: now } : e))
    }
    setLoading(null)
  }

  async function unmarkContacted(id: string) {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from("waitlist")
      .update({ contacted_at: null })
      .eq("id", id)
    if (!error) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, contacted_at: null } : e))
    }
    setLoading(null)
  }

  function exportCSV() {
    const rows = [
      ["Email", "Language", "Source", "Signed Up", "Contacted"],
      ...filtered.map(e => [
        e.email,
        e.language ?? "",
        e.source ?? "",
        e.created_at ? new Date(e.created_at).toLocaleDateString() : "",
        e.contacted_at ? new Date(e.contacted_at).toLocaleDateString() : "",
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const contactedCount = entries.filter(e => e.contacted_at).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Waitlist</h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
            {entries.length} total · {contactedCount} contacted · {entries.length - contactedCount} pending
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{ fontSize: "13px", fontWeight: 500, color: "#374151", padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white", cursor: "pointer" }}
        >
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by email, source, or language…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "320px", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "6px",
            fontSize: "13px", color: "#111827", outline: "none", background: "white",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              {["Email", "Language", "Source", "Signed Up", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#6b7280", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                  {search ? "No results match your search." : "No waitlist entries yet."}
                </td>
              </tr>
            ) : (
              filtered.map(entry => (
                <tr key={entry.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", color: "#111827", fontWeight: 500 }}>{entry.email}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{entry.language || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{entry.source || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "12px" }}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {entry.contacted_at ? (
                      <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "99px", background: "#d1fae5", color: "#059669" }}>
                        Contacted
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "99px", background: "#f3f4f6", color: "#6b7280" }}>
                        Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {entry.contacted_at ? (
                      <button
                        onClick={() => unmarkContacted(entry.id)}
                        disabled={loading === entry.id}
                        style={{ fontSize: "12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {loading === entry.id ? "…" : "Undo"}
                      </button>
                    ) : (
                      <button
                        onClick={() => markContacted(entry.id)}
                        disabled={loading === entry.id}
                        style={{ fontSize: "12px", color: "#2563eb", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {loading === entry.id ? "…" : "Mark contacted"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
