"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useLang } from "@/contexts/LangContext"
import { LangToggle } from "@/components/landing/LangToggle"

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/callback` },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    // If email confirmation is disabled, session exists immediately
    if (data.session) {
      router.push("/intake")
      router.refresh()
      return
    }
    setSent(true)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/callback` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
            {t("auth.signup.checkTitle")}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
            {t("auth.signup.checkDesc")} <strong>{email}</strong>. {t("auth.signup.checkDesc2")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "24px" }}>
      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#1a3a6b", textDecoration: "none" }}>
          RelaunchJobs
        </Link>
        <LangToggle />
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px 36px", marginTop: "60px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0", textAlign: "center" }}>
          {t("auth.signup.title")}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", margin: "0 0 28px 0" }}>
          {t("auth.signup.subtitle")}
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "11px 16px", borderRadius: "10px", border: "1.5px solid #d1d5db",
            background: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#374151",
            marginBottom: "20px", transition: "border-color 0.15s",
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = "#1a3a6b")}
          onMouseOut={e => (e.currentTarget.style.borderColor = "#d1d5db")}
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : t("auth.signup.googleBtn")}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{t("auth.signup.orWith")}</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              {t("auth.signup.email")}
            </label>
            <input
              type="email"
              placeholder={t("auth.signup.emailPlaceholder")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#1a3a6b")}
              onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              {t("auth.signup.password")}
            </label>
            <input
              type="password"
              placeholder={t("auth.signup.passwordPlaceholder")}
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#1a3a6b")}
              onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px", border: "none",
              background: "#1a3a6b", color: "white", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "20px" }}>
          {t("auth.signup.hasAccount")}{" "}
          <Link href="/login" style={{ color: "#1a3a6b", fontWeight: 600, textDecoration: "none" }}>
            {t("auth.signup.signIn")}
          </Link>
        </p>

        {/* Legal links */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
          <Link href="/terms" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>Privacy</Link>
          <Link href="/contact" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>Contact</Link>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: "1.5px solid #d1d5db", fontSize: "14px", outline: "none",
  transition: "border-color 0.15s", boxSizing: "border-box",
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.083 17.64 11.927 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
