const words = ["Scan", "Choose", "See", "Place"];

/** Kinetic divider. Decorative — the same steps are described in text elsewhere. */
export function Marquee() {
  const row = Array.from({ length: 4 }, () => words).flat();
  return (
    <div aria-hidden className="overflow-hidden border-y border-line py-5 md:py-7">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={i} className="flex items-center">
                <span className="px-6 font-display text-4xl font-semibold uppercase tracking-[-0.03em] [font-stretch:80%] md:px-10 md:text-6xl">
                  {w}
                </span>
                <span className="size-2.5 rounded-full bg-chilli md:size-3" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
