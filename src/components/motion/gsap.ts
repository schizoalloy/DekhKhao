"use client";

/**
 * One place to register GSAP plugins (GSAP 3.13+ ships every plugin free, SplitText included).
 * Import gsap, ScrollTrigger etc. from here so registration always happens first.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // DekhKhao's motion identity: one signature ease, three durations.
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
}

export const DUR = { quick: 0.2, standard: 0.55, slow: 0.9 } as const;
/** Stickers land with a small paper-like settle (about 5% overshoot), never a bounce. */
export const STICK = "back.out(1.25)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
