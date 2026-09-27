/** AR placement reticle — the "surface found" marker. */
export function Reticle({ className = "relative" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <span className="animate-pulse-ring absolute inset-0 rounded-full border border-paper/70" />
      <span className="absolute inset-0 rounded-full border border-dashed border-paper/55" />
      <span className="absolute left-1/2 top-0 h-[9%] w-px -translate-x-1/2 bg-paper" />
      <span className="absolute bottom-0 left-1/2 h-[9%] w-px -translate-x-1/2 bg-paper" />
      <span className="absolute left-0 top-1/2 h-px w-[9%] -translate-y-1/2 bg-paper" />
      <span className="absolute right-0 top-1/2 h-px w-[9%] -translate-y-1/2 bg-paper" />
    </div>
  );
}
