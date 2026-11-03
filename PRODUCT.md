# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary (buyer):** restaurant owners, general managers and marketing managers in Pakistan, evaluating whether to add DekhKhao to their restaurant. They arrive on the marketing site from WhatsApp, social or a referral, usually on a phone.
- **End user (diner):** a restaurant customer at a table who scans a QR code, picks a dish and sees it in AR before ordering. They never visit the marketing site; they use the menu app at `/r/<slug>` or `<slug>.dekhkhao.com`.

## Product Purpose
DekhKhao is a simple, fully managed augmented-reality experience that lets restaurant customers see food at its actual size before ordering. Success for a restaurant: fewer "how big is it?" doubts and a memorable, visual menu. Success for the marketing site: a restaurant decision maker contacts DekhKhao on WhatsApp.

## Positioning
- See food at its **real, measured size** on your own table, through the phone camera. True size is the core promise, not a 3D picture of food.
- **Fully managed:** the restaurant sends its dishes; DekhKhao builds the true-to-size 3D models, hosts the AR experience and provides the table QR codes.
- It is **not** a POS system, an ordering platform, or a conventional digital menu. Ordering and payment stay exactly as the restaurant already does them.
- No app to download: scan a QR code, the experience opens in the phone's browser (AR Quick Look on iPhone, WebXR / Scene Viewer on Android).

## Operating Context
Diner: at a restaurant table, phone in hand, often dim light and patchy mobile data. Buyer: decides over WhatsApp and in person; the contact form opens a pre-filled WhatsApp message to +92 335 3989333 (no backend form submission).

## Capabilities and Constraints
- Next.js 16 app, one project: marketing site (`/`, `/privacy`), customer menu app (`/r/<slug>`, later `<slug>.dekhkhao.com`), table QR cards (`/qr/<slug>`), admin console (`/admin`, Supabase + Cloudflare R2). Deployed on Vercel (`dekh-khao.vercel.app`; `dekhkhao.com` purchased).
- AR: `<model-viewer>`; GLB for 3D/Android, original USDZ for iPhone Quick Look; scale locked in AR.
- Brand name: English **DekhKhao** (one word, capital D and K); Urdu **دیکھ کھاؤ** (exact spelling). Tagline: "What you see is what you get." Standalone brand: no parent-company attribution anywhere.
- Copy is primarily English; no Romanized Urdu; no invented Urdu.

## Brand Commitments
- Brand identity sheet (supplied 2026-11-03) is binding: Dekh Teal #005F56, Khao Orange #FF6B00, Zest Yellow #F7C600, Pop Pink #E6007A, Cream #FAF9F4, Charcoal #2B2B2B; Sora for headlines/UI/body; a handwritten style for taglines and accents; geometric Urdu logo mark (teal دیکھ, orange/yellow کھاؤ, pink dots); playful, minimal, expressive illustration; geometric brand shapes for backgrounds and accents.
- The English wordmark may be set visually as "Dekh / Khao" (two lines or two tones) but the name is always written DekhKhao.

## Evidence on Hand
- 3D pizza scan (Polycam, prototype-only, must be replaced) and its renders: `public/models`, `public/renders`.
- Luffy USDZ test item at `/r/demo` (owner's own testing; never shown in marketing).
- AR demo recording (`public/media/ar-demo.*`): third-party ar-code.com Pizza Hut demo, 9:16, 14 s. Must be labelled as an example recording, never presented as DekhKhao's own work or client. To be replaced by DekhKhao's own recording.
- Live-demo QR code: to be supplied by the owner (opens an AR pizza). Not yet in the repo.
- No customers, testimonials, logos, statistics or prices exist. Never invent them.

## Product Principles
1. Real size is the promise; every visual that shows food in AR must be honest about scale.
2. Fully managed means the restaurant never touches 3D tooling.
3. A visual layer, never an ordering system.
4. Prove with demonstrations, not claims; label example and prototype material as such.
5. Phone first: the diner and usually the buyer are on a phone.

## Accessibility & Inclusion
WCAG AA contrast, 44px touch targets, keyboard access, `prefers-reduced-motion` respected, captions or descriptive text for video content, correct RTL and shaping for any Urdu.
