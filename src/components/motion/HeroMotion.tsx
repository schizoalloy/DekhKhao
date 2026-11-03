"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, STICK, useGSAP } from "./gsap";

/**
 * The hero's one authored moment. Story: the brand mark's cut-paper pieces are tossed in and
 * snap together, the name rises, the tagline writes itself, then the table scene lands piece by
 * piece and the pizza "places" on the table, the way the product places a dish in AR.
 * After the intro: scroll and pointer parallax give the stickers depth.
 *
 * Targets are marked with data-h in Hero.tsx / HeroStage.tsx. They're hidden by CSS only when
 * JS and motion are both available (html.js-motion), with a CSS fallback if this never runs.
 */
export function HeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-h]"), { visibility: "visible" });

        const pieces = q("[data-h='mark'] path");
        // deterministic scatter so every visit looks the same
        const scatter = [
          { x: -90, y: 70, rotation: -50 },
          { x: 110, y: -60, rotation: 40 },
          { x: -70, y: -90, rotation: 28 },
          { x: 40, y: -30, rotation: 0 },
        ];

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(pieces, {
          x: (i) => scatter[i % 4].x,
          y: (i) => scatter[i % 4].y,
          rotation: (i) => scatter[i % 4].rotation,
          scale: 0.35,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
          duration: 0.95,
          ease: STICK,
          stagger: 0.09,
        })
          .from(q("[data-h='word']"), { yPercent: 115, duration: 1.05, stagger: 0.11 }, 0.28)
          .fromTo(
            q("[data-h='write']"),
            { clipPath: "inset(-25% 100% -25% -8%)" },
            { clipPath: "inset(-25% -8% -25% -8%)", duration: 0.75, ease: "power2.inOut", stagger: 0.42 },
            0.62,
          )
          .fromTo(q("[data-h='swoosh']"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power3.out" }, 1.45)
          .from(q("[data-h='copy']"), { y: 22, autoAlpha: 0, duration: 0.8 }, 0.95)
          .fromTo(q("[data-h='hl']"), { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.65, ease: "power3.out" }, 1.55)
          .from(q("[data-h='cta']"), { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.1)
          // the table scene
          .from(q("[data-h='stage']"), { y: 90, rotation: 2.5, scale: 0.96, autoAlpha: 0, duration: 1.25 }, 0.15)
          .from(q("[data-h='dots']"), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: STICK }, 0.75)
          .from(q("[data-h='tent']"), { y: 70, rotation: -26, autoAlpha: 0, duration: 0.9, ease: STICK }, 0.7)
          .from(q("[data-h='phone']"), { y: -80, rotation: 12, autoAlpha: 0, duration: 1.1 }, 0.55)
          .from(q("[data-h='pizza']"), { scale: 0.25, rotation: -120, autoAlpha: 0, duration: 0.95, ease: STICK }, 1.2)
          .from(
            q("[data-h='sticker']"),
            { scale: 0, rotation: (i) => (i % 2 ? 60 : -60), autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.75, ease: STICK, stagger: 0.12 },
            0.95,
          )
          .fromTo(
            q("[data-h='hint']"),
            { clipPath: "inset(-30% 100% -30% -5%)" },
            { clipPath: "inset(-30% -5% -30% -5%)", duration: 0.8, ease: "power2.inOut" },
            1.75,
          );

        // scroll-away parallax: the scene and the copy separate in depth as the hero leaves
        const section = root.current?.closest("section");
        gsap
          .timeline({ scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 } })
          .to(q("[data-p='stage']"), { y: 70, ease: "none" }, 0)
          .to(q("[data-p='copy']"), { y: -40, ease: "none" }, 0)
          .to(q("[data-h='sticker']"), { y: (i, el) => -90 * Number((el as Element).getAttribute("data-depth") ?? 1), ease: "none" }, 0);

        // pointer parallax on desktop: stickers float at their own depth
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!fine || !section) return;
        const stickers = q("[data-h='sticker']");
        const movers = stickers.map((el) => ({
          depth: Number(el.getAttribute("data-depth") ?? 1),
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          yp: gsap.quickTo(el, "yPercent", { duration: 0.9, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(nx * 26 * m.depth);
            m.yp(ny * 14 * m.depth);
          });
        };
        section.addEventListener("pointermove", onMove);
        return () => section.removeEventListener("pointermove", onMove);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
