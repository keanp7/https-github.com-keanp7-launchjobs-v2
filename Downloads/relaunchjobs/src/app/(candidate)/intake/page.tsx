import { IntakeForm } from "@/components/pipeline/IntakeForm"

export const metadata = { title: "Tell us about your background — RelaunchJobs" }

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Step 1: Your Background</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us where you are now. We&apos;ll do the rest.
        </p>
      </div>
      <IntakeForm />
    </div>
  )
}
