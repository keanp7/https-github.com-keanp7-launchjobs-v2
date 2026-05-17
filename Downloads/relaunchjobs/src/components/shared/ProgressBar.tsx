"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { LangToggle } from "@/components/landing/LangToggle"
import { createClient } from "@/lib/supabase/client"

const STEPS: Record<string, { pct: number; label: string }> = {
  "/intake":   { pct: 20,  label: "Intake" },
  "/analysis": { pct: 40,  label: "Analysis" },
  "/roles":    { pct: 60,  label: "Roles" },
  "/learning": { pct: 80,  label: "Learning" },
  "/profile":  { pct: 100, label: "Profile" },
}

const ADMIN_EMAIL = "keanphil05@gmail.com"

export function ProgressBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const step     = STEPS[pathname]
  const progress = step?.pct ?? 0
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user?.email?.toLowerCase() === ADMIN_EMAIL) setIsAdmin(true)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header style={{ borderBottom: "1px solid #e5e7eb", background: "white", position: "sticky", top: 0, zIndex: 50 }}>
      {/* Top row: brand + lang + sign out */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", maxWidth: "768px", margin: "0 auto" }}>
        <span
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#1a3a6b", cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          RelaunchJobs
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <LangToggle />
          {isAdmin && (
            <a
              href="/admin"
              style={{ fontSize: "12px", color: "#2563eb", fontWeight: 500, textDecoration: "none", padding: "4px 8px", border: "1px solid #dbeafe", borderRadius: "6px", background: "#eff6ff" }}
            >
              Admin
            </a>
          )}
          <button
            onClick={handleSignOut}
            style={{ fontSize: "12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Progress row */}
      {progress > 0 && (
        <div style={{ padding: "6px 20px 10px", maxWidth: "768px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>
            <span>Career Relaunch Pipeline</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </header>
  )
}
