"use client"

import { usePathname } from "next/navigation"
import { Progress } from "@/components/ui/progress"

const STEPS: Record<string, number> = {
  "/intake": 20,
  "/analysis": 40,
  "/roles": 60,
  "/learning": 80,
  "/profile": 100,
}

export function ProgressBar() {
  const pathname = usePathname()
  const progress = STEPS[pathname] ?? 0

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="mx-auto max-w-3xl space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Career Relaunch Pipeline</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  )
}
