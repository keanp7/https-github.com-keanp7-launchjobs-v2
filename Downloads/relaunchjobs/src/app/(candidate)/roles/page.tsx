import { RolesDisplay } from "@/components/pipeline/RolesDisplay"

export const metadata = { title: "Target Roles — RelaunchJobs" }

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Step 3: Target Roles</h1>
        <p className="mt-1 text-muted-foreground">
          Your best-fit roles — both adjacent moves and bold pivots.
        </p>
      </div>
      <RolesDisplay />
    </div>
  )
}
