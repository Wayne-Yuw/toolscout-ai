import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During local development without envs, return a minimal no-op client
    console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null }
        },
        onAuthStateChange(_cb: any) {
          return { data: { subscription: { unsubscribe() {} } } }
        },
      },
    } as unknown as SupabaseClient
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
