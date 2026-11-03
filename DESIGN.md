---
name: DekhKhao
description: What you see is what you get. A playful, cut-paper brand for a real-size AR food preview.
colors:
  teal: "#005F56"
  teal-deep: "#00443D"
  teal-soft: "#D9E9E5"
  orange: "#FF6B00"
  orange-ink: "#B84700"
  yellow: "#F7C600"
  pink: "#E6007A"
  cream: "#FAF9F4"
  cream-deep: "#F3ECDD"
  charcoal: "#2B2B2B"
  muted: "#5C5B55"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 13vw, 7.25rem)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.8vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  hand:
    fontFamily: "Caveat, 'Segoe Print', cursive"
    fontSize: "1.18em"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0em"
rounded:
  sm: "12px"
  md: "16px"
  lg: "28px"
  xl: "40px"
  pill: "9999px"
spacing:
  gutter: "20px"
  gutter-md: "40px"
  gutter-xl: "56px"
  section: "96px"
  section-md: "128px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.teal-deep}"
  button-pop:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "56px"
  chip-size-active:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "52px"
  field-teal:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
---

# Design System: DekhKhao

## Overview

DekhKhao's world is the brand identity sheet brought to life: a cream page where food snaps onto the table at real
size the way the cut-paper pieces of the Urdu mark snap together. Flat colour, no gradients doing the work, bold Sora
headlines with a handwritten Caveat aside in each one, and a small family of geometric "stickers" (wedge, bolt, peak,
dots, arch, sparks) scattered with intent, never as wallpaper. It is playful, but it is selling a real promise to
restaurant owners, so every playful element sits next to plain, honest information about size.

The geometric Urdu mark (دیکھ in teal, کھاؤ in orange and yellow, two pink dots) is the identity; the English name
sits beside it, set "Dekh / Khao" on two lines but always written DekhKhao.

## Colors

### Primary
- **Dekh Teal** `#005F56`: whole fields (the hero stage, the demo, the footer), primary buttons, headings on cream,
  icons. Teal Deep `#00443D` is its shadow side: hover state, the technology section, the arch behind the phone.

### Secondary
- **Khao Orange** `#FF6B00`: cut-paper shapes, the brush swoosh, the play button, the "pop" button, focus rings.
  Never small text on cream; use Orange Ink `#B84700` when orange must be read as text.
- **Zest Yellow** `#F7C600`: the highlighter behind key words, sparks, the active size chip, accents on teal.

### Tertiary
- **Pop Pink** `#E6007A`: only the two dots (in the mark and as a sticker). Never text, never a fill larger than a dot.

### Neutral
- **Cream** `#FAF9F4`: the page. **Cream Deep** `#F3ECDD`: alternate section ground and the arch shape.
- **Charcoal** `#2B2B2B`: headings and body text. **Muted** `#5C5B55`: secondary text (5.9:1 on cream).

### Named Rules
- **One field at a time.** A section is either cream or teal; never split a section into two grounds except the
  managed-service split card, which is the point of that section.
- **Accents are stickers.** Orange, yellow and pink appear as shapes, strokes and chips, not as large text or washes.

## Typography

Sora carries everything readable; Caveat carries one handwritten phrase per heading and taglines.

### Hierarchy
- **Display** (Sora 800, -0.045em, 0.86 leading): only the stacked "Dekh / Khao" wordmark.
- **Headline** (Sora 700, -0.035em): one per section, with a Caveat aside in teal (yellow on teal grounds).
- **Title** (Sora 700, ~1.3rem): item titles in lists and grids.
- **Body** (Sora 400, 1.05rem, 1.65 leading, max ~56ch).
- **Hand** (Caveat 700): taglines, the aside inside headlines, small captions on the AR stage.

### Named Rules
- **No labels above headings.** The headline speaks for itself; no eyebrows, no section numbers.
- **Numbers are tabular,** not monospaced (sizes, measurements).

## Layout

`container-page`: max 1400px, 20px gutters on phones, 40px from 768px, 56px from 1280px. Sections breathe at
96px (128px from md). Desktop compositions are asymmetric on a 12-column grid; every multi-column layout collapses to
one column on phones except short step lists, which stay in a 2×2 grid. The first viewport holds the mark, the
tagline, one sentence and both actions on every size.

## Elevation & Depth

Depth comes from flat overlap (stickers over fields, the phone over the table), not from shadow stacks. Shadows are
soft, offset downward and tinted teal or charcoal, used only on objects that physically sit above a surface: the hero
stage, phone frames, the table tent, buttons.

## Shapes

Radii: 12–16px for inputs, icon tiles and small cards; 28px for feature panels; 40px for the large teal fields;
pills for every button and chip. The sticker shapes (wedge, bolt, peak, dots, arch, sparks, swoosh) are fixed
geometry in `src/components/brand/Shapes.tsx`; the mark and the peeking cat are traced from the brand sheet in
`src/components/brand/art.ts`.

## Components

### Buttons
Pill, 56px tall for primary actions, Sora 600. Teal for the main action ("Talk to Us"), orange with charcoal text as
the "pop" variant, cream on teal grounds, an outlined ghost when a second action is needed. Press state scales to 0.97.

### Chips
The size selector (10″ / 12″ / 14″): a teal or charcoal track with a yellow active pill that slides between options.

### Cards / Containers
Feature panels at 28px radius: the yellow/teal managed-service split, the cream "Try it yourself" card on teal.
FAQ items are white rounded rows that turn white with a teal ring when open.

### Inputs / Fields
Cream fill, 16px radius, charcoal 20% border, teal border plus a soft teal ring on focus, orange ring when invalid.
Label above, helper or error below.

### Navigation
Mark plus "DekhKhao" in teal on the left, four text links with an orange underline on hover, one teal "Talk to Us"
pill. On phones, a full-height sheet with large teal links.

### AR stage (signature)
A teal field holding a phone over a wooden table: the real 3D pizza scan, a dashed real-size footprint, and size
chips that rescale both. The demo video sits in a charcoal phone bezel at its native 9:16.

## Do's and Don'ts

### Do:
- Put the mark first; let the English name sit beside it.
- Show real size with real numbers, and say plainly when a size hasn't been verified.
- Label example and third-party media as examples.
- Use one handwritten aside per heading.

### Don't:
- Don't use gradients for fills or text, glass panels, or neon glows.
- Don't put eyebrows, kickers or section numbers above headings.
- Don't use pink for anything bigger than a dot, or orange for small text on cream.
- Don't use bounce or elastic easing; arrivals use ease-out (GSAP `expo.out`, CSS `cubic-bezier(0.16, 1, 0.3, 1)`). The one small overshoot, `back.out(1.25)`, is kept for cut-paper stickers landing.
- Don't animate anything when `prefers-reduced-motion: reduce` is set: all GSAP motion and Lenis live inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
- Don't present DekhKhao as an ordering, POS or digital-menu system.
