import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  /** Screen background. */
  screenClassName?: string;
};

/**
 * Generic smartphone frame drawn in CSS — no device brand. Replace with a
 * photographed mockup later without touching the screen contents.
 */
export function PhoneFrame({ children, className = "", screenClassName = "bg-ink" }: PhoneFrameProps) {
  return (
    <div
      className={`relative aspect-[9/19] rounded-[2.6rem] bg-[#141110] p-[7px] shadow-[0_40px_80px_-30px_rgb(40_20_10/0.55),inset_0_0_0_1.5px_rgb(255_255_255/0.08)] ${className}`}
    >
      <div className={`relative h-full w-full overflow-hidden rounded-[2.15rem] ${screenClassName}`}>
        {children}
        {/* camera island */}
        <div aria-hidden className="absolute left-1/2 top-2.5 h-[18px] w-[30%] -translate-x-1/2 rounded-full bg-[#0c0a09]" />
      </div>
    </div>
  );
}
