"use client";

import { gsap, MOTION_OK, ScrollTrigger, SplitText, STICK, useGSAP } from "./gsap";

const DESKTOP = "(min-width: 1024px)";
const FINE = "(hover: hover) and (pointer: fine)";

/**
 * Scroll choreography for the landing page. Each section gets one motion idea that says
 * something about the product, wired through data attributes in the (server) section markup:
 *
 *   h2[data-split]         headline words rise in
 *   [data-reveal]          content settles into place (batched, staggered)
 *   [data-sticker]         cut-paper stickers land, then drift at [data-speed] while scrolling
 *   [data-expand]          a teal field grows from a rounded card to full bleed
 *   [data-rings]           "12-inch... but how big is that?": the size ring swells and shrinks
 *   [data-demo-phone]      the demo phone rises and straightens
 *   [data-trail]           How it works: the dashed path draws on, each step pops as it arrives
 *   [data-pipe]            menu, 3D model, table: revealed in that order
 *   [data-handoff]         "What you do" / "What DekhKhao does" slide together
 *   [data-assemble]        the Urdu mark assembles from scattered pieces
 *   [data-hill]            the hill rises out of the footer; the cat blinks
 *   [data-magnetic]        main buttons lean toward the pointer
 *
 * Everything is gated on prefers-reduced-motion: no-preference; with reduce, nothing moves.
 */
