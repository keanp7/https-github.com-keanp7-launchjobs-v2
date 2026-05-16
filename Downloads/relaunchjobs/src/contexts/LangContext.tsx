"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Lang } from "@/lib/i18n"
import { translations, t as tFn, BROWSER_LANG_MAP } from "@/lib/i18n"

const STORAGE_KEY = "rj_lang"

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (path) => path,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && stored in translations) {
      setLangState(stored)
      return
    }
    // Auto-detect browser language, fall back to "en"
    const browserLang = navigator.language
    const exact = BROWSER_LANG_MAP[browserLang]
    const prefix = BROWSER_LANG_MAP[browserLang.split("-")[0]]
    const detected = exact ?? prefix ?? "en"
    if (detected !== "en") setLangState(detected)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  function t(path: string, vars?: Record<string, string | number>) {
    return tFn(lang, path, vars)
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
