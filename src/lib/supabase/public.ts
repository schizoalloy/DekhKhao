import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseConfig } from "./env";

/**
 * Anonymous client with no session and no cookies: it sees exactly what any customer could,
 * which is published menus only. Returns null when Supabase isn't configured, so the built-in
 * JSON menus keep working without it.
 */
export function createSupabasePublicClient() {
  const config = supabaseConfig();
  if (!config) return null;
  return createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
