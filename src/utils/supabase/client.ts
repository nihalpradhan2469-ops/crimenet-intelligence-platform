/**
 * Client helper compatible with Vite + React.
 * Re-exports the client initialized in @/lib/supabase.
 */

import { supabase, isSupabaseReady } from '@/lib/supabase'

export const createClient = () => supabase

export { isSupabaseReady }
