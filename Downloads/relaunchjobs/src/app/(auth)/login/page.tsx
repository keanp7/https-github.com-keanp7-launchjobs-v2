"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useLang } from "@/contexts/LangContext"
import { LangToggle } from "@/components/landing/LangToggle"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push("/intake")
    router.refresh()
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
          {t("auth.login.title")}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", margin: "0 0 28px 0" }}>
          {t("auth.login.subtitle")}
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
          {googleLoading ? "Redirecting…" : t("auth.login.googleBtn")}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{t("auth.login.orWith")}</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              {t("auth.login.email")}
            </label>
            <input
              type="email"
              placeholder={t("auth.login.emailPlaceholder")}
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
              {t("auth.login.password")}
            </label>
            <input
              type="password"
              placeholder={t("auth.login.passwordPlaceholder")}
              value={password}
              onChange={e => setPassword(e.target.value)}
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
              transition: "opacity 0.15s",
            }}
          >
            {loading ? t("auth.login.loading") : t("auth.login.submit")}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "20px" }}>
          {t("auth.login.noAccount")}{" "}
          <Link href="/signup" style={{ color: "#1a3a6b", fontWeight: 600, textDecoration: "none" }}>
            {t("auth.login.signUpFree")}
          </Link>
        </p>
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
