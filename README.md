# DekhKhao

**DekhKhao** (دیکھ کھاؤ) by Portive Technologies. _What you see is what you get._

One Next.js project, three parts:

- **Marketing site** at `dekhkhao.com` (`/`, `/privacy`), for restaurant owners.
- **Customer menus** at `<restaurant>.dekhkhao.com`: the page a table QR code opens. Customers pick a dish, turn it
  in 3D and place it on their table in AR. A visual layer only: no cart, ordering or payment.
- **Admin console** at `admin.dekhkhao.com`: create restaurants, upload models, preview and publish.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · `<model-viewer>` · Supabase (database + admin
sign-in) · Cloudflare R2 (3D models and images) · Vercel.

```bash
npm install
npm run dev        # http://localhost:3000 (path mode, see "Addresses")
npm run build
npm run typecheck
npm run db:test    # schema + RLS tests on an in-memory Postgres (no Docker)
npm run r2:check   # checks the R2 credentials in .env.local
```

## How it fits together

```
admin.dekhkhao.com (signed in) ── server actions ──► Supabase: drafts (RLS: admins only)
   │ upload: server checks type/size → signed upload URL (type + size locked into the signature)
   └──► browser uploads straight to R2 dekhkhao-assets (private) → server checks the file's first bytes

Publish ──► copy the files the menu uses to R2 dekhkhao-public ──► publish_menu() validates and freezes
            a JSON snapshot ──► the restaurant's pages are revalidated

<slug>.dekhkhao.com ──► src/proxy.ts maps it to /r/<slug> ──► reads only the published snapshot
                         (anonymous key) ──► <model-viewer> loads the GLB/USDZ from the public bucket
```

- **Drafts never leak.** Anonymous visitors have no access to the working tables at all, only to
  `published_menus`, which only `publish_menu()` writes. If publishing fails, files copied for it are removed again.
- **No privileged keys in the app.** Admin writes run as the signed-in admin under RLS; public reads use the
  publishable key. The Supabase secret key isn't used. The R2 token can only read/write objects in the two buckets.
- **Sign-up is off.** Admin users are created in the Supabase dashboard, then made admin with one SQL statement:
  `insert into public.platform_admins (user_id) select id from auth.users where email = '<email>';`
  (`npx supabase db query --linked "<sql>"`). `restaurant_members` is ready for restaurant accounts later.
- **Infrastructure lives in the repo:** `supabase/` (migrations, auth config, tests), `infra/r2/` (bucket CORS and
  how to recreate the buckets), `vercel.json` (functions in Singapore, next to the database).

## Structure

```
src/
  app/                 layout (fonts, metadata), page, globals.css (design tokens), OG image, robots, sitemap, icon
    r/[restaurantSlug]/          customer menu: catalog page, [itemSlug]/ item page, not-found pages
    qr/[restaurantSlug]/         printable table QR card + qr.png download (not indexed)
    admin/                       admin console: login, restaurants, item editor, actions/ (server actions)
  proxy.ts             host routing (subdomains) + admin session refresh
  catalog/
    types.ts           Restaurant / CatalogItem / ModelAsset / ModelScale
    restaurants/       built-in JSON menus (the demo) + index.ts registry
    published.ts       published menus from Supabase, cached until the next publish
    data.ts            async data access: JSON first, then published menus
  config/app.ts        addresses: subdomain vs path mode, catalog/QR URL helpers
  config/assets.ts     public URL of published files
  components/catalog/  menu header/footer, item card, 3D viewer + AR logic, desktop phone hand-off
  components/admin/    admin forms and the upload button
  config/site.ts       name, Urdu name, tagline, WhatsApp number, base URL resolution
  lib/supabase/        server, public and generated-types clients
  lib/admin/           admin auth check, upload rules, file checks and cleanup
  lib/r2.ts            R2 access (server only): signed URLs, publish copies, deletes
  lib/hosts.ts         which host is the landing page, admin, a restaurant or reserved
  content/
    copy.ts            problem / steps / benefits / FAQ copy
    assets.manifest.json  every photo, texture, 3D model and render (see below)
  components/
    sections/          one component per page section (Hero, HowItWorks, FAQ, ContactForm, …)
    ui/                Button, SectionHeading, UrduWordmark, Reveal, LogoMark
    visuals/           phone frame, reticle, QR glyph, live 3D model viewer
  lib/                 whatsapp.ts (message builder), random.ts (deterministic SVG helpers)
```

