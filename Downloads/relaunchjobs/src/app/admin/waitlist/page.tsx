import { createClient } from "@/lib/supabase/server"
import { WaitlistTable } from "./WaitlistTable"

export default async function WaitlistPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from("waitlist")
    .select("id, email, language, source, created_at, contacted_at")
    .order("created_at", { ascending: false })

  return <WaitlistTable initial={entries ?? []} />
}
