"use client"

import { useLang } from "@/contexts/LangContext"
import { RolesDisplay } from "@/components/pipeline/RolesDisplay"

export default function RolesPage() {
  const { t } = useLang()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("roles.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("roles.subtitle")}</p>
      </div>
      <RolesDisplay />
    </div>
  )
}
