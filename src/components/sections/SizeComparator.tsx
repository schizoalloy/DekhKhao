"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { renders } from "@/content/assets";

const SIZES = [10, 12, 14] as const;
type Size = (typeof SIZES)[number];

/** The table in this view is 18 inches across, so everything is drawn to one scale. */
const TABLE_IN = 18;
const area = (d: number) => Math.PI * (d / 2) ** 2;

export function SizeComparator() {
  const [size, setSize] = useState<Size>(12);
  const ratio = area(size) / area(10);

  return (
    <div>
      <div className="table-surface relative aspect-square w-full overflow-hidden rounded-[2rem]">
        {/* scale ruler */}
        <div className="absolute inset-x-[5%] bottom-[5%] flex items-center justify-between font-mono text-[0.6rem] text-paper/60 sm:text-xs">
          <span>0</span>
          <span className="mx-2 h-px flex-1 bg-paper/30" />
          <span>{TABLE_IN} in</span>
        </div>

        {/* phone for scale, ~6 in tall */}
        <div
          aria-hidden
          className="absolute right-[6%] top-[5%] rotate-[14deg] rounded-[0.9rem] bg-[#141110] p-[0.35%] shadow-[6px_10px_14px_rgb(0_0_0/0.4)]"
          style={{ width: `${(2.9 / TABLE_IN) * 100}%`, height: `${(6 / TABLE_IN) * 100}%` }}
        >
          <div className="h-full w-full rounded-[0.75rem] bg-[#2a2522]" />
        </div>
        <span className="eyebrow absolute left-[5%] top-[5%] text-[0.55rem] text-paper/60 sm:text-[0.65rem]">Phone shown for scale</span>

        {/* pizza — drawn at 14", scaled down (transform only) for smaller sizes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative"
            style={{ width: `${(14 / TABLE_IN) * 100}%` }}
            initial={false}
            animate={{ scale: size / 14 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          >
            <div className="absolute inset-[3%] translate-y-[3%] rounded-full bg-black/45 blur-lg" />
            {/* Top-down render is trimmed to the pizza, so its width is exactly the diameter. */}
            <Image
              src={renders.pizzaTop.src}
              width={renders.pizzaTop.width}
              height={renders.pizzaTop.height}
              alt={`3D scan of a pepperoni pizza shown at ${size} inches`}
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="relative w-full"
            />
            <div aria-hidden className="absolute inset-x-0 top-1/2 flex items-center">
              <span className="h-4 w-0.5 bg-paper" />
              <span className="h-0.5 flex-1 bg-paper" />
              <span className="h-4 w-0.5 bg-paper" />
            </div>
          </motion.div>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[160%] rounded-full bg-paper px-3 py-1 font-mono text-xs text-ink shadow">
            {size} in
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div role="radiogroup" aria-label="Choose pizza size" className="grid grid-cols-3 gap-1 rounded-full bg-ink p-1">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === size}
              onClick={() => setSize(s)}
              className="relative min-h-12 min-w-20 rounded-full px-4 text-sm font-medium text-paper"
            >
              {s === size && (
                <motion.span
                  layoutId="cmp-size"
                  className="absolute inset-0 rounded-full bg-chilli"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
              <span className="relative">{s} inch</span>
            </button>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-4 font-mono text-sm" aria-live="polite">
          <div>
            <dt className="eyebrow text-muted">Surface</dt>
            <dd className="mt-1 text-lg text-ink">{Math.round(area(size))} sq in</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted">vs. a 10-inch</dt>
            <dd className="mt-1 text-lg text-ink">{ratio.toFixed(2)}×</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
