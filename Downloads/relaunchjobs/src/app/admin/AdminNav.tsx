"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/testimonials", label: "Testimonials" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav style={{ display: "flex", gap: "2px" }}>
      {LINKS.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              fontSize: "13px",
              fontWeight: active ? 600 : 500,
              color: active ? "#2563eb" : "#374151",
              padding: "5px 10px",
              borderRadius: "6px",
              textDecoration: "none",
              background: active ? "#eff6ff" : "transparent",
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
