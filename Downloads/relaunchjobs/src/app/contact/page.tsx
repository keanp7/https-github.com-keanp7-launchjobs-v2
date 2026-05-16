"use client"

import { useState } from "react"
import Link from "next/link"
import { Playfair_Display, Outfit, DM_Mono } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"] })
const outfit = Outfit({ subsets: ["latin"] })
const mono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"] })

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) return
    setStatus("loading")
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "support@relaunchjobs.app",
          subject: `Contact form: ${name}`,
          html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
        }),
      })
      if (!res.ok) throw new Error("failed")
      setStatus("success")
      setName("")
      setEmail("")
      setMessage("")
    } catch {
      setStatus("error")
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
    backgroundColor: "#fafaf8",
    color: "#111827",
  }

  return (
    <div className={outfit.className} style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #e2e8f0", padding: "0 5%", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" className={playfair.className} style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a6b", textDecoration: "none" }}>
          RelaunchJobs
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none" }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "56px 5% 80px" }}>
        {/* Header */}
        <p className={mono.className} style={{ fontSize: "11px", color: "#c9952a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
          Contact us
        </p>
        <h1 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#1a3a6b", marginBottom: "12px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          We&apos;re here to help.
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280", lineHeight: 1.7, marginBottom: "40px" }}>
          Have a question, feedback, or a data request? Send us a message — we respond within 24 hours.
          You can also email us directly at{" "}
          <a href="mailto:support@relaunchjobs.app" style={{ color: "#1a3a6b", fontWeight: 600 }}>
            support@relaunchjobs.app
          </a>
          .
        </p>

        {status === "success" ? (
          <div style={{ background: "linear-gradient(135deg, #e8f5ef, #f0fdf4)", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>✓</div>
            <h2 className={playfair.className} style={{ fontSize: "22px", color: "#1a6b4a", marginBottom: "8px" }}>Message sent.</h2>
            <p style={{ fontSize: "15px", color: "#4a5568", lineHeight: 1.6 }}>
              We received your message and will reply within 24 hours to <strong>{email || "your email"}</strong>.
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{ marginTop: "24px", padding: "10px 22px", background: "#1a3a6b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What can we help you with?"
                required
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
              />
            </div>

            {status === "error" && (
              <p style={{ fontSize: "13px", color: "#dc2626", margin: 0 }}>
                Something went wrong. Please email us directly at{" "}
                <a href="mailto:support@relaunchjobs.app" style={{ color: "#dc2626" }}>support@relaunchjobs.app</a>.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "14px 28px", background: "#1a3a6b", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                transition: "background 0.15s",
              }}
            >
              {status === "loading" ? "Sending…" : "Send message →"}
            </button>

            <p className={mono.className} style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", letterSpacing: "0.04em" }}>
              🔒 We never share your message with third parties.
            </p>
          </form>
        )}

        {/* Footer mini */}
        <div style={{ marginTop: "56px", paddingTop: "28px", borderTop: "1px solid #f0ede6", display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>Terms</Link>
          <a href="mailto:support@relaunchjobs.app" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>support@relaunchjobs.app</a>
        </div>
      </div>
    </div>
  )
}
