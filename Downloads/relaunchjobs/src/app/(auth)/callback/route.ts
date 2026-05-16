import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.redirect(`${origin}/login?error=no_user`)

      // Ensure a candidate row exists for this user (new sign-ups)
      await supabase
        .from("candidates")
        .upsert(
          {
            id: user.id,
            onboarding_started: false,
            onboarding_completed: false,
            intake_step: 1,
          },
          { onConflict: "id", ignoreDuplicates: true }
        )

      // Fetch onboarding state
      const { data: candidate } = await supabase
        .from("candidates")
        .select("onboarding_started, onboarding_completed, intake_step")
        .eq("id", user.id)
        .single()

      // New user or never started → beginning of intake
      if (!candidate || !candidate.onboarding_started) {
        return NextResponse.redirect(`${origin}/intake`)
      }

      // Started but not finished → resume at saved step
      if (!candidate.onboarding_completed) {
        const step = Math.max(1, candidate.intake_step ?? 1)
        return NextResponse.redirect(`${origin}/intake?step=${step}`)
      }

      // Fully onboarded → send to analysis
      return NextResponse.redirect(`${origin}/analysis`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
