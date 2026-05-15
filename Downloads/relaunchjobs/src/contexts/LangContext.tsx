"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Lang } from "@/lib/i18n"
import { translations, t as tFn } from "@/lib/i18n"

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
    if (stored && stored in translations) setLangState(stored)
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
