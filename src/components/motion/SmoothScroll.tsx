"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./gsap";

const NAV_OFFSET = -88;

/**
 * Smooth, inertial scrolling for the marketing page (Lenis on GSAP's ticker, so ScrollTrigger
 * and the scroll-linked animations stay in lockstep). Off for reduced-motion users; touch
 * devices keep their native scrolling. In-page links glide to their section.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors ("#demo", "/#faq") scroll smoothly instead of jumping.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = url.hash === "#top" ? 0 : document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target === null) return;
      e.preventDefault();
      // let a closing mobile menu release the scroll lock first
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          lenis.scrollTo(target, { offset: NAV_OFFSET, duration: 1.3 });
          history.replaceState(null, "", url.hash);
        }),
      );
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
