/**
 * Public base URL of the customer app, used to build catalog links and QR codes.
 *
 * Resolution order (first one set wins):
 *   1. NEXT_PUBLIC_APP_URL            e.g. https://menu.dekhkhao.com, set once the domain is final
 *   2. NEXT_PUBLIC_SITE_URL           the marketing site URL, if the app shares its domain
 *   3. VERCEL_PROJECT_PRODUCTION_URL  set automatically by Vercel (production domain)
 *   4. http://localhost:3000          local development
 *
 * Keep scripts/generate-qr.mjs in step with this order.
 */
function resolveAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const appUrl = resolveAppUrl();

export const catalogPath = (restaurantSlug: string) => `/r/${restaurantSlug}`;
export const itemPath = (restaurantSlug: string, itemSlug: string) => `/r/${restaurantSlug}/${itemSlug}`;

/** Full URL a restaurant's QR code encodes. */
export const catalogUrl = (restaurantSlug: string, base: string = appUrl) =>
  `${base.replace(/\/+$/, "")}${catalogPath(restaurantSlug)}`;
