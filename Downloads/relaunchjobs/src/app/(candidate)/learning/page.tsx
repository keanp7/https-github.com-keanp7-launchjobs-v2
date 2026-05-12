import { LearningPath } from "@/components/pipeline/LearningPath"

export const metadata = { title: "Learning Sprint — RelaunchJobs" }

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Step 4: Your Learning Sprint</h1>
        <p className="mt-1 text-muted-foreground">
          A week-by-week plan to close your gaps and get hire-ready.
        </p>
      </div>
      <LearningPath />
    </div>
  )
}
