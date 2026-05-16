import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Throws a human-readable Error for common Postgres/PostgREST error codes
 * so API routes surface clear messages instead of raw DB errors.
 */
export function throwOnDbError(error: any, context: string): never {
  const code = error?.code ?? ""
  if (code === "23502") {
    const col = (error.message ?? "").match(/column "([^"]+)"/)?.[1] ?? "unknown column"
    throw new Error(`[${context}] NOT NULL violation on "${col}" — a required field is missing (DB code 23502)`)
  }
  if (code === "42P10") {
    throw new Error(`[${context}] ON CONFLICT target has no matching unique constraint (DB code 42P10) — check that a UNIQUE index exists on the conflict column`)
  }
  if (code === "23505") {
    throw new Error(`[${context}] Duplicate key violation (DB code 23505) — a row with that value already exists`)
  }
  throw new Error(`[${context}] DB error ${code}: ${error.message ?? JSON.stringify(error)}`)
}

export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL")
  if (!key) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY")

  return createServerClient(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies set by middleware
          }
        },
      },
    }
  )
}
