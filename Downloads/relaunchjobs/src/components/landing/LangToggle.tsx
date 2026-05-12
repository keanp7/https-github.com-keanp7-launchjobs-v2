"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Lang = "en" | "fr" | "ht"

const LABELS: Record<Lang, string> = {
  en: "EN",
  fr: "FR",
  ht: "HT",
}

export function LangToggle() {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="flex gap-1">
      {(Object.keys(LABELS) as Lang[]).map((l) => (
        <Button
          key={l}
          variant={lang === l ? "default" : "ghost"}
          size="sm"
          className="px-2 py-1 text-xs"
          onClick={() => setLang(l)}
        >
          {LABELS[l]}
        </Button>
      ))}
    </div>
  )
}
