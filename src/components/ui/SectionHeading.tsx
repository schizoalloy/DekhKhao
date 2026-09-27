import type { ReactNode } from "react";

type SectionHeadingProps = {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  tone?: "ink" | "paper";
  className?: string;
};

/** Editorial section opener: numbered eyebrow, display title, short lede. */
export function SectionHeading({ index, eyebrow, title, lede, id, tone = "ink", className = "" }: SectionHeadingProps) {
  const muted = tone === "ink" ? "text-muted" : "text-paper/65";
  return (
    <header className={`max-w-3xl ${className}`}>
      <p className={`eyebrow flex items-center gap-3 ${muted}`}>
        {index && <span className="text-chilli">{index}</span>}
        <span aria-hidden className="h-px w-8 bg-current opacity-40" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-5 font-display text-[clamp(2.1rem,5.4vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance"
      >
        {title}
      </h2>
      {lede && <p className={`mt-6 max-w-[58ch] text-[1.05rem] leading-relaxed ${muted}`}>{lede}</p>}
    </header>
  );
}

/** Italic serif accent used inside display headings. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic tracking-[-0.01em]">{children}</em>;
}
