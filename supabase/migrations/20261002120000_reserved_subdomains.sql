-- Restaurant slugs are now also subdomains (<slug>.dekhkhao.com, see src/config/app.ts).
-- Reserve the names the platform needs, plus "demo" for the built-in JSON demo menu.
-- Keep in step with RESERVED_SUBDOMAINS in src/lib/hosts.ts; `npm run db:test` checks they agree.

alter table public.restaurants drop constraint restaurants_slug_reserved;

alter table public.restaurants add constraint restaurants_slug_reserved check (
  slug not in (
    'demo', 'www', 'admin', 'api', 'app', 'assets', 'cdn', 'static', 'media', 'images',
    'img', 'files', 'mail', 'email', 'smtp', 'imap', 'ftp', 'ns1', 'ns2', 'dns',
    'webmail', 'autodiscover', 'staging', 'dev', 'preview', 'beta', 'status', 'help', 'support', 'docs',
    'blog', 'about', 'privacy', 'terms', 'legal', 'login', 'signin', 'signup', 'auth', 'account',
    'accounts', 'billing', 'dashboard', 'console', 'portal', 'menu', 'menus', 'qr', 'go', 'link',
    'shop', 'store', 'careers', 'jobs', 'news', 'press', 'partners', 'dekhkhao', 'portive'
  )
);