## Addresses

**Subdomain mode** (production, `NEXT_PUBLIC_ROOT_DOMAIN=dekhkhao.com`):

| Address | What it is |
| --- | --- |
| `dekhkhao.com` | Landing page (`www.` redirects here) |
| `<slug>.dekhkhao.com`, `/<item>` | A restaurant's menu and dish pages, live as soon as the menu is published |
| `admin.dekhkhao.com` | Admin console (`/admin` on any other host redirects here) |
| `demo.dekhkhao.com` | The built-in Luffy demo |
| `/r/<slug>/…` on any host | Redirects to `<slug>.dekhkhao.com/…`, so old links and QR codes keep working |

`src/proxy.ts` does the mapping; the menu pages themselves live at `/r/<slug>`. A restaurant's slug is its
subdomain, chosen when it's created, and shouldn't change once QR codes are printed. Platform names (`www`, `admin`,
`api`, … see `src/lib/hosts.ts`) and `demo` are reserved, and the database enforces the same list.
`*.dekhkhao.com` must be added to the Vercel project once; Vercel issues the certificates because it runs the DNS.

**Path mode** (`NEXT_PUBLIC_ROOT_DOMAIN` unset): menus at `/r/<slug>`, admin at `/admin`, on the same host. Local
development and the Vercel test site (`dekh-khao-test.vercel.app`, branch `feat/admin-backend`) use this. To try
subdomains locally, put `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` in `.env.development.local`, restart `npm run dev`
and open `http://demo.localhost:3000` or `http://admin.localhost:3000`.

## Environment variables

Real values go in `.env.local` (git-ignored); `.env.example` lists them all. In Vercel, set them per environment.
`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

| Variable | Secret? | Production | Preview (test site) |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | no | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | no, RLS protects the data | ✓ | ✓ |
| `R2_ACCOUNT_ID`, `R2_PRIVATE_BUCKET`, `R2_PUBLIC_BUCKET` | no | ✓ | ✓ |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | **yes**, mark Sensitive | ✓ | ✓ |
| `NEXT_PUBLIC_ASSETS_BASE_URL` | no | public bucket address | same |
| `NEXT_PUBLIC_ROOT_DOMAIN` | no | `dekhkhao.com` | unset |
| `NEXT_PUBLIC_APP_URL` | no | unset | `https://dekh-khao-test.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | no | optional (`https://dekhkhao.com`) | unset |

`SUPABASE_DB_PASSWORD` is only for the Supabase CLI and lives in `.env.supabase.local` (git-ignored, not loaded by
Next.js). Never add the Supabase secret key or `service_role` key anywhere in this app.

**Careful:** `vercel env pull` overwrites `.env.local`. Back it up first.

## Changing the database

Write a new file in `supabase/migrations/`, run `npm run db:test`, then `npx supabase db push` (dry-run first with
`--dry-run`), and `npm run db:types` to regenerate `src/lib/supabase/database.types.ts`. Auth settings live in
`supabase/config.toml`; always `npx supabase config diff` before `npx supabase config push`, because the CLI's
local defaults differ from the hosted project (one push once turned off email sign-in entirely).

## Customer menu app

### Routes

As served in path mode; in subdomain mode `/r/demo` is `demo.dekhkhao.com` and `/r/demo/luffy` is
`demo.dekhkhao.com/luffy`.

| Route | What it is |
| --- | --- |
| `/r/demo` | Demo restaurant catalog (the QR code target) |
| `/r/demo/luffy` | Item page: 3D viewer and View in AR |
| `/r/<unknown>` | 404: "We couldn't find this menu" |
| `/r/demo/<unknown>` | 404: "This item isn't on the menu", with a link back |
| `/qr/demo` | Printable table card with the QR code; `/qr/demo/qr.png` is a 1600 px PNG |

### 3D viewer and AR

The item page loads Google's `<model-viewer>` lazily, only on item pages. The catalog only loads thumbnails.

| Device | 3D in the page | AR |
| --- | --- | --- |
| iPhone / iPad (Safari and other iOS browsers) | GLB | **AR Quick Look** with the original USDZ (`ios-src`) |
| Android, Chrome | GLB | **WebXR** where available, otherwise **Scene Viewer**, both using the GLB |
| Desktop | GLB | none; the page shows a QR code that opens the same item on a phone |
| Item with only a USDZ (no GLB) | poster image only | iPhone/iPad via a native `<a rel="ar">` Quick Look link; elsewhere a clear "opens on iPhone and iPad" note |

