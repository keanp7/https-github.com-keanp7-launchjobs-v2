"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function CTASection() {
  const router = useRouter()

  return (
    <section className="bg-slate-900 px-4 py-24 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Stop waiting. Start relaunching.
        </h2>
        <p className="mt-4 text-slate-300">
          Five minutes of input. A full career roadmap as output. Free to start.
        </p>
        <Button
          size="lg"
          className="mt-8"
          onClick={() => router.push("/signup")}
        >
          Build my career roadmap →
        </Button>
      </div>
    </section>
  )
}
