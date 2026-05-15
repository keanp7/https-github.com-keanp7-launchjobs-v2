"use client"

import { useLang } from "@/contexts/LangContext"
import { ProfileCard } from "@/components/pipeline/ProfileCard"

export default function ProfilePage() {
  const { t } = useLang()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("profile.subtitle")}</p>
      </div>
      <ProfileCard />
    </div>
  )
}
