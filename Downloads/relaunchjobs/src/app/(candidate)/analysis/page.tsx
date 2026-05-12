import { SkillsDisplay } from "@/components/pipeline/SkillsDisplay"

export const metadata = { title: "Skills Analysis — RelaunchJobs" }

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Step 2: Skills & Risk Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what we found — your transferable skills and market position.
        </p>
      </div>
      <SkillsDisplay />
    </div>
  )
}
