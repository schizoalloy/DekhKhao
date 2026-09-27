# DekhKhao — landing page

Marketing site for **DekhKhao** (دیکھ کھاؤ) by Portive Technologies.
_What you see is what you get._

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion. The site is fully static, with no backend.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (static)
npm run typecheck
```

## Structure

```
src/
  app/                 layout (fonts, metadata), page, globals.css (design tokens), OG image, robots, sitemap, icon
  config/site.ts       name, Urdu name, tagline, WhatsApp number, base URL resolution
  content/
    copy.ts            problem / steps / benefits / FAQ copy
    assets.manifest.json  every photo, texture, 3D model and render (see below)
  components/
    sections/          one component per page section (Hero, HowItWorks, FAQ, ContactForm, …)
    ui/                Button, SectionHeading, UrduWordmark, Reveal, LogoMark
    visuals/           phone frame, reticle, QR glyph, live 3D model viewer
  lib/                 whatsapp.ts (message builder), random.ts (deterministic SVG helpers)
```

## Domain / environment

No production domain is hard-coded. `siteConfig.url` resolves from:

1. `NEXT_PUBLIC_SITE_URL`
2. Vercel's `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`
3. `http://localhost:3000`

`NEXT_PUBLIC_ROOT_DOMAIN` is reserved for future `<restaurant>.<root>` menus. See `.env.example`.

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
