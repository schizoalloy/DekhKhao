# DekhKhao

**DekhKhao** (دیکھ کھاؤ) by Portive Technologies. _What you see is what you get._

One Next.js project, two parts:

- **Marketing site** at `/` and `/privacy`.
- **Customer menu app** at `/r/<restaurant>`: the page a restaurant's table QR code opens. Customers pick an item,
  turn it in 3D and place it on their table in AR. It is a visual layer only: there is no cart, ordering or payment.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · `<model-viewer>`. Everything is prerendered;
there is no backend, database or server to run.

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
    r/[restaurantSlug]/          customer menu: catalog page, [itemSlug]/ item page, not-found pages
    qr/[restaurantSlug]/         printable table QR card + qr.png download (not indexed)
  catalog/
    types.ts           Restaurant / CatalogItem / ModelAsset / ModelScale
    restaurants/       one <slug>.json per restaurant + index.ts registry
    data.ts            async data access + build-time validation (swap for a database later)
  config/app.ts        customer app base URL (NEXT_PUBLIC_APP_URL) and catalog URL helpers
  components/catalog/  menu header/footer, item card, 3D viewer + AR logic, desktop phone hand-off
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

No production domain is hard-coded. All variables are optional; see `.env.example`.

| Variable | Used for | Fallback |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | catalog links and QR codes (`<url>/r/<slug>`) | `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | marketing canonical / Open Graph URLs | Vercel's production domain, then localhost |
| `NEXT_PUBLIC_ROOT_DOMAIN` | reserved for future `<restaurant>.<root>` subdomains | unused |

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them. No secrets are needed.

## Customer menu app

### Routes

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
the full catalog URL, `<base>/r/<slug>`.

```bash
npm run qr -- demo --base https://your-vercel-or-custom-domain
```

This writes `public/qr/demo-catalog.png` (1600 px), `.svg` and `.txt` (the exact URL encoded). Without `--base`
(and without `NEXT_PUBLIC_APP_URL`), it writes a **development** code for this computer's Wi-Fi address,
`public/qr/demo-catalog.dev.*`, so a phone on the same network can open `npm run dev`. Development codes are
git-ignored and must never be printed.

After deploying, `https://<your-domain>/qr/demo` shows the production code, ready to print or download. Re-run the
command (or reprint from `/qr/<slug>`) whenever the domain changes; a printed code works for as long as its URL does.

### Adding a restaurant

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
8. **Deploy.** Commit and push; Vercel rebuilds. No database or server changes.

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
