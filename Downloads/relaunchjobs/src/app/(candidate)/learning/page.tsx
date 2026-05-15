"use client"

import { useLang } from "@/contexts/LangContext"
import { LearningPath } from "@/components/pipeline/LearningPath"

export default function LearningPage() {
  const { t } = useLang()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("learning.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("learning.subtitle")}</p>
      </div>
      <LearningPath />
    </div>
  )
}
