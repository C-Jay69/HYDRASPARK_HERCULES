import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a no-op dummy client so the app doesn't crash without env vars.
    // The UI should check isSupabaseConfigured before making real calls.
    return null as unknown as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}

export { isSupabaseConfigured }
