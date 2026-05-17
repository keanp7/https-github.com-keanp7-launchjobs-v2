import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNav } from "./AdminNav"

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    redirect("/login?error=admin_only")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827", letterSpacing: "-0.2px" }}>
            RelaunchJobs
          </span>
          <div style={{ width: "1px", height: "18px", background: "#e5e7eb" }} />
          <AdminNav />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{user.email}</span>
          <a href="/" style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", padding: "4px 10px", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
            ← Site
          </a>
        </div>
      </header>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  )
}
