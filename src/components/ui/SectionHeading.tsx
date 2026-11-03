import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  /** "paper" for teal or dark grounds. */
  tone?: "ink" | "paper";
  className?: string;
  /** @deprecated Section labels above headings were retired with the 2026 brand. Ignored. */
  eyebrow?: string;
  /** @deprecated Ignored. */
  index?: string;
};

/** Section opener: a bold Sora headline and a short lede, stacked. */
export function SectionHeading({ title, lede, id, tone = "ink", className = "" }: SectionHeadingProps) {
  const muted = tone === "ink" ? "text-muted" : "text-cream/80";
  return (
    <header className={`max-w-3xl ${tone === "paper" ? "[--hand:var(--color-yellow)]" : ""} ${className}`}>
      <h2
        id={id}
        data-split=""
        className="font-display text-[clamp(2rem,4.8vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-balance"
      >
        {title}
      </h2>
      {lede && <p className={`mt-5 max-w-[56ch] text-[1.05rem] leading-relaxed ${muted}`}>{lede}</p>}
    </header>
  );
}

/** Handwritten aside inside a headline, in the brand's tagline voice. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="hand inline-block pb-1 text-[1.18em] leading-[1.1] text-[color:var(--hand,var(--color-teal))]">
      {children}
    </span>
  );
}
