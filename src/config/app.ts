/**
 * Where restaurant menus live. Two modes:
 *
 * - Subdomain mode, when NEXT_PUBLIC_ROOT_DOMAIN is set (e.g. "dekhkhao.com"):
 *     https://dekhkhao.com            landing page
 *     https://admin.dekhkhao.com      admin console
 *     https://<slug>.dekhkhao.com     a restaurant's menu, /<item> for a dish
 *   src/proxy.ts maps those addresses onto the /r/<slug> pages. Production uses this.
 *
 * - Path mode, when it's unset: menus at <appUrl>/r/<slug>. Local development and the Vercel
 *   test site use this. Set NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000 to try subdomains locally
 *   (http://<slug>.localhost:3000 works in every modern browser).
 */

/**
 * Base URL for path mode.
 *
 * Resolution order (first one set wins):
 *   1. NEXT_PUBLIC_APP_URL            e.g. the test site's address
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

/** e.g. "dekhkhao.com", or "localhost:3000" for local testing. Null means path mode. */
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase().replace(/\/+$/, "") || null;
const scheme = rootDomain && /^(localhost|127\.)/.test(rootDomain) ? "http" : "https";

/** The admin console's own address in subdomain mode. */
export const adminOrigin = rootDomain ? `${scheme}://admin.${rootDomain}` : null;

/** A restaurant's menu, as a path on the site that serves it. */
export const catalogPath = (restaurantSlug: string) => (rootDomain ? "/" : `/r/${restaurantSlug}`);
export const itemPath = (restaurantSlug: string, itemSlug: string) =>
  rootDomain ? `/${itemSlug}` : `/r/${restaurantSlug}/${itemSlug}`;

/** Full URL a restaurant's QR code encodes. */
export const catalogUrl = (restaurantSlug: string, base: string = appUrl) =>
  rootDomain ? `${scheme}://${restaurantSlug}.${rootDomain}` : `${base.replace(/\/+$/, "")}/r/${restaurantSlug}`;

/** Short form for the admin, e.g. "pizzahut.dekhkhao.com" or "/r/pizzahut". */
export const catalogLabel = (restaurantSlug: string) =>
  rootDomain ? `${restaurantSlug}.${rootDomain}` : `/r/${restaurantSlug}`;

/**
 * A link from a menu page to the DekhKhao site. On a restaurant subdomain "/" is the menu
 * itself, so these point at the root domain.
 */
export const marketingHref = (path = "/") => (rootDomain ? `${scheme}://${rootDomain}${path}` : path);
