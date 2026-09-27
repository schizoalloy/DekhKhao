"use client";

import { Ruler } from "@phosphor-icons/react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { models, renders } from "@/content/assets";
import { Reticle } from "@/components/visuals/Reticle";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const stages = [
  { key: "Menu", title: "It starts as a line of text.", body: "“Pepperoni pizza, 12-inch.” Accurate, and completely abstract." },
  { key: "3D", title: "Then it becomes an object.", body: "Each dish gets a 3D form customers can turn and look at." },
  { key: "Real world", title: "Then it’s on the table.", body: "Through the phone camera, the dish appears where it would be served — at its real size." },
  { key: "True to size", title: "At exactly its real size.", body: "A 12-inch pizza is 12 inches on the table. Then they order the usual way — knowing what’s coming." },
] as const;

/**
 * useTransform whose input range always spans the full 0–1 scroll range.
 * Scroll-linked animations may run on the compositor, which doesn't hold the
 * end value outside the keyframes — so pad both ends explicitly.
 */
function useRamp<T extends number | string>(p: MotionValue<number>, input: number[], output: T[]) {
  const i = [0, ...input, 1];
  const o = [output[0], ...output, output[output.length - 1]];
  return useTransform(p, i, o);
}

// Scroll windows (0–1) for each stage
const windows: [number, number][] = [
  [0, 0.2],
  [0.26, 0.46],
  [0.52, 0.72],
  [0.78, 1],
];

function StageLabel({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const [a, b] = windows[i];
  const range = [Math.max(0, a - 0.08), a + 0.001, b - 0.001, Math.min(1, b + 0.08)];
  const first = i === 0;
  const last = i === windows.length - 1;
  const opacity = useRamp(progress, range, [first ? 1 : 0.25, 1, 1, last ? 1 : 0.25]);
  const x = useRamp(progress, range, [first ? 10 : 0, 10, 10, last ? 10 : 0]);
  const s = stages[i];
  return (
    <motion.li style={{ opacity }} className="border-t border-line py-2.5 md:py-5">
      <motion.div style={{ x }}>
        <p className="eyebrow text-chilli">
          {String(i + 1).padStart(2, "0")} — {s.key}
        </p>
        <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] md:text-2xl">{s.title}</p>
        <p className="mt-1 hidden max-w-[40ch] text-[0.95rem] leading-relaxed text-muted md:block">{s.body}</p>
      </motion.div>
    </motion.li>
  );
}

