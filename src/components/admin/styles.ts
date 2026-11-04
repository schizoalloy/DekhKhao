/** Shared class names for the admin console (desktop-first, same palette as the site). */
export const ui = {
  card: "rounded-3xl border border-line bg-white/70 p-5 sm:p-6",
  label: "block text-sm font-medium",
  hint: "mt-1 text-xs leading-relaxed text-muted",
  input:
    "mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2 text-[0.95rem] outline-offset-2 " +
    "focus:border-ink disabled:opacity-60",
  check: "size-4 accent-[var(--color-ink)]",
  button:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper " +
    "transition-transform active:scale-[0.98] disabled:opacity-50",
  buttonSecondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium " +
    "hover:border-ink disabled:opacity-50",
  buttonDanger:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-danger/40 bg-white px-4 text-sm " +
    "font-medium text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50",
  /** The final, irreversible step of a Danger Zone action. */
  buttonDestroy:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-danger px-5 text-sm font-medium text-white " +
    "transition-transform hover:bg-danger-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 " +
    "disabled:active:scale-100",
  badge: "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
} as const;
