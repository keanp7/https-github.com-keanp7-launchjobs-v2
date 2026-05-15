"use client"

import { useLang } from "@/contexts/LangContext"
import type { Lang } from "@/lib/i18n"
import { LANG_LABELS } from "@/lib/i18n"

export function LangToggle() {
  const { lang, setLang } = useLang()
  const langs = Object.keys(LANG_LABELS) as Lang[]

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: lang === l ? 700 : 400,
            color: lang === l ? "#1a3a6b" : "#6b7280",
            background: lang === l ? "#e8eef8" : "transparent",
            border: "1px solid",
            borderColor: lang === l ? "#1a3a6b" : "transparent",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: "0.05em",
          }}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  )
}
