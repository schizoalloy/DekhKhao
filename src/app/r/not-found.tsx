import { marketingHref } from "@/config/app";
import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/ui/LogoMark";

/** Shown when a QR code or link points at a restaurant that doesn't exist. */
export default function RestaurantNotFound() {
  return (
    <div className="menu min-h-[100dvh]">
      <main id="main" className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div>
          <LogoMark className="mx-auto size-10" />
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-[-0.03em]">We couldn’t find this menu</h1>
          <p className="mt-3 leading-relaxed text-m-muted">
            The link or QR code may be out of date. Ask a member of staff for the restaurant’s current menu.
          </p>
          <a
            href={marketingHref("/")}
            className="mt-8 inline-flex min-h-12 items-center rounded-full border border-m-line px-6 text-sm font-medium hover:border-current"
          >
            What is {siteConfig.name}?
          </a>
        </div>
      </main>
    </div>
  );
}
