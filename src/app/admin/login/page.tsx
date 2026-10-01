import type { Metadata } from "next";
import { signIn } from "@/app/admin/actions/auth";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ui } from "@/components/admin/styles";
import { LogoMark } from "@/components/ui/LogoMark";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign in" };

/** Admin accounts are created in the Supabase dashboard; there is no sign-up. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-sm place-items-center px-6">
      <div className="w-full">
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <LogoMark className="size-6" /> {siteConfig.name} admin
        </p>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-[-0.03em]">Sign in</h1>
        {error === "not-admin" && (
          <p role="alert" className="mt-4 rounded-2xl bg-chilli/10 px-4 py-3 text-sm text-chilli-deep">
            You&apos;re signed in, but this account doesn&apos;t have admin access.
          </p>
        )}
        <ActionForm action={signIn} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className={ui.label}>
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="username" required className={ui.input} />
          </div>
          <div>
            <label htmlFor="password" className={ui.label}>
              Password
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={ui.input} />
          </div>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </ActionForm>
      </div>
    </main>
  );
}
