import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin routes only. Refreshes the Supabase session cookie before the page renders, and sends
 * signed-out visitors to the login page. This is a convenience, not the security boundary: every
 * admin page and action checks the user again (src/lib/admin/auth.ts) and RLS has the final say.
 */
export async function proxy(request: NextRequest) {
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
    const login = NextResponse.redirect(new URL("/admin/login", request.url));
    for (const cookie of response.cookies.getAll()) login.cookies.set(cookie);
    return login;
  }
  return response;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
