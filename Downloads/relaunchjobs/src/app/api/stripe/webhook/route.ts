import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/client"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

// Initialize Supabase using the environment variables from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { type, candidate_id, job_role_id } = session.metadata ?? {}

        if (type === "candidate" && candidate_id) {
          const { error } = await supabase
            .from("candidates")
            .update({ is_pro: true })
            .eq("id", candidate_id)

          if (error) {
            console.error("Failed to update candidate:", error)
            throw error
          }
        } else if (type === "employer" && job_role_id) {
          const { error } = await supabase
            .from("job_roles")
            .update({ deposit_paid: true })
            .eq("id", job_role_id)

          if (error) {
            console.error("Failed to update job role:", error)
            throw error
          }
        }
        break
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Unhandled subscription event: ${event.type} for ${subscription.id}`)
        // Placeholder for future subscription logic
        break
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Unhandled invoice event: ${event.type} for ${invoice.id}`)
        // Placeholder for future invoice logic
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
