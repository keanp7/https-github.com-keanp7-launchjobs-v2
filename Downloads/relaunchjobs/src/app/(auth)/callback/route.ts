import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")
  const errorDesc = searchParams.get("error_description")

  console.log("🔐 [callback] received:", {
    code: code ? "present" : "missing",
    error: errorParam ?? null,
    error_description: errorDesc ?? null,
    origin,
  })

  if (errorParam) {
    console.error("❌ [callback] OAuth error from provider:", errorParam, errorDesc)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("❌ [callback] exchangeCodeForSession failed:", exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    console.log("✅ [callback] session established — userId:", session?.user?.id)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("❌ [callback] getUser returned no user after exchange")
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    // Fetch onboarding state (do NOT upsert here — old_job_title is NOT NULL
    // and we don't know it yet; the row is created in handleSubmit)
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("onboarding_started, onboarding_completed, intake_step")
      .eq("id", user.id)
      .single()

    console.log("👤 [callback] candidate row:", candidate ?? "none", candidateError?.message ?? "")

    // New user or never started → beginning of intake
    if (!candidate || !candidate.onboarding_started) {
      console.log("➡️ [callback] new user — redirecting to /intake")
      return NextResponse.redirect(`${origin}/intake`)
    }

    // Started but not finished → resume at saved step
    if (!candidate.onboarding_completed) {
      const step = Math.max(1, candidate.intake_step ?? 1)
      console.log(`➡️ [callback] incomplete onboarding — resuming at step ${step}`)
      return NextResponse.redirect(`${origin}/intake?step=${step}`)
    }

    // Fully onboarded → send to analysis
    console.log("➡️ [callback] onboarding complete — redirecting to /analysis")
    return NextResponse.redirect(`${origin}/analysis`)
  }

  console.error("❌ [callback] no code and no error — bad request")
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
