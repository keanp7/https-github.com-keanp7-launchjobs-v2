import { createClient } from "@/lib/supabase/server"
import { TestimonialsGrid } from "./TestimonialsGrid"

export default async function TestimonialsPage() {
  const supabase = await createClient()

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, name, role, quote, approved, created_at")
    .order("created_at", { ascending: false })

  return <TestimonialsGrid initial={testimonials ?? []} />
}
