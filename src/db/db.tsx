const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
import { createClient } from '@supabase/supabase-js'

export function useSupabaseClient(token: any) {
  const supabaseClient = createClient(supabaseUrl!, supabaseKey!, {
    // Session accessed from Clerk SDK, either as Clerk.session (vanilla
    // JavaScript) or useSession (React)
    accessToken: async () => token ?? null,
  })
  return supabaseClient
}

export default useSupabaseClient
