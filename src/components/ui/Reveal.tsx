"use client";

import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "figure";
};

/** Fade-and-rise on first view. Renders statically for reduced-motion users. */
export function Reveal({ children, className, delay = 0, y = 28, as = "div" }: RevealProps) {
  const reduce = useSafeReducedMotion();
  const Comp = motion[as];
  if (reduce) return <Comp className={className}>{children}</Comp>;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
    >
      {children}
    </Comp>
  );
}
