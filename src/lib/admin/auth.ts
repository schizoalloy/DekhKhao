import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The signed-in platform admin, or a redirect to the login page. Call this at the top of every
 * admin page and server action. It verifies the session token, then checks platform_admins
 * (readable only for your own row). The database enforces the same rule through RLS.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: admin } = await supabase.from("platform_admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, userId, email: (data.claims.email as string | undefined) ?? null };
}
