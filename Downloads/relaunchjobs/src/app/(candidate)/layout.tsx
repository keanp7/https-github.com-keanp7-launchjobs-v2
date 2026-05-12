import { ProgressBar } from "@/components/shared/ProgressBar"

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProgressBar />
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  )
}
