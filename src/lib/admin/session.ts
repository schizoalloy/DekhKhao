/**
 * The admin is signed out after an hour without activity. Supabase's own inactivity timeout needs
 * a paid plan, so the app keeps the time: signing in sets this cookie, every admin request
 * refreshes it (src/proxy.ts), and a session whose cookie is missing or older than the limit is
 * ended. The next sign-in then needs the password and the authenticator code again.
 */
export const ADMIN_ACTIVITY_COOKIE = "dk-admin-active";
export const ADMIN_IDLE_LIMIT_SECONDS = 60 * 60;

/** The cookie that records activity now. `secure` on HTTPS (production). */
export function activityCookie(secure: boolean) {
  return {
    name: ADMIN_ACTIVITY_COOKIE,
    value: String(Date.now()),
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: ADMIN_IDLE_LIMIT_SECONDS,
  };
}

/** True when the last recorded activity is missing or older than the limit. */
export function isIdle(lastActivity: string | undefined, now = Date.now()) {
  const last = Number(lastActivity);
  return !(last > 0) || now - last > ADMIN_IDLE_LIMIT_SECONDS * 1000;
}
