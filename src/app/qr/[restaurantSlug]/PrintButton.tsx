"use client";

import { Printer } from "@phosphor-icons/react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-medium text-paper active:scale-[0.98]"
    >
      <Printer size={18} aria-hidden /> Print
    </button>
  );
}
