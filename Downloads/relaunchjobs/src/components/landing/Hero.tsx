"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function Hero() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      toast.success(data.message)
      setEmail("")
    } else {
      toast.error(data.error ?? "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1 text-sm font-medium text-blue-300">
          AI-Powered Career Transitions
        </span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Your skills are worth more
          <br />
          than your job title.
        </h1>
        <p className="mt-6 text-lg text-slate-300 sm:text-xl">
          Tell us where you are. We extract your transferable skills, score your market risk,
          find your best-fit roles, and hand you a week-by-week plan to get there.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.push("/signup")}
          >
            Start free — takes 5 min
          </Button>
        </div>
        <form
          onSubmit={handleWaitlist}
          className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
        >
          <Input
            type="email"
            placeholder="Join the waitlist"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-xs bg-white/10 text-white placeholder:text-slate-400 border-white/20"
            required
          />
          <Button type="submit" variant="outline" disabled={loading} className="text-white border-white/30 hover:bg-white/10">
            {loading ? "Joining…" : "Notify me"}
          </Button>
        </form>
      </div>
    </section>
  )
}
