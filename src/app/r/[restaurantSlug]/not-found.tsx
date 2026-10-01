"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shown for an item that isn't on this restaurant's menu (/r/<slug>/<unknown>).
 * Restaurants that don't exist are handled by src/app/r/not-found.tsx.
 */
export default function ItemNotFound() {
  const menuHref = usePathname().split("/").slice(0, 3).join("/") || "/";
  return (
    <main id="main" className="mx-auto grid min-h-[80dvh] max-w-md place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl font-semibold tracking-[-0.04em] text-m-muted">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em]">This item isn’t on the menu</h1>
        <p className="mt-2 leading-relaxed text-m-muted">It may have been removed or renamed. The rest of the menu is still here.</p>
        <Link
          href={menuHref}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-m-button px-6 font-semibold text-m-button-text active:scale-[0.98]"
        >
          <ArrowLeft size={18} aria-hidden /> Back to the menu
        </Link>
      </div>
    </main>
  );
}
