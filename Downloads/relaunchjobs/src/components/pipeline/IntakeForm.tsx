"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { CandidateIntake } from "@/types/pipeline"

const DISPLACEMENT_REASONS = [
  "Layoff / redundancy",
  "Company closure",
  "Automation / AI replaced my role",
  "Outsourcing",
  "Industry decline",
  "Health / personal reasons",
  "Other",
]

export function IntakeForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CandidateIntake>({
    old_job_title: "",
    years_experience: 0,
    industry: "",
    displacement_reason: "",
    extra_context: "",
  })

  function set(field: keyof CandidateIntake, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/pipeline/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      toast.error("Failed to analyze your background. Please try again.")
      setLoading(false)
      return
    }

    const data = await res.json()
    sessionStorage.setItem("pipeline_intake", JSON.stringify(form))
    sessionStorage.setItem("pipeline_extract", JSON.stringify(data))

    router.push("/analysis")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="jobTitle">
                Job title <span className="text-red-500">*</span>
              </label>
              <Input
                id="jobTitle"
                placeholder="e.g. Loan Officer, Assembly Technician"
                value={form.old_job_title}
                onChange={(e) => set("old_job_title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="years">
                Years of experience <span className="text-red-500">*</span>
              </label>
              <Input
                id="years"
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 8"
                value={form.years_experience || ""}
                onChange={(e) => set("years_experience", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="industry">
              Industry <span className="text-red-500">*</span>
            </label>
            <Input
              id="industry"
              placeholder="e.g. Banking, Manufacturing, Retail, Healthcare"
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reason">
              Why are you looking to transition? <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.displacement_reason}
              onChange={(e) => set("displacement_reason", e.target.value)}
              required
            >
              <option value="" disabled>Select a reason…</option>
              {DISPLACEMENT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="context">
              Tell us more about your work{" "}
              <span className="text-muted-foreground font-normal">(optional but powerful)</span>
            </label>
            <textarea
              id="context"
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What did you actually do day-to-day? What did you build, manage, or fix? Any team sizes, tools, wins, or unique situations worth knowing?"
              value={form.extra_context}
              onChange={(e) => set("extra_context", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              More detail = more accurate skill map. 3–5 sentences is enough.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Extracting your skills…" : "Extract my skills →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
