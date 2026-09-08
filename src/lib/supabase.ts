/**
 * Supabase client configuration for frontend application.
 *
 * Exclusively uses the public anonymous key (VITE_SUPABASE_ANON_KEY).
 * Never import or use the backend service-role key here.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

let client: SupabaseClient | null = null

if (env.isSupabaseConfigured && env.supabaseUrl && env.supabaseAnonKey) {
  try {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    client = null
  }
}

/**
 * The initialized Supabase client instance, or null if configuration is absent.
 */
export const supabase = client

/**
 * Returns whether Supabase is ready for client queries.
 */
export function isSupabaseReady(): boolean {
  return client !== null
}
