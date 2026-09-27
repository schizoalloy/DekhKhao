/**
 * Central site configuration.
 *
 * The production domain is intentionally NOT hard-coded. The base URL resolves from:
 *   1. NEXT_PUBLIC_SITE_URL  (set this once the domain is final)
 *   2. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL (automatic on Vercel)
 *   3. http://localhost:3000 (local development)
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const siteConfig = {
  name: "DekhKhao",
  nameUrdu: "دیکھ کھاؤ",
  tagline: "What you see is what you get.",
  company: "Portive Technologies",
  title: "DekhKhao — What You See Is What You Get",
  description:
    "DekhKhao lets restaurant customers visualize food in 3D and augmented reality before they order.",
  url: resolveSiteUrl(),
  /**
   * Reserved for the future product, where restaurant menus live at
   * `<restaurant>.<rootDomain>`. Nothing on the landing page depends on it.
   */
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? null,
  contact: {
    /** E.164 digits only, no "+" — the format wa.me expects. */
    whatsappNumber: "923353989333",
    whatsappDisplay: "+92 335 3989333",
  },
} as const;

// Root-relative so they also work from other pages (e.g. /privacy).
export const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Restaurants", href: "/#for-restaurants" },
  { label: "Experience", href: "/#experience" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const legalLinks = [{ label: "Privacy Policy", href: "/privacy" }] as const;
