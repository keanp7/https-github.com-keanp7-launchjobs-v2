import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { ResumeDocument } from "@/components/pipeline/ResumeDocument"
import type { ResumeData } from "@/components/pipeline/ResumeDocument"

export async function POST(request: NextRequest) {
  let data: ResumeData

  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!data?.full_name) {
    return NextResponse.json({ error: "full_name required" }, { status: 400 })
  }

  try {
    const pdfBuffer = await renderToBuffer(<ResumeDocument data={data} />)
    const filename = `${data.full_name.replace(/[^a-z0-9]/gi, "_")}_Resume.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error("[resume/pdf] renderToBuffer error:", err?.message)
    return NextResponse.json({ error: "PDF generation failed." }, { status: 500 })
  }
}
