"use client"

import { ResumeBuilder } from "@/components/pipeline/ResumeBuilder"

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PDF Resume Builder</h1>
        <p className="mt-1 text-muted-foreground">
          Turn your skills profile into a downloadable resume in seconds.
        </p>
      </div>
      <ResumeBuilder />
    </div>
  )
}
