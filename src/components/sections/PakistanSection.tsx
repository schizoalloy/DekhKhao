import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { Accent } from "@/components/ui/SectionHeading";
import { UrduWordmark } from "@/components/ui/UrduWordmark";

/** Restrained block-print border, loosely after the repeat structure of ajrak textiles. */
function BlockPrintBand({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg className={className} aria-hidden width="100%" height="44">
      <defs>
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <rect x="21" y="3" width="2" height="2" transform="rotate(45 22 4)" fill="currentColor" />
          <circle cx="22" cy="22" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={22 + Math.cos(a) * 12} cy={22 + Math.sin(a) * 12} r="1.6" fill="currentColor" />;
          })}
          <circle cx="22" cy="22" r="2" fill="currentColor" />
          <path d="M0 22 L6 16 L12 22 L6 28 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="44" fill={`url(#${id})`} />
    </svg>
  );
}

export function PakistanSection() {
  return (
    <section aria-labelledby="pk-title" className="relative overflow-hidden bg-leaf text-paper">
      <BlockPrintBand id="bp-top" className="text-paper/[0.14]" />
      <div className="container-page relative grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:items-center">
        <div className="relative z-[1] lg:col-span-6">
          <p className="eyebrow flex items-center gap-3 text-paper/60">
            <span className="text-saffron">07</span>
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
            Made in Pakistan
          </p>
          <h2
            id="pk-title"
            className="mt-5 font-display text-[clamp(2.3rem,6vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance"
          >
            Built here. <Accent>Made for the way we eat.</Accent>
          </h2>
          <p className="mt-7 max-w-[50ch] text-[1.05rem] leading-relaxed text-paper/75">
            {siteConfig.name} is a Pakistani technology product from {siteConfig.company}. It’s designed around our
            menus — where a karahi is ordered for the whole table, platters arrive for the family, and one
            restaurant’s “full” is another’s “half”.
          </p>
        </div>

        {/* The Urdu mark is the visual here: the one thing on the page that is unmistakably from here. */}
        <Reveal className="relative lg:col-span-6">
          <div className="relative flex justify-start py-4 lg:justify-end lg:py-10">
            <UrduWordmark
              decorative
              accentClass="text-saffron"
              className="relative block text-[clamp(5.5rem,24vw,13rem)] leading-[1.5] text-paper"
            />
          </div>
        </Reveal>
      </div>
      <BlockPrintBand id="bp-bottom" className="text-paper/[0.14]" />
    </section>
  );
}
