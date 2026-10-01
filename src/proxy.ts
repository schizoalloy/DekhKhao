import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rootDomain } from "@/config/app";
import { classifyHost } from "@/lib/hosts";

/**
 * Runs before every page request (static files excluded, see `config`).
 *
 * Subdomain mode (NEXT_PUBLIC_ROOT_DOMAIN set, see src/config/app.ts):
 *   <slug>.<root>/<item>   served by /r/<slug>/<item>; the address bar keeps the clean URL
 *   admin.<root>/admin/*   the admin console (with the session check below)
 *   <root>, www.<root>     the landing page; www redirects to the bare domain
 *   /r/<slug>/... on any other host redirects to the restaurant's subdomain, and /admin to admin.<root>
 *
 * Path mode (unset): pages are served as they are; only /admin gets the session check.
 */
export async function proxy(request: NextRequest) {
  if (!rootDomain) return isAdminPath(request.nextUrl.pathname) ? adminSession(request) : NextResponse.next();

  const { pathname } = request.nextUrl;
  const host = classifyHost(request.headers.get("host"), rootDomain);
  const legacy = /^\/r\/([^/]+)(\/.*)?$/.exec(pathname); // /r/<slug>[/<rest>]
  const go = (hostname: string, path: string, status: 307 | 308 = 307) => redirect(request, hostname, path, status);
  const restaurantHost = (slug: string) => `${slug}.${rootDomain}`;

  switch (host.kind) {
    case "restaurant": {
      if (legacy) return go(restaurantHost(legacy[1]), legacy[2] || "/", 308);
      const url = request.nextUrl.clone();
      url.pathname = `/r/${host.slug}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
    case "admin":
      if (isAdminPath(pathname)) return adminSession(request);
      if (pathname === "/") return go(`admin.${rootDomain}`, "/admin");
      if (legacy) return go(restaurantHost(legacy[1]), legacy[2] || "/", 308);
      if (pathname.startsWith("/qr/")) return NextResponse.next();
      return go(rootDomain, pathname);
    case "reserved":
      return go(rootDomain, "/");
    case "root":
      if (host.www) return go(rootDomain, pathname, 308);
      break;
  }
  // The landing page, and other hosts such as *.vercel.app.
  if (legacy) return go(restaurantHost(legacy[1]), legacy[2] || "/", 308);
  if (isAdminPath(pathname)) return go(`admin.${rootDomain}`, pathname);
  return NextResponse.next();
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Redirect to `path` on another host (or this one), keeping the query string. */
function redirect(request: NextRequest, hostname: string, path: string, status: 307 | 308 = 307) {
  const target = new URL(`${path}${request.nextUrl.search}`, `${request.nextUrl.protocol}//${hostname}`);
  // Next.js turns a redirect to request.url's own origin into a relative one. When request.url
  // doesn't carry the host the browser asked for (local dev on *.localhost), that would keep the
  // browser on the wrong host, so send an immediate refresh to the absolute URL instead.
  if (target.host === new URL(request.url).host && target.host !== request.headers.get("host")) {
    const href = target.href; // URL serialisation percent-encodes quotes and angle brackets
    return new NextResponse(`<!doctype html><meta http-equiv="refresh" content="0;url=${href}"><a href="${href}">Continue</a>`, {
      headers: { "content-type": "text/html; charset=utf-8", refresh: `0;url=${href}`, "cache-control": "no-store" },
    });
  }
  return NextResponse.redirect(target, status);
}

/**
 * Refreshes the Supabase session cookie before an admin page renders, and sends signed-out
 * visitors to the login page. This is a convenience, not the security boundary: every admin page
 * and action checks the user again (src/lib/admin/auth.ts) and RLS has the final say.
 */
async function adminSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // Keeps responses that set auth cookies out of shared caches.
        for (const [header, value] of Object.entries(headers ?? {})) response.headers.set(header, value);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  if (!signedIn && request.nextUrl.pathname !== "/admin/login") {
    const login = redirect(request, request.headers.get("host") ?? request.nextUrl.host, "/admin/login");
    for (const cookie of response.cookies.getAll()) login.cookies.set(cookie);
    return login;
  }
  return response;
}

// Every page, but not Next.js build files or anything with a file extension (images, models,
// robots.txt, icon.svg...). Restaurant and item slugs never contain a dot.
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"] };
