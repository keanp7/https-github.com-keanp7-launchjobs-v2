import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { type, entityId } = await request.json()

    if (!type || !entityId) {
      return NextResponse.json({ error: "Missing type or entityId" }, { status: 400 })
    }

    let priceId = ""
    let mode: "subscription" | "payment" = "subscription"
    let metadata: any = {}

    if (type === "candidate") {
      priceId = process.env.STRIPE_CANDIDATE_PRO_PRICE_ID!
      mode = "subscription"
      metadata = {
        type: "candidate",
        candidate_id: entityId,
      }
    } else if (type === "employer") {
      priceId = process.env.STRIPE_EMPLOYER_BASIC_PRICE_ID!
      mode = "payment"
      metadata = {
        type: "employer",
        job_role_id: entityId,
        employer_id: user.id,
      }

      // Confirm the role belongs to this employer
      const { data: role, error: roleError } = await supabase
        .from("job_roles")
        .select("id")
        .eq("id", entityId)
        .eq("employer_id", user.id)
        .single()

      if (roleError || !role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
