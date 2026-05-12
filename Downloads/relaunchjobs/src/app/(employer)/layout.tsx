import { Navbar } from "@/components/shared/Navbar"

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  )
}
