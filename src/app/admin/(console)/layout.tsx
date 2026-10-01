import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/actions/auth";
import { ui } from "@/components/admin/styles";
import { LogoMark } from "@/components/ui/LogoMark";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/admin/auth";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold">
            <LogoMark className="size-5" /> {siteConfig.name} admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{email}</span>
            <form action={signOut}>
              <button type="submit" className={ui.buttonSecondary}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </>
  );
}
