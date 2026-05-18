"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { ResumeData } from "./ResumeDocument"

// ── Dynamic import keeps @react-pdf/renderer off the server bundle ────────────
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
)

// Lazy-load the PDF document itself for the same reason
const ResumeDocumentLazy = dynamic(
  () => import("./ResumeDocument").then((m) => m.ResumeDocument),
  { ssr: false }
)

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  full_name: string
  phone: string
  city_state: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ResumeBuilder() {
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [form, setForm] = useState<FormState>({ full_name: "", phone: "", city_state: "" })
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PDF download link needs the browser — gate it behind mount
  useEffect(() => { setIsMounted(true) }, [])

  // ── Load user + pre-fill from existing profile ────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError("Not signed in."); setLoadingProfile(false); return }

        setUserEmail(user.email ?? "")

        const { data: candidate } = await supabase
          .from("candidates")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!candidate) { setError("No candidate profile found. Complete the intake form."); setLoadingProfile(false); return }

        setCandidateId(candidate.id)

        // Pre-fill name from auth metadata if available
        const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
        if (displayName) setForm((f) => ({ ...f, full_name: displayName }))
      } catch (err: any) {
        setError(err?.message ?? "Failed to load profile.")
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [])

  // ── Generate ──────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!candidateId) return
    if (!form.full_name.trim()) { toast.error("Please enter your full name."); return }

    setGenerating(true)
    setResumeData(null)
    setError(null)

    try {
      const res = await fetch("/api/pipeline/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, ...form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Resume generation failed.")
      setResumeData(json.data as ResumeData)
      toast.success("Resume ready — download below!")
    } catch (err: any) {
      console.error("[ResumeBuilder]", err?.message)
      setError(err?.message ?? "Something went wrong.")
      toast.error("Could not generate resume.")
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <p style={{ textAlign: "center", color: "#6b7280", padding: "32px" }} className="animate-pulse">
        Loading your profile…
      </p>
    )
  }

  if (error && !candidateId) {
    return (
      <div style={{ padding: "24px", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
        <p style={{ color: "#dc2626", fontWeight: 600 }}>Error</p>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Info card ───────────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 20px",
        background: "#eff6ff",
        borderRadius: "10px",
        border: "1px solid #bfdbfe",
      }}>
        <p style={{ fontSize: "14px", color: "#1d4ed8", margin: 0, lineHeight: 1.5 }}>
          <strong>How it works:</strong> We pull your skills, headline, and proof points from your profile,
          use Claude to format them into professional resume bullets, then generate a clean PDF you can download.
        </p>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "24px",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "18px" }}>
          Your contact info
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Email — read only */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="text"
              value={userEmail}
              disabled
              style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}
            />
          </div>

          {/* Full name */}
          <div>
            <label style={labelStyle}>
              Full name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Jean Alce"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* City / State */}
          <div>
            <label style={labelStyle}>City / State</label>
            <input
              type="text"
              placeholder="Miami, FL"
              value={form.city_state}
              onChange={(e) => setForm((f) => ({ ...f, city_state: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !candidateId}
          style={{
            marginTop: "22px",
            width: "100%",
            padding: "13px",
            background: generating ? "#93c5fd" : "#2563EB",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: generating ? "not-allowed" : "pointer",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            transition: "background 0.15s",
          }}
        >
          {generating ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "spin 0.75s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Formatting with Claude…
            </span>
          ) : "Generate PDF Resume"}
        </button>

        {error && (
          <p style={{ marginTop: "10px", fontSize: "13px", color: "#dc2626", textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>

      {/* ── Download card (shown after generation) ──────────────────────── */}
      {resumeData && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          border: "2px solid #2563EB",
          padding: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Resume ready
            </h2>
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
            Your resume has been formatted using your skills profile. Click below to download the PDF.
          </p>

          {/* Preview summary */}
          <div style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "18px",
            border: "1px solid #e2e8f0",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              {resumeData.full_name}
            </p>
            <p style={{ fontSize: "12px", color: "#2563EB", margin: "0 0 8px", fontWeight: 600 }}>
              {resumeData.headline}
            </p>
            <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 10px", lineHeight: 1.5 }}>
              {resumeData.professional_summary}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {resumeData.core_skills.slice(0, 6).map((skill) => (
                <span key={skill} style={{
                  background: "#eff6ff", color: "#1d4ed8",
                  borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 500,
                }}>
                  {skill}
                </span>
              ))}
              {resumeData.core_skills.length > 6 && (
                <span style={{ fontSize: "11px", color: "#94a3b8", padding: "2px 4px" }}>
                  +{resumeData.core_skills.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* PDF download link — client-only */}
          {isMounted ? (
            <PDFDownloadLink
              document={<ResumeDocumentLazy data={resumeData} />}
              fileName={`${resumeData.full_name.replace(/\s+/g, "_")}_Resume.pdf`}
              style={{ textDecoration: "none", display: "block" }}
            >
              {({ loading: pdfLoading }) => (
                <button
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: pdfLoading ? "#93c5fd" : "#2563EB",
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    cursor: pdfLoading ? "wait" : "pointer",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  {pdfLoading ? "Preparing PDF…" : "↓ Download PDF Resume"}
                </button>
              )}
            </PDFDownloadLink>
          ) : (
            <div style={{
              width: "100%", padding: "13px", background: "#e2e8f0",
              borderRadius: "8px", textAlign: "center", fontSize: "14px", color: "#64748b",
            }}>
              Preparing download…
            </div>
          )}

          <button
            onClick={() => { setResumeData(null); setGenerating(false) }}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Regenerate with different info
          </button>
        </div>
      )}
    </div>
  )
}

// ── Shared inline styles ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "5px",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  background: "white",
}