/** The transformation itself: menu line → 3D object → object on the real table → shown at real size. */
function Stage({ progress }: { progress: MotionValue<number> }) {
  // menu card
  const cardOpacity = useRamp(progress, [0.18, 0.34], [1, 0]);
  const cardY = useRamp(progress, [0.18, 0.34], ["0%", "18%"]);
  const cardScale = useRamp(progress, [0.18, 0.34], [1, 0.92]);

  // 3D: the scan grows out of the card, tilts and turns
  const topOpacity = useRamp(progress, [0.18, 0.28, 0.5, 0.58], [0, 1, 1, 0]);
  const topScale = useRamp(progress, [0.16, 0.36], [0.45, 0.86]);
  const topTilt = useRamp(progress, [0.26, 0.46], [0, 34]);
  const topSpin = useRamp(progress, [0.26, 0.56], [0, 140]);
  const meshOpacity = useRamp(progress, [0.28, 0.34, 0.44, 0.52], [0, 0.5, 0.5, 0]);

  // real world: table + the perspective render of the same scan
  const tableOpacity = useRamp(progress, [0.46, 0.6], [0, 1]);
  const arOpacity = useRamp(progress, [0.5, 0.6], [0, 1]);
  const arY = useRamp(progress, [0.5, 0.64], ["-8%", "0%"]);

  // true to size: measurement appears
  const sizeOpacity = useRamp(progress, [0.76, 0.84], [0, 1]);
  const sizeY = useRamp(progress, [0.76, 0.84], [30, 0]);
  const pizza = models.pizza;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[2rem]">
      {/* paper backdrop */}
      <div className="absolute inset-0 bg-paper-deep" />
      {/* table */}
      <motion.div style={{ opacity: tableOpacity }} className="table-surface absolute inset-0">
        <div className="absolute inset-0 flex items-center justify-center [perspective:700px]">
          <Reticle className="absolute top-[4%] aspect-square w-[80%] opacity-60 [transform:rotateX(58deg)]" />
        </div>
        <span className="eyebrow absolute left-5 top-5 text-paper/70">Camera view</span>
      </motion.div>

      {/* menu card */}
      <motion.div
        style={{ opacity: cardOpacity, y: cardY, scale: cardScale }}
        className="absolute inset-x-[10%] top-[16%] rounded-2xl bg-paper p-5 shadow-[0_30px_60px_-30px_rgb(60_30_10/0.35)] md:p-7"
      >
        <p className="eyebrow text-muted">Pizza</p>
        <ul className="mt-4 divide-y divide-line text-[0.95rem]">
          <li className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3">
              <Image
                src={renders.pizzaTop.src}
                alt=""
                width={72}
                height={70}
                sizes="40px"
                className="size-10 shrink-0"
              />
              <span>
                <span className="block font-medium">Pepperoni</span>
                <span className="font-mono text-xs text-muted">10 · 12 · 14 inch</span>
              </span>
            </span>
            <span className="rounded-full bg-ink px-3 py-1 text-xs text-paper">View in 3D</span>
          </li>
          {["Margherita", "Chicken tikka"].map((n) => (
            <li key={n} className="flex items-center gap-3 py-3 text-muted">
              <span className="size-10 shrink-0 rounded-full bg-ink/10" />
              {n}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 3D: top-down render of the scan, turning */}
      <div className="absolute inset-0 flex items-center justify-center [perspective:1100px]">
        <motion.div style={{ opacity: topOpacity, scale: topScale, rotateX: topTilt }} className="relative w-[80%]">
          <motion.div style={{ rotateZ: topSpin }} className="relative">
            <Image
              src={renders.pizzaTop.src}
              width={renders.pizzaTop.width}
              height={renders.pizzaTop.height}
              alt="3D scan of a pepperoni pizza"
              sizes="(min-width: 768px) 40vw, 80vw"
              className="w-full drop-shadow-[0_30px_30px_rgb(60_30_10/0.35)]"
            />
            <motion.svg
              style={{ opacity: meshOpacity }}
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full text-paper mix-blend-screen"
              aria-hidden
              fill="none"
            >
              {[30, 55, 80, 97].map((r) => (
                <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeWidth="0.6" />
              ))}
              {Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2;
                return (
                  <line key={i} x1="100" y1="100" x2={100 + Math.cos(a) * 97} y2={100 + Math.sin(a) * 97} stroke="currentColor" strokeWidth="0.5" />
                );
              })}
            </motion.svg>
          </motion.div>
        </motion.div>
      </div>

      {/* real world: the same scan in the camera view */}
      <motion.div style={{ opacity: arOpacity, y: arY }} className="absolute inset-x-[9%] top-[30%]">
        <Image
          src={renders.pizzaTilt.src}
          width={renders.pizzaTilt.width}
          height={renders.pizzaTilt.height}
          alt="The pizza scan placed on a wooden table, seen through the phone camera"
          sizes="(min-width: 768px) 40vw, 80vw"
          className="w-full"
        />
        {/* diameter line */}
        <motion.div style={{ opacity: sizeOpacity }} className="absolute inset-x-[1%] top-[46%] flex items-center" aria-hidden>
          <span className="h-4 w-0.5 bg-paper" />
          <span className="h-0.5 flex-1 bg-paper/90" />
          <span className="h-4 w-0.5 bg-paper" />
        </motion.div>
      </motion.div>

      {/* true-to-size readout */}
      <motion.div
        style={{ opacity: sizeOpacity, y: sizeY }}
        className="absolute inset-x-[10%] bottom-[7%] flex items-center justify-between gap-3 rounded-full bg-paper py-2 pl-5 pr-2 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)]"
      >
        <span className="truncate text-sm">
          <span className="font-medium">Pepperoni</span>{" "}
          <span className="font-mono text-muted">
            {pizza.realSize}
            <span className="hidden sm:inline"> · {pizza.sizeCm.width.toFixed(1)} cm</span>
          </span>
        </span>
        <span className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-chilli px-4 text-sm font-medium text-paper">
          <Ruler size={16} weight="bold" aria-hidden /> Actual size
        </span>
      </motion.div>
    </div>
  );
}

export function MenuToTable() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = scrollYProgress;

  if (reduce) {
    return (
      <div ref={ref} className="container-page pb-24 md:pb-36">
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s, i) => (
          <li key={s.key} className="border-t border-line pt-5">
            <p className="eyebrow text-chilli">
              {String(i + 1).padStart(2, "0")} — {s.key}
            </p>
            <p className="mt-2 font-display text-xl font-semibold">{s.title}</p>
            <p className="mt-1 text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center pb-6 pt-20 md:py-24">
        <div className="container-page grid w-full items-center gap-6 md:grid-cols-12 md:gap-10">
          <div className="order-2 md:order-1 md:col-span-5">
            <ol className="border-b border-line">
              {stages.map((s, i) => (
                <StageLabel key={s.key} i={i} progress={scrollYProgress} />
              ))}
            </ol>
            <div className="mt-5 h-px w-full bg-line">
              <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-chilli" />
            </div>
          </div>
          <div className="order-1 mx-auto w-full max-w-[min(100%,46dvh)] md:order-2 md:col-span-7 md:max-w-[min(100%,74dvh)]">
            <Stage progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}
