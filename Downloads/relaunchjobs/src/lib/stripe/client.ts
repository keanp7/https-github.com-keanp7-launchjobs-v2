import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

export const PLANS = {
  candidate_pro: {
    name: "Candidate Pro",
    price_id: process.env.STRIPE_CANDIDATE_PRO_PRICE_ID!,
    price_cents: 2900,
  },
  employer_basic: {
    name: "Employer Basic",
    price_id: process.env.STRIPE_EMPLOYER_BASIC_PRICE_ID!,
    price_cents: 9900,
  },
} as const

export type PlanKey = keyof typeof PLANS
