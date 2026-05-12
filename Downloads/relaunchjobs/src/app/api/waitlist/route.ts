import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, language, source } = await request.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, language, source })

    if (error && error.code === "23505") {
      return NextResponse.json({ success: true, message: "Already on list" })
    }

    if (error) throw error

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "RelaunchJobs <noreply@relaunchjobs.com>",
      to: email,
      subject: "You're on the RelaunchJobs waitlist",
      html: `
        <p>Hey,</p>
        <p>You're on the list. We'll reach out as soon as your spot opens up.</p>
        <p>In the meantime — if you were laid off or displaced and need help figuring out your next move, reply to this email. We read every one.</p>
        <p>— The RelaunchJobs team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Waitlist error:", error)
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
  }
}
