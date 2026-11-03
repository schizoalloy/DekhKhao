/**
 * Cut-paper brand elements from the identity sheet ("use these shapes for backgrounds,
 * sections and accents"). Plain geometry, so they're specified exactly rather than traced.
 * All decorative: aria-hidden.
 */

type ShapeProps = { className?: string; color?: string; style?: React.CSSProperties } & Record<`data-${string}`, string | boolean | undefined>;

const svgProps = { "aria-hidden": true, focusable: "false" } as const;

/** Yellow wedge: a lopsided triangle. */
export function Wedge({ className = "", color = "var(--color-yellow)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} {...svgProps} {...data}>
      <path d="M4 94 L56 4 L97 70 Z" fill={color} />
    </svg>
  );
}

/** Orange zigzag bolt. */
export function Bolt({ className = "", color = "var(--color-orange)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} {...svgProps} {...data}>
      <path d="M4 60 L42 22 L60 40 L84 14 L97 27 L60 66 L42 48 L17 74 Z" fill={color} />
    </svg>
  );
}

/** Teal peak: the angular mountain with a shoulder. */
export function Peak({ className = "", color = "var(--color-teal)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 80" className={className} style={style} {...svgProps} {...data}>
      <path d="M0 80 L32 2 L58 50 L74 28 L100 80 Z" fill={color} />
    </svg>
  );
}

/** Two pink dots (the dots of the mark). */
export function Dots({ className = "", color = "var(--color-pink)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 48" className={className} style={style} {...svgProps} {...data}>
      <circle cx="26" cy="27" r="19" fill={color} />
      <circle cx="72" cy="23" r="22" fill={color} />
    </svg>
  );
}

/** Soft cream arch. */
export function Arch({ className = "", color = "var(--color-cream-deep)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 90" className={className} style={style} {...svgProps} {...data}>
      <path d="M0 90 V50 A50 50 0 0 1 100 50 V90 Z" fill={color} />
    </svg>
  );
}

/** Three short "pop" strokes, like the marks around the logo and the cat. */
export function Sparks({ className = "", color = "var(--color-yellow)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} {...svgProps} {...data} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
      <path d="M22 6 L26 18" />
      <path d="M6 18 L17 25" />
      <path d="M4 36 L16 35" />
    </svg>
  );
}

/** Orange brush underline that sits under handwritten taglines. */
export function Swoosh({ className = "", color = "var(--color-orange)", style, ...data }: ShapeProps) {
  return (
    <svg viewBox="0 0 220 26" preserveAspectRatio="none" className={className} style={style} {...svgProps} {...data}>
      <path d="M3 19 C 52 7, 128 2, 217 8 C 214 11, 210 12, 205 12 C 140 11, 70 15, 8 24 C 4 24.5, 2 22, 3 19 Z" fill={color} />
    </svg>
  );
}
