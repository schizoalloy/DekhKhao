"use client";

import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { renders } from "@/content/assets";
import { PhoneFrame } from "@/components/visuals/PhoneFrame";
import { QrGlyph } from "@/components/visuals/QrGlyph";
import { Reticle } from "@/components/visuals/Reticle";

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
    <div className="[perspective:1400px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div
        style={reduce ? undefined : { rotateX: rotX, rotateY: rotY }}
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.2 }}
        className="table-surface relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-40px_rgb(60_30_10/0.6)] [transform-style:preserve-3d] md:rounded-[2.5rem]"
      >
        {/* ---- the real table ---- */}
        {/* menu card with QR */}
        <div
          className="absolute bottom-[7%] left-[6%] w-[36%] rotate-[-9deg] rounded-xl bg-paper p-[4%] shadow-[0_18px_30px_-12px_rgb(0_0_0/0.5)]"
          aria-hidden
        >
          <p className="eyebrow text-[0.5rem] text-muted sm:text-[0.58rem]">Menu</p>
          <p className="mt-1 font-display text-[0.7rem] font-semibold leading-tight tracking-tight sm:text-sm">
            Pepperoni
          </p>
          <div className="mt-1.5 space-y-0.5 font-mono text-[0.5rem] text-muted sm:text-[0.6rem]">
            {SIZES.map((s) => (
              <p key={s} className={`flex justify-between ${s === size ? "text-chilli" : ""}`}>
                <span>{s} inch</span>
                <span>{s === size ? "viewing" : ""}</span>
              </p>
            ))}
          </div>
          <QrGlyph className="mt-2 w-[46%] text-ink" />
        </div>

        {/* dashed footprint: where the virtual pizza "sits" on the real table */}
        <motion.div
          aria-hidden
          className="absolute left-[68%] top-[44%] aspect-square w-[86%] rounded-full border-[1.5px] border-dashed border-paper/45"
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />

        {/* ---- the phone ---- */}
        <motion.div
          style={reduce ? undefined : { x: phoneX, y: phoneY }}
          className="absolute right-[9%] top-[7%] w-[46%] rotate-[5deg]"
        >
          <div className={reduce ? "" : "animate-float-y"}>
            <PhoneFrame screenClassName="table-surface">
              {/* darkened "camera" view */}
              <div className="absolute inset-0 bg-[#1b1714]/25" />

              {/* app chrome */}
              <div className="absolute inset-x-[7%] top-[9%] flex items-center justify-between">
                <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[0.55rem] font-medium text-ink sm:text-[0.66rem]">
                  Pepperoni
                </span>
                <span className="eyebrow rounded-full bg-ink/60 px-2 py-1 text-[0.48rem] text-paper backdrop-blur sm:text-[0.56rem]">
                  AR · Live
                </span>
              </div>

              {/* placement — the real 3D scan, seen from above like the table around the phone */}
              <div className="absolute inset-x-0 top-[25%] flex aspect-square items-center justify-center">
                <Reticle className="absolute aspect-square w-[96%] opacity-70" />
                <motion.div
                  className="relative w-[84%]"
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 90, damping: 15, delay: reduce ? 0 : 1.1 }}
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

              {/* measurement */}
              <div className="absolute inset-x-0 bottom-[23%] flex justify-center">
                <span className="rounded-full bg-paper px-3 py-1 font-mono text-[0.58rem] text-ink shadow sm:text-[0.7rem]">
                  {size} in <span className="text-muted">/ {cm} cm</span>
                </span>
              </div>

              {/* size chips — real buttons, big enough for thumbs */}
              <div
                role="radiogroup"
                aria-label="Pizza size"
                className="absolute inset-x-[6%] bottom-[6%] grid grid-cols-3 gap-1 rounded-full bg-ink/70 p-1 backdrop-blur"
              >
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={s === size}
                    onClick={() => setSize(s)}
                    className="relative min-h-8 rounded-full text-[0.62rem] font-medium text-paper sm:min-h-10 sm:text-xs"
                  >
                    {s === size && (
                      <motion.span
                        layoutId="hero-size"
                        className="absolute inset-0 rounded-full bg-chilli"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    <span className="relative">{s}&Prime;</span>
                  </button>
                ))}
              </div>
            </PhoneFrame>
          </div>
        </motion.div>

        {/* caption */}
        <p className="absolute bottom-[4%] right-[6%] max-w-[42%] text-right text-[0.62rem] leading-snug text-paper/70 sm:text-xs">
          Tap a size to compare.
        </p>
      </motion.div>
      <p className="mx-auto mt-3 max-w-[560px] text-xs text-muted">
        Illustrative concept — not a live AR demo.
      </p>
    </div>
  );
}
