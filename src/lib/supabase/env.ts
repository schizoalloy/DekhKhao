/**
 * Supabase connection settings. Both values are public by design: Row Level Security decides what
 * each visitor can read or change. The secret key is never used by the app.
 */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function requireSupabaseConfig() {
  const config = supabaseConfig();
  if (!config)
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. See .env.example.");
  return config;
}
