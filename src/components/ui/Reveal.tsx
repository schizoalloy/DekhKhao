import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Items revealed together are also staggered automatically. */
  delay?: number;
  /** @deprecated Kept for call-site compatibility; distance is set by the page motion system. */
  y?: number;
  as?: "div" | "li" | "section" | "figure";
};

/**
 * Marks content to settle into place as it scrolls into view. The animation itself lives in
 * components/motion/PageMotion.tsx; without JS or with reduced motion this is a plain element.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Comp = as;
  return (
    <Comp className={className} data-reveal="" data-reveal-delay={delay || undefined}>
      {children}
    </Comp>
  );
}
