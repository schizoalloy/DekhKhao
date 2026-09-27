"use client";

import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { navLinks, siteConfig } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/LogoMark";
import { UrduWordmark } from "@/components/ui/UrduWordmark";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Only flips state when crossing the threshold — not on every scroll frame.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || open
          ? "bg-paper/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <a href="/#top" className="flex min-h-11 items-center gap-2.5" aria-label={`${siteConfig.name} — home`}>
          <LogoMark className="size-7" />
          <span className="whitespace-nowrap font-display text-[1.05rem] font-semibold tracking-[-0.02em]">{siteConfig.name}</span>
          <UrduWordmark decorative className="hidden pt-1 text-[1.05rem] leading-none text-muted md:inline-block" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2.5 text-[0.92rem] text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <span className="hidden sm:contents">
            <a href="/#contact" className={buttonClass("ink", "min-h-11 whitespace-nowrap px-5")}>
              Talk to Us
            </a>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-12 place-items-center rounded-full ring-1 ring-inset ring-line active:scale-95 lg:hidden"
          >
            {open ? <X size={22} weight="regular" /> : <List size={22} weight="regular" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="container-page flex h-[calc(100dvh-4rem-env(safe-area-inset-top))] flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden"
          >
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 200, damping: 24 }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-16 items-center justify-between font-display text-2xl font-medium tracking-[-0.02em]"
                  >
                    {l.label}
                    <span className="eyebrow text-muted">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto grid gap-3">
              <UrduWordmark decorative split={false} className="block text-5xl text-ink/15" />
              <a href="/#contact" onClick={() => setOpen(false)} className={buttonClass("ink", "min-h-14 text-base")}>
                Talk to Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
