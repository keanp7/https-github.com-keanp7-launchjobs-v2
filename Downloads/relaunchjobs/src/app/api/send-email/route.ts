import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  const { to, subject, html } = await request.json()
  if (!to || !subject || !html) {
    return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "RelaunchJobs <noreply@relaunchjobs.com>",
    to,
    subject,
    html,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ id: data?.id })
}
