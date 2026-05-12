"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { RoleGapAnalysis } from "@/types/pipeline"

const PRIORITY_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  important: "secondary",
  "nice-to-have": "outline",
}

export function GapDisplay({ roleGap }: { roleGap: RoleGapAnalysis }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness for {roleGap.role}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>You&apos;re already there</span>
              <span className="font-semibold">{roleGap.readiness_percent}%</span>
            </div>
            <Progress value={roleGap.readiness_percent} />
          </div>
          <div className="flex flex-wrap gap-2">
            {roleGap.already_have.map((s) => (
              <span key={s} className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">{s}</span>
            ))}
          </div>
          {roleGap.biggest_barrier && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
              <strong>Biggest barrier:</strong> {roleGap.biggest_barrier}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gaps to Close</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roleGap.gaps.map((g) => (
            <div key={g.skill} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{g.skill}</span>
                <Badge variant={PRIORITY_VARIANT[g.priority]}>{g.priority}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                <span>{g.learn_time_days}d to learn</span>
                <span>· Proof: {g.proof_type}</span>
              </div>
              <p className="text-xs text-blue-700">Free resource: {g.free_resource}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