AR only starts from the **View in AR** button, so the camera permission prompt only appears then. Nothing is
recorded or uploaded; Quick Look and Scene Viewer are the operating system's own AR viewers.

**True size.** `scale.lockScaleInAR: true` sets `ar-scale="fixed"` (and `#allowsContentScaling=0` for Quick
Look), so customers can't pinch-resize a dish away from its real size. Each item records `scale.dimensionsCm`,
where that size came from (`"file"` or `"measured"`) and whether someone has checked it (`verified`). The item
page says plainly when the size hasn't been checked.

### The Luffy test item

`public/catalog/demo/luffy/luffy.usdz` is the original file, byte for byte (an iPhone Object Capture scan). Its
authored size is 7.56 × 9.69 × 6.59 cm. That comes from the file and has **not** been checked against the figure,
so it is marked `source: "file", verified: false`.

`luffy.glb` is a real conversion of that USDZ by `scripts/usdz_to_gltf.py`: the same mesh, UVs and textures,
re-encoded, with the size unchanged. It is what makes the in-browser 3D view and Android AR possible. The poster
and thumbnail are rendered from the GLB.

### QR codes

Codes are static and generated locally with the `qrcode` package (no third-party QR service). Each one encodes
the full catalog URL: `https://<slug>.dekhkhao.com` in subdomain mode, `<base>/r/<slug>` in path mode. For
restaurants created in the admin, take the code from the restaurant's admin page (or its printable card). For the
built-in JSON menus:

```bash
npm run qr -- demo --root dekhkhao.com                    # https://demo.dekhkhao.com
npm run qr -- demo --base https://your-vercel-or-custom-domain   # <base>/r/demo
```

This writes `public/qr/demo-catalog.png` (1600 px), `.svg` and `.txt` (the exact URL encoded). Without `--base`
(and without `NEXT_PUBLIC_APP_URL`), it writes a **development** code for this computer's Wi-Fi address,
`public/qr/demo-catalog.dev.*`, so a phone on the same network can open `npm run dev`. Development codes are
git-ignored and must never be printed.

After deploying, `https://<your-domain>/qr/demo` shows the production code, ready to print or download. Re-run the
command (or reprint from `/qr/<slug>`) whenever the domain changes; a printed code works for as long as its URL does.

### Adding a restaurant (admin console)

1. Sign in at `admin.dekhkhao.com` and **Add a restaurant**: its name and website address (the subdomain).
2. Add categories, then items. In each item, upload a **GLB** (3D in the browser and Android AR) and, for the best
   iPhone AR, the **USDZ**; add a poster and a thumbnail, and set the real size in cm. The preview at the bottom uses
   the private draft files.
3. **Publish.** It refuses with a list of problems if a visible item has no model or size, or a file failed its
   checks. Once published, `https://<slug>.dekhkhao.com` is live. Edits stay private until you publish again;
   **Unpublish** takes the menu offline. Files that the live menu stops using are removed from the public bucket.
4. Print the QR code from the restaurant's admin page, after checking the menu on real phones (below).

The admin can't convert USDZ to GLB. If you only have a USDZ, convert it locally first (`scripts/usdz_to_gltf.py`,
see step 4 of the JSON flow below) and upload both.

### Adding a built-in JSON menu (the demo)

The demo menu is a JSON record built into the app, so it works without the database. To add another one:

1. **Record.** Copy `src/catalog/restaurants/demo.json` to `<slug>.json`. The slug is the permanent URL
   (`/r/<slug>`): lowercase letters, numbers and hyphens, and don't change it once QR codes are printed. Set
   `name`, `catalogTitle`, optional `logo` (a path under `public/`), optional `accent` (hex), `indexable` and
   `categories`.
2. **Register.** Import it in `src/catalog/restaurants/index.ts` and add it to `restaurantRecords`.
3. **Items.** Add each dish to `items`: `slug`, `name`, `description`, `category`, and asset paths under
   `/catalog/<restaurant>/<item>/`.
