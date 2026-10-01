import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Restaurant } from "@/catalog/types";
import { catalogPath, marketingHref } from "@/config/app";
import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/ui/LogoMark";

/** Restaurant logo, or its initial on an accent tile when there's no logo yet. */
export function RestaurantMark({ restaurant, size = 36 }: { restaurant: Restaurant; size?: number }) {
  if (restaurant.logo)
    return (
      <Image src={restaurant.logo} alt="" width={size * 3} height={size} className="w-auto object-contain" style={{ height: size }} />
    );
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl bg-m-accent font-display font-bold text-m-bg"
      style={{ width: size, height: size, fontSize: size * 0.46 }}
    >
      {restaurant.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Top bar. The restaurant leads; DekhKhao stays a small credit on the right. */
export function MenuHeader({ restaurant, back }: { restaurant: Restaurant; back?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-m-line bg-m-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {back ?? (
          <Link href={catalogPath(restaurant.slug)} className="flex min-h-11 min-w-0 items-center gap-2.5">
            <RestaurantMark restaurant={restaurant} size={30} />
            <span className="truncate font-display text-[1.05rem] font-semibold tracking-[-0.02em]">{restaurant.name}</span>
          </Link>
        )}
        <a
          href={marketingHref("/")}
          className="flex min-h-11 shrink-0 items-center gap-1.5 text-xs text-m-muted transition-colors hover:text-m-text"
          aria-label={`3D menu by ${siteConfig.name}. Learn more`}
        >
          <span className="hidden min-[380px]:inline">3D menu by</span>
          <LogoMark className="size-4.5" />
          <span className="font-semibold text-m-text">{siteConfig.name}</span>
        </a>
      </div>
    </header>
  );
}

export function MenuFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 text-sm text-m-muted sm:px-6">
      <div className="flex flex-col gap-4 border-t border-m-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-m-text">{siteConfig.name}</span> by {siteConfig.company}
          <span className="block text-xs">{siteConfig.tagline}</span>
        </p>
        <nav aria-label="About this menu" className="flex gap-5 text-xs">
          <a href={marketingHref("/")} className="inline-flex min-h-11 items-center underline decoration-m-line underline-offset-4 hover:text-m-text">
            About {siteConfig.name}
          </a>
          <a href={marketingHref("/privacy")} className="inline-flex min-h-11 items-center underline decoration-m-line underline-offset-4 hover:text-m-text">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
