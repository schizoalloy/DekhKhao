import type { ComponentPropsWithoutRef } from "react";

/** "ink" is the primary action (Dekh Teal); "chilli" the orange pop; "paper" for teal grounds; "ghost" outlined. */
type Variant = "ink" | "chilli" | "ghost" | "paper";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[0.95rem] font-semibold tracking-[-0.01em] " +
  "transition-[transform,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "active:translate-y-px active:scale-[0.97] select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  ink: "bg-teal text-cream hover:bg-teal-deep shadow-[0_6px_16px_-8px_rgb(0_68_61/0.7)]",
  chilli: "bg-orange text-charcoal hover:bg-[#ff7f22] shadow-[0_6px_16px_-8px_rgb(184_71_0/0.6)]",
  paper: "bg-cream text-teal hover:bg-white",
  ghost: "text-current ring-[1.5px] ring-inset ring-current/30 hover:ring-current/70",
};

export function buttonClass(variant: Variant = "ink", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

type ButtonLinkProps = ComponentPropsWithoutRef<"a"> & { variant?: Variant };

export function ButtonLink({ variant = "ink", className = "", ...props }: ButtonLinkProps) {
  return <a className={buttonClass(variant, className)} {...props} />;
}
