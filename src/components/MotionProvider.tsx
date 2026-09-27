"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Honour the OS "reduce motion" setting for every Motion animation on the page. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
