"use client";

import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { renders } from "@/content/assets";
import { PhoneFrame } from "@/components/visuals/PhoneFrame";
import { QrGlyph } from "@/components/visuals/QrGlyph";
import { Reticle } from "@/components/visuals/Reticle";
import { Bolt, Dots, Sparks, Wedge } from "@/components/brand/Shapes";

const SIZES = [10, 12, 14] as const;
type Size = (typeof SIZES)[number];

const spring = { stiffness: 110, damping: 18, mass: 0.6 };

/**
 * Hero composition: a restaurant table seen from above, a phone held over it,
 * and the pizza that only exists on the phone screen. The size chips resize the
 * pizza and its dashed footprint on the "real" table — the core idea in one gesture.
 */
export function HeroStage() {
  const reduce = useSafeReducedMotion();
  const [size, setSize] = useState<Size>(12);

  // Pointer tilt (fine pointers only). Motion values keep this off React's render cycle.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const rotX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const phoneX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const phoneY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const scale = size / 14;
  const cm = (size * 2.54).toFixed(1);

  return (
    <div className="relative [perspective:1400px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* cut-paper shapes around the stage, from the brand sheet (intro + parallax: HeroMotion) */}
      <Wedge className="absolute -right-5 -top-9 z-0 w-24 rotate-[14deg] sm:-right-9 sm:w-32" data-h="sticker" data-depth="1.4" />
      <Bolt className="absolute -bottom-10 -left-6 z-20 w-24 rotate-[-10deg] sm:-left-10 sm:w-32" data-h="sticker" data-depth="-0.9" />
      <Sparks className="absolute -left-3 -top-10 z-0 w-12 -rotate-12 sm:w-14" color="var(--color-orange)" data-h="sticker" data-depth="1.8" />

      <div data-h="stage" className="relative z-10">
      <motion.div
        style={reduce ? undefined : { rotateX: rotX, rotateY: rotY }}
        className="relative z-10 mx-auto aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[2rem] bg-teal shadow-[0_40px_80px_-40px_rgb(0_68_61/0.65)] [transform-style:preserve-3d] md:rounded-[2.5rem]"
      >
        {/* a quiet teal-on-teal peak gives the field depth without a gradient */}
        <svg aria-hidden viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[42%] w-full">
          <path d="M0 80 L0 46 L30 8 L54 44 L72 26 L100 58 L100 80 Z" fill="var(--color-teal-deep)" />
        </svg>
        <Dots className="absolute left-[8%] top-[9%] w-[13%]" data-h="dots" />

        {/* table tent with the QR code and the sizes on the menu */}
        <div
          className="absolute bottom-[7%] left-[6%] w-[37%] rotate-[-8deg] rounded-2xl bg-cream p-[4%] shadow-[0_18px_30px_-14px_rgb(0_0_0/0.55)]"
          aria-hidden
          data-h="tent"
        >
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-teal sm:text-[0.62rem]">Scan me</p>
          <p className="mt-0.5 font-display text-[0.72rem] font-bold leading-tight tracking-tight text-charcoal sm:text-sm">Pepperoni</p>
          <div className="mt-1.5 space-y-0.5 text-[0.52rem] font-medium tabular-nums text-muted sm:text-[0.62rem]">
            {SIZES.map((s) => (
              <p key={s} className={`flex justify-between ${s === size ? "font-bold text-orange-ink" : ""}`}>
                <span>{s} inch</span>
                <span>{s === size ? "on table" : ""}</span>
              </p>
            ))}
          </div>
          <QrGlyph className="mt-2 w-[46%] text-teal [--qr-bg:var(--color-cream)]" />
        </div>

        {/* dashed footprint: where the virtual pizza "sits" on the real table */}
        <motion.div
          aria-hidden
          className="absolute left-[68%] top-[44%] aspect-square w-[86%] rounded-full border-2 border-dashed border-yellow/70"
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />

        {/* ---- the phone ---- */}
        <motion.div style={reduce ? undefined : { x: phoneX, y: phoneY }} className="absolute right-[9%] top-[7%] w-[46%] rotate-[5deg]">
          <div data-h="phone">
          <div className={reduce ? "" : "animate-float-y"}>
            <PhoneFrame screenClassName="table-surface">
              <div className="absolute inset-0 bg-[#1b1714]/20" />

              {/* app chrome */}
              <div className="absolute inset-x-[7%] top-[9%] flex items-center justify-between">
                <span className="rounded-full bg-cream/95 px-2.5 py-1 text-[0.55rem] font-semibold text-charcoal sm:text-[0.66rem]">Pepperoni</span>
                <span className="rounded-full bg-teal px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-cream sm:text-[0.58rem]">AR</span>
              </div>

              {/* placement: the real 3D scan, seen from above like the table around the phone */}
              <div className="absolute inset-x-0 top-[25%] flex aspect-square items-center justify-center">
                <Reticle className="absolute aspect-square w-[96%] opacity-70" />
                <div className="relative w-[84%]" data-h="pizza">
                <motion.div
                  className="relative w-full"
                  initial={false}
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 90, damping: 15 }}
                >
                  <div aria-hidden className="absolute inset-[3%] translate-x-[2%] translate-y-[4%] rounded-full bg-black/50 blur-md" />
                  <Image
                    src={renders.pizzaTop.src}
                    width={renders.pizzaTop.width}
                    height={renders.pizzaTop.height}
                    alt="3D scan of a pepperoni pizza placed on the table in the camera view"
                    sizes="(min-width: 1024px) 240px, 45vw"
                    priority
                    className="relative w-full"
                  />
                </motion.div>
                </div>
              </div>

              {/* measurement */}
              <div className="absolute inset-x-0 bottom-[23%] flex justify-center">
                <span className="rounded-full bg-cream px-3 py-1 text-[0.58rem] font-semibold tabular-nums text-charcoal shadow sm:text-[0.7rem]">
                  {size} in <span className="font-normal text-muted">/ {cm} cm</span>
                </span>
              </div>

              {/* size chips: real buttons, big enough for thumbs */}
              <div
                role="radiogroup"
                aria-label="Pizza size"
                className="absolute inset-x-[6%] bottom-[6%] grid grid-cols-3 gap-1 rounded-full bg-charcoal/75 p-1 backdrop-blur"
              >
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={s === size}
                    onClick={() => setSize(s)}
                    className={`relative min-h-8 rounded-full text-[0.62rem] font-bold sm:min-h-10 sm:text-xs ${s === size ? "text-charcoal" : "text-cream"}`}
                  >
                    {s === size && (
                      <motion.span
                        layoutId="hero-size"
                        className="absolute inset-0 rounded-full bg-yellow"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    <span className="relative">{s}&Prime;</span>
                  </button>
                ))}
              </div>
            </PhoneFrame>
          </div>
          </div>
        </motion.div>

        <p
          className="hand absolute bottom-[4%] right-[6%] max-w-[46%] text-right text-[1.05rem] leading-tight text-cream sm:text-[1.35rem]"
          data-h="hint"
        >
          Tap a size to compare
        </p>
      </motion.div>
      </div>
    </div>
  );
}
