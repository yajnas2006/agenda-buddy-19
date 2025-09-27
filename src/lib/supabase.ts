// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined
}

// Reuse during HMR to avoid multiple instances
export const supabase =
  globalThis.__supabase__ ??
  createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    {
      auth: {
        // give your app a unique storage key to avoid collisions
        storageKey: 'amb-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )

if (!globalThis.__supabase__) {
  globalThis.__supabase__ = supabase
}
