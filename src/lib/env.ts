/**
 * Frontend environment configuration helper.
 *
 * Safely accesses client-side environment variables prefixed with VITE_.
 * Never exposes or uses backend service-role keys on the client.
 */

export interface FrontendEnv {
  supabaseUrl?: string
  supabaseAnonKey?: string
  isSupabaseConfigured: boolean
}

export const env: FrontendEnv = {
  supabaseUrl: (
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim() || undefined,
  supabaseAnonKey: (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim() || undefined,
  get isSupabaseConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey)
  },
}
