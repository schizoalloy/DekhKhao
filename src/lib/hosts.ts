/**
 * What a request's Host header is, when restaurants live on subdomains (NEXT_PUBLIC_ROOT_DOMAIN).
 * Used by src/proxy.ts. Pure functions, no Next.js imports, so it can run anywhere.
 */

/**
 * Subdomains that can never be restaurants. The database rejects these as restaurant slugs too
 * (restaurants_slug_reserved in supabase/migrations), plus "demo", which the built-in JSON demo
 * menu uses at demo.<root>. `npm run db:test` checks the two lists agree.
 */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  "www", "admin", "api", "app", "assets", "cdn", "static", "media", "images", "img", "files",
  "mail", "email", "smtp", "imap", "ftp", "ns1", "ns2", "dns", "webmail", "autodiscover",
  "staging", "dev", "preview", "beta", "status", "help", "support", "docs", "blog",
  "about", "privacy", "terms", "legal", "login", "signin", "signup", "auth", "account",
  "accounts", "billing", "dashboard", "console", "portal", "menu", "menus", "qr", "go", "link",
  "shop", "store", "careers", "jobs", "news", "press", "partners", "dekhkhao", "portive",
]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type HostKind =
  | { kind: "root"; www: boolean } // dekhkhao.com, www.dekhkhao.com: the landing page
  | { kind: "admin" } // admin.dekhkhao.com
  | { kind: "restaurant"; slug: string } // pizzahut.dekhkhao.com
  | { kind: "reserved" } // api.dekhkhao.com, a.b.dekhkhao.com, ...
  | { kind: "other" }; // anything else: *.vercel.app, localhost, a LAN address

/** `root` is e.g. "dekhkhao.com", or "localhost:3000" for local testing. */
export function classifyHost(rawHost: string | null, root: string | null): HostKind {
  if (!root || !rawHost) return { kind: "other" };
  const host = rawHost.toLowerCase().replace(/\.$/, "");
  if (host === root) return { kind: "root", www: false };
  if (host === `www.${root}`) return { kind: "root", www: true };
  if (!host.endsWith(`.${root}`)) return { kind: "other" };

  const label = host.slice(0, -(root.length + 1));
  if (label === "admin") return { kind: "admin" };
  if (label.length > 63 || !SLUG.test(label) || RESERVED_SUBDOMAINS.has(label)) return { kind: "reserved" };
  return { kind: "restaurant", slug: label };
}
