"use server";

import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DATABASE_UNREACHABLE, type ActionState } from "@/lib/admin/action-state";
import { ADMIN_ACTIVITY_COOKIE, activityCookie } from "@/lib/admin/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Credentials = z.object({ email: z.email(), password: z.string().min(1) });

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = Credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: "Enter your email address and password." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Supabase's code and message never contain the password.
    console.error(`[admin] sign-in failed: ${error.code ?? "no code"} (HTTP ${error.status ?? "?"}): ${error.message}`);
    return {
      ok: false,
      error: isAuthRetryableFetchError(error)
        ? DATABASE_UNREACHABLE
        : error.code === "invalid_credentials"
          ? "That email and password don't match an account."
          : error.status === 429
            ? "Too many attempts. Wait a few minutes and try again."
            : error.code === "email_not_confirmed"
              ? "This email address hasn't been confirmed yet."
              : `Sign-in failed (${error.code ?? error.message}). Try again in a moment.`,
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (adminError) return { ok: false, error: DATABASE_UNREACHABLE };
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account doesn't have admin access." };
  }

  // Starts the one-hour inactivity clock (src/lib/admin/session.ts), then the authenticator code.
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  (await cookies()).set(activityCookie(secure));
  redirect("/admin/verify");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  (await cookies()).delete(ADMIN_ACTIVITY_COOKIE);
  redirect("/admin/login");
}
