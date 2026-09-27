import type { ComponentPropsWithoutRef } from "react";

type Variant = "ink" | "chilli" | "ghost" | "paper";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[0.95rem] font-medium tracking-tight " +
  "transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "active:translate-y-px active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-paper hover:bg-ink-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
  chilli: "bg-chilli text-paper hover:bg-chilli-deep shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]",
  paper: "bg-paper text-ink hover:bg-white",
  ghost: "text-current ring-1 ring-inset ring-current/25 hover:ring-current/60",
};

export function buttonClass(variant: Variant = "ink", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

type ButtonLinkProps = ComponentPropsWithoutRef<"a"> & { variant?: Variant };

export function ButtonLink({ variant = "ink", className = "", ...props }: ButtonLinkProps) {
  return <a className={buttonClass(variant, className)} {...props} />;
}
