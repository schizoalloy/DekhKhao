"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/admin/action-state";
import { requireAdminAccount } from "@/lib/admin/auth";

/**
 * The second sign-in step: a 6-digit code from an authenticator app (Supabase Auth's TOTP factor).
 * The first time, the admin links an app by scanning a QR code; after that, every sign-in asks for
 * the current code. A verified code raises the session to aal2, which the database requires for
 * every admin power (supabase/migrations/20261104120000_admin_requires_two_factor.sql).
 */

const Code = z
  .string()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app."));

function codeProblem(error: { code?: string; status?: number; message: string }) {
  if (error.status === 429) return "Too many attempts. Wait a few minutes, then try again.";
  if (error.code === "mfa_verification_failed" || error.code === "mfa_challenge_expired")
    return "That code didn't match. Codes change every 30 seconds; enter the one showing now.";
  return `Couldn't check the code (${error.code ?? error.message}). Try again.`;
}

export type AuthenticatorSetup =
  | { ok: true; factorId: string; qrCode: string; secret: string; uri: string }
  | { ok: false; error: string };

/** Starts linking an authenticator app. Only possible while the account has none linked. */
export async function startAuthenticatorSetup(): Promise<AuthenticatorSetup> {
  const { supabase } = await requireAdminAccount();
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) return { ok: false, error: error.message };
  if (factors.totp.length > 0) return { ok: false, error: "An authenticator app is already linked. Reload the page to enter its code." };

  // A QR code that was shown but never confirmed is useless now; clear it if Supabase allows.
  for (const factor of factors.all)
    if (factor.factor_type === "totp" && factor.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: factor.id });

  const { data, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "DekhKhao admin",
    // Unique per attempt: Supabase refuses two factors with the same name.
    friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}`,
  });
  if (enrollError) return { ok: false, error: enrollError.message };
  return { ok: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri };
}

/** Confirms the newly linked app with its first code; the session is then fully signed in. */
export async function confirmAuthenticatorSetup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdminAccount();
  const parsed = z.object({ factorId: z.uuid(), code: Code }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter the 6-digit code." };

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { ok: false, error: codeProblem(error) };
  redirect("/admin");
}

/** Checks the code from the linked app at sign-in. */
export async function verifyAuthenticatorCode(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdminAccount();
  const code = Code.safeParse(formData.get("code") ?? "");
  if (!code.success) return { ok: false, error: code.error.issues[0]?.message ?? "Enter the 6-digit code." };

  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { ok: false, error: listError.message };
  const factor = factors.totp[0];
  if (!factor) return { ok: false, error: "No authenticator app is linked yet. Reload the page to set one up." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.data });
  if (error) return { ok: false, error: codeProblem(error) };
  redirect("/admin");
}
