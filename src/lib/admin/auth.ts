import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The signed-in platform admin's account, whether or not the authenticator code has been entered
 * yet, or a redirect to the login page. For the two-step sign-in page and its actions only;
 * everything else uses requireAdmin(). It verifies the session token, then checks platform_admins
 * (readable only for your own row).
 */
export async function requireAdminAccount() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/admin/login");

  const { data: admin, error } = await supabase.from("platform_admins").select("user_id").eq("user_id", claims.sub).maybeSingle();
  if (error) redirect("/admin/login?error=unreachable");
  if (!admin) redirect("/admin/login?error=not-admin");

  return {
    supabase,
    userId: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    /** True once the authenticator code was entered this session (assurance level aal2). */
    twoFactorDone: claims.aal === "aal2",
  };
}

/**
 * The signed-in platform admin, or a redirect: to the login page, or to the authenticator-code
 * step when only the password has been entered. Call this at the top of every admin page and
 * server action. The database enforces the same rule: private.is_platform_admin() requires aal2.
 */
export async function requireAdmin() {
  const account = await requireAdminAccount();
  if (!account.twoFactorDone) redirect("/admin/verify");
  return account;
}
