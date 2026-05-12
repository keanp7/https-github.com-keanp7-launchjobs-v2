import { ProfileCard } from "@/components/pipeline/ProfileCard"

export const metadata = { title: "Your Skills Profile — RelaunchJobs" }

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Step 5: Your Skills Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your AI-generated professional profile — ready to use on LinkedIn and job applications.
        </p>
      </div>
      <ProfileCard />
    </div>
  )
}
