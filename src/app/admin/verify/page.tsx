import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions/auth";
import { AuthenticatorSetup, CodeForm } from "@/components/admin/TwoFactor";
import { LogoMark } from "@/components/ui/LogoMark";
import { siteConfig } from "@/config/site";
import { requireAdminAccount } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Two-step sign-in" };

/** After the password: the authenticator-app code, or linking an app the first time. */
export default async function VerifyPage() {
  const { supabase, email, twoFactorDone } = await requireAdminAccount();
  if (twoFactorDone) redirect("/admin");

  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  const linked = factors.totp.length > 0;

  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-sm place-items-center px-6 py-12">
      <div className="w-full">
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <LogoMark className="size-6" /> {siteConfig.name} admin
        </p>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-[-0.03em]">
          {linked ? "Enter your code" : "Set up two-step sign-in"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {linked
            ? "Your password was right. Now open your authenticator app for the second step."
            : "The admin needs a second step after the password: a code from an app on your phone. You set it up once."}
          {email && (
            <>
              {" "}
              Signed in as <span className="font-medium text-ink">{email}</span>.
            </>
          )}
        </p>

        {linked ? <CodeForm /> : <AuthenticatorSetup />}

        <form action={signOut} className="mt-6 text-center">
          <button type="submit" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            Cancel and sign out
          </button>
        </form>
      </div>
    </main>
  );
}
