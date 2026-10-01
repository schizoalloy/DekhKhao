"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/admin/action-state";
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
      error:
        error.code === "invalid_credentials"
          ? "That email and password don't match an account."
          : error.status === 429
            ? "Too many attempts. Wait a few minutes and try again."
            : error.code === "email_not_confirmed"
              ? "This email address hasn't been confirmed yet."
              : `Sign-in failed (${error.code ?? error.message}). Try again in a moment.`,
    };
  }

  const { data: admin } = await supabase.from("platform_admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account doesn't have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
