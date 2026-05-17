"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Testimonial = {
  id: string
  name: string
  role: string | null
  quote: string
  approved: boolean
  created_at: string
}

export function TestimonialsGrid({ initial }: { initial: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Testimonial>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")

  const filtered = items.filter(t =>
    filter === "all" ? true : filter === "approved" ? t.approved : !t.approved
  )

  async function toggleApproved(id: string, current: boolean) {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from("testimonials")
      .update({ approved: !current })
      .eq("id", id)
    if (!error) {
      setItems(prev => prev.map(t => t.id === id ? { ...t, approved: !current } : t))
    }
    setLoading(null)
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from("testimonials").delete().eq("id", id)
    if (!error) {
      setItems(prev => prev.filter(t => t.id !== id))
    }
    setLoading(null)
  }

  function startEdit(t: Testimonial) {
    setEditingId(t.id)
    setEditDraft({ name: t.name, role: t.role ?? "", quote: t.quote })
  }

  async function saveEdit(id: string) {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from("testimonials")
      .update({ name: editDraft.name, role: editDraft.role, quote: editDraft.quote })
      .eq("id", id)
    if (!error) {
      setItems(prev => prev.map(t => t.id === id ? { ...t, name: editDraft.name!, role: editDraft.role ?? null, quote: editDraft.quote! } : t))
      setEditingId(null)
    }
    setLoading(null)
  }

  const approvedCount = items.filter(t => t.approved).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Testimonials</h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
            {items.length} total · {approvedCount} approved · {items.length - approvedCount} pending
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f3f4f6", padding: "4px", borderRadius: "8px", width: "fit-content" }}>
        {(["all", "approved", "pending"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: "13px", fontWeight: 500, padding: "5px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
              background: filter === f ? "white" : "transparent",
              color: filter === f ? "#111827" : "#6b7280",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>No testimonials in this view.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {filtered.map(t => (
            <div
              key={t.id}
              style={{
                background: "white",
                border: `1px solid ${t.approved ? "#bbf7d0" : "#e5e7eb"}`,
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {editingId === t.id ? (
                /* Edit form */
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: "4px" }}>NAME</label>
                    <input
                      value={editDraft.name ?? ""}
                      onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: "4px" }}>ROLE</label>
                    <input
                      value={editDraft.role ?? ""}
                      onChange={e => setEditDraft(d => ({ ...d, role: e.target.value }))}
                      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: "4px" }}>QUOTE</label>
                    <textarea
                      value={editDraft.quote ?? ""}
                      onChange={e => setEditDraft(d => ({ ...d, quote: e.target.value }))}
                      rows={4}
                      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => saveEdit(t.id)}
                      disabled={loading === t.id}
                      style={{ flex: 1, padding: "7px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                    >
                      {loading === t.id ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ flex: 1, padding: "7px", background: "white", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display */
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: "#111827", margin: 0 }}>{t.name}</p>
                      {t.role && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>{t.role}</p>}
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "99px", flexShrink: 0,
                      background: t.approved ? "#d1fae5" : "#f3f4f6",
                      color: t.approved ? "#059669" : "#6b7280",
                    }}>
                      {t.approved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </p>

                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                    <button
                      onClick={() => toggleApproved(t.id, t.approved)}
                      disabled={loading === t.id}
                      style={{
                        flex: 1, padding: "6px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", cursor: "pointer",
                        background: t.approved ? "#f3f4f6" : "#2563eb",
                        color: t.approved ? "#374151" : "white",
                      }}
                    >
                      {loading === t.id ? "…" : t.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      style={{ flex: 1, padding: "6px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "1px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(t.id)}
                      disabled={loading === t.id}
                      style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "6px", border: "1px solid #fecaca", background: "white", color: "#dc2626", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
