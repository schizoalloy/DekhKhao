import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { requireSupabaseConfig } from "./env";

/**
 * Per-request client that acts as the signed-in user, so every query goes through RLS.
 * For admin pages and server actions.
 */
export async function createSupabaseServerClient() {
  const { url, key } = requireSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies. src/proxy.ts refreshes the session for them.
        }
      },
    },
  });
}
