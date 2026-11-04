-- Platform admins must pass two-factor sign-in (a code from an authenticator app) before any
-- admin power applies. Supabase Auth records that in every access token as the assurance level:
-- aal1 after the password alone, aal2 once the code is verified. Every admin policy and
-- publish_menu() goes through this function, so a password-only session (or a stolen password
-- used against the Data API directly) can't read or change anything.
--
-- A password-only session can still read its own platform_admins row (that policy checks
-- auth.uid() directly): the admin console uses it to know it should ask for the code.
-- Restaurant members (future restaurant accounts) aren't held to this yet.

create or replace function private.is_platform_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    and exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;