4. **3D assets.** Put the files in `public/catalog/<restaurant>/<item>/`. A GLB is needed for in-browser 3D and
   Android AR; a USDZ is used for iPhone AR. If you only have a USDZ (e.g. an iPhone Object Capture scan), set a
   `glb` path anyway and run:
   ```bash
   pip install usd-core            # once; set USD_PYTHON if that python isn't `python`
   npm run catalog:assets -- <restaurant>
   ```
   It converts the USDZ to GLB and renders the poster and thumbnail. With your own GLB, it only renders the images.
5. **Scale.** Measure the real dish and set `scale.dimensionsCm`. Use `source: "measured"` and `verified: true`
   only after comparing the model with the real item (the build rejects `verified` without `measured`). Keep
   `lockScaleInAR: true` for dishes.
6. **Test.** Run `npm run dev` and open `/r/<slug>`. Then generate a dev QR code (`npm run qr -- <slug>`), scan it
   with a phone on the same Wi-Fi, and try View in AR on an iPhone and an Android phone. `npm run build` validates
   every record and fails with a readable list of problems.
7. **QR code.** After deploying, run `npm run qr -- <slug> --base https://<domain>` or open `/qr/<slug>`, and print.
8. **Deploy.** Commit and push; Vercel rebuilds. Also reserve the slug in the database with a migration (as `demo`
   is in `restaurants_slug_reserved`) so nobody can create an admin restaurant with the same address. Don't add it
   to `src/lib/hosts.ts`: that list blocks the subdomain itself.

### Testing on real phones

Automated checks can't open the phones' native AR viewers, so check these on real devices before a restaurant
goes live:

- [ ] iPhone Safari: `/r/<slug>` loads, the item turns in 3D, View in AR opens Quick Look, and the size looks right on a table
- [ ] Android Chrome: the same, AR opens (WebXR or Scene Viewer), and pinch-resize is disabled
- [ ] Slow connection: thumbnails appear first, then the model with its progress bar
- [ ] Connection dropped mid-load: the error state and "Try again" work

## Contact flow

`ContactForm` validates on the client, builds the message in `lib/whatsapp.ts`, and opens
`https://wa.me/923353989333?text=…`. Nothing is stored or sent anywhere else. Change the number in `config/site.ts`.

## Visual assets (photos, 3D models, renders)

Everything visual is listed once, in [`src/content/assets.manifest.json`](src/content/assets.manifest.json).
Components read it through `src/content/assets.ts`, and nothing hard-codes an image path.

| Kind | Where it's used | Output |
| --- | --- | --- |
| `photos` | none at the moment — add restaurant photography here | `public/photos/*.jpg` |
| `models` | live 3D viewer (tech section) | `public/models/*.glb`, **true to size** |
| `renders` | hero phone, scroll story, How it works, size comparator | `public/renders/*.webp` (transparent stills of the models) |
| `textures` | every table surface, 3D lighting | `public/textures`, `public/env` |

**True-to-size rule.** Each model declares its real dimension (`"realSize": { "dimension": "diameter", "value": 12, "unit": "in" }`).
`npm run assets:build` scales the scan uniformly to exactly that size in metres, centres it and rests it on the table
plane (y = 0). Use `"asScanned"` when the scan already is the real dish. The build prints the scan's measured size
and the final size, e.g. `scan 29.4cm → 30.48cm`. Top-down renders are trimmed to the dish outline, so their width
is the diameter, and the size comparator relies on that.

To swap an asset: put the source in `assets-src/` (git-ignored), edit the manifest entry, then run

```bash
npm run assets:build    # photos, textures, models → public/
npm run assets:render   # stills of the models (uses local Chrome; set CHROME_PATH if needed)
```

**Prototype status.** The current pizza scan is a third-party placeholder (credits are in the manifest and in the
site footer). Replace them with the restaurant's own photography and scans of its own dishes before public launch.

## Urdu

The Urdu brand name always renders through `<UrduWordmark>` from `siteConfig.nameUrdu`, in the Gulzar Nastaliq face,
with `lang="ur" dir="rtl"`. Nastaliq needs tall line-heights and must never be letter-spaced or clipped. Keep
generous space above and below it. Don't add other Urdu copy unless a fluent speaker has checked it.

## Accessibility & motion

Semantic landmarks, one `h1`, labelled form fields with inline errors, native `<details>` FAQ, visible focus rings,
and 44px+ touch targets. `prefers-reduced-motion` is respected globally: Motion's `reducedMotion="user"`, CSS
animations collapse, and the scroll story becomes a static list.