export function PageMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    const $ = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

    mm.add(MOTION_OK, () => {
      /* ---------- headlines ---------- */
      $("h2[data-split]").forEach((h) => {
        SplitText.create(h, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 70,
              rotation: 3,
              autoAlpha: 0,
              duration: 0.95,
              stagger: 0.045,
              scrollTrigger: { trigger: h, start: "top 88%", once: true },
            }),
        });
      });

      /* ---------- content reveals ---------- */
      const reveals = $("[data-reveal]");
      gsap.set(reveals, { autoAlpha: 0, y: 34 });
      ScrollTrigger.batch(reveals, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.08,
            delay: (i, el) => Number((el as Element).getAttribute("data-reveal-delay") ?? 0) * 0.3,
            overwrite: true,
          }),
      });

      /* ---------- stickers: land, then drift ---------- */
      $("[data-sticker]").forEach((el) => {
        gsap.from(el, {
          scale: 0,
          rotation: -40,
          transformOrigin: "50% 50%",
          duration: 0.8,
          ease: STICK,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
        const speed = Number(el.getAttribute("data-speed") ?? 0);
        if (speed)
          gsap.to(el, {
            y: () => -speed * 120,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
          });
      });

      /* ---------- teal fields grow to full bleed ---------- */
      $("[data-expand]").forEach((section) => {
        gsap.fromTo(
          section,
          { clipPath: "inset(3% 3.5% 0% 3.5% round 56px 56px 0px 0px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 96%", end: "top 30%", scrub: 0.6 },
          },
        );
      });

      /* ---------- problem: "12-inch... but how big is that?" ---------- */
      $("[data-rings]").forEach((fig) => {
        const solid = fig.querySelector("[data-ring='solid']");
        const dashed = fig.querySelectorAll("[data-ring='dashed']");
        gsap
          .timeline({ scrollTrigger: { trigger: fig, start: "top 85%", end: "bottom 15%", scrub: 0.8 } })
          .fromTo(solid, { scale: 0.72, svgOrigin: "100 100" }, { scale: 1.32, svgOrigin: "100 100", ease: "sine.inOut", duration: 1 })
          .to(solid, { scale: 0.95, svgOrigin: "100 100", ease: "sine.inOut", duration: 1 })
          .to(dashed, { rotation: (i) => (i ? -70 : 50), svgOrigin: "100 100", ease: "none", duration: 2 }, 0);
        const measure = fig.querySelector("[data-ring='measure']");
        gsap.from(measure, { scaleX: 0, svgOrigin: "100 122", duration: 1.1, scrollTrigger: { trigger: fig, start: "top 75%", once: true } });
        const ask = fig.querySelector("[data-ring='ask']");
        gsap.fromTo(
          ask,
          { clipPath: "inset(-30% 100% -30% -5%)" },
          { clipPath: "inset(-30% -5% -30% -5%)", duration: 1, ease: "power2.inOut", scrollTrigger: { trigger: fig, start: "top 65%", once: true } },
        );
      });

      /* ---------- demo phone rises and straightens ---------- */
      $("[data-demo-phone]").forEach((phone) => {
        gsap.fromTo(
          phone,
          { y: 140, rotation: -7, scale: 0.9 },
          { y: 0, rotation: 0, scale: 1, ease: "none", scrollTrigger: { trigger: phone, start: "top bottom", end: "center 58%", scrub: 0.7 } },
        );
      });

      /* ---------- How it works ---------- */
      mm.add(DESKTOP, () => {
        const trail = document.querySelector("[data-trail]");
        const icons = $("[data-step-icon]");
        if (!trail || !icons.length) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: trail.parentElement, start: "top 78%", end: "top 32%", scrub: 0.6 } });
        tl.fromTo(trail, { clipPath: "inset(-50% 100% -50% 0%)" }, { clipPath: "inset(-50% 0% -50% 0%)", ease: "none", duration: 1 }, 0);
        icons.forEach((icon, i) => {
          tl.from(icon, { scale: 0.2, rotation: -35, autoAlpha: 0, transformOrigin: "50% 50%", ease: STICK, duration: 0.22 }, Math.max(0, i * 0.3 - 0.05));
        });
      });
      mm.add("(max-width: 1023px)", () => {
        $("[data-step-icon]").forEach((icon) =>
          gsap.from(icon, { scale: 0.2, rotation: -35, autoAlpha: 0, duration: 0.7, ease: STICK, scrollTrigger: { trigger: icon, start: "top 90%", once: true } }),
        );
      });

      /* ---------- technology: menu, then model, then table ---------- */
      const pipes = $("[data-pipe]");
      if (pipes.length) {
        const fromClip = window.matchMedia(DESKTOP).matches ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 100% 0%)";
        gsap.fromTo(
          pipes,
          { clipPath: fromClip },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.inOut",
            stagger: 0.32,
            scrollTrigger: { trigger: pipes[0].parentElement, start: "top 72%", once: true },
          },
        );
      }

      /* ---------- the managed-service handoff ---------- */
      $("[data-handoff]").forEach((card) => {
        const [left, right] = Array.from(card.children);
        const checks = card.querySelectorAll("[data-check]");
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 80%", once: true } })
          .from(left, { xPercent: -105, duration: 1.1, ease: "expo.out" }, 0)
          .from(right, { xPercent: 105, duration: 1.1, ease: "expo.out" }, 0.08)
          .from(checks, { scale: 0, rotation: -90, duration: 0.5, ease: STICK, stagger: 0.07 }, 0.55);
      });

      /* ---------- Pakistan: the mark assembles ---------- */
      $("[data-assemble]").forEach((mark) => {
        const pieces = mark.querySelectorAll("path");
        const scatter = [
          { x: -240, y: 160, rotation: -70 },
          { x: 260, y: -120, rotation: 55 },
          { x: -180, y: -200, rotation: 40 },
          { x: 120, y: 220, rotation: -20 },
        ];
        gsap.fromTo(
          pieces,
          {
            x: (i) => scatter[i % 4].x,
            y: (i) => scatter[i % 4].y,
            rotation: (i) => scatter[i % 4].rotation,
            scale: 0.5,
            transformOrigin: "50% 50%",
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: mark.closest("section"), start: "top 85%", end: "center 55%", scrub: 0.9 },
          },
        );
      });

      /* ---------- footer: the hill rises, the cat blinks ---------- */
      const hill = document.querySelector("[data-hill]");
      const footer = hill?.closest("footer");
      if (hill && footer) {
        gsap.fromTo(
          hill,
          { yPercent: 70 },
          { yPercent: 0, ease: "power2.out", scrollTrigger: { trigger: footer, start: "top bottom", end: "top 62%", scrub: 0.8 } },
        );
        const lids = hill.querySelectorAll("[data-cat-lid]");
        const sparks = hill.querySelector("[data-cat-sparks]");
        const life = gsap
          .timeline({ repeat: -1, repeatDelay: 2.6, paused: true })
          .to(lids, { scaleY: 1, duration: 0.07, ease: "power2.in" })
          .to(lids, { scaleY: 0, duration: 0.11, ease: "power2.out" })
          .to(lids, { scaleY: 1, duration: 0.07, ease: "power2.in" }, "+=0.12")
          .to(lids, { scaleY: 0, duration: 0.12, ease: "power2.out" })
          .fromTo(sparks, { scale: 0.6, transformOrigin: "100% 60%" }, { scale: 1, duration: 0.5, ease: STICK }, "+=0.3");
        ScrollTrigger.create({ trigger: footer, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? life.play() : life.pause()) });
      }

      /* ---------- magnetic buttons ---------- */
      mm.add(FINE, () => {
        const offs: (() => void)[] = [];
        $("[data-magnetic]").forEach((btn) => {
          const x = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
          const y = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.28);
            y((e.clientY - (r.top + r.height / 2)) * 0.36);
          };
          const leave = () => {
            x(0);
            y(0);
          };
          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);
          offs.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });
        return () => offs.forEach((f) => f());
      });
    });
  });

  return null;
}
