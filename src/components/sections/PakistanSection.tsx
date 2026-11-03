import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/brand/LogoMark";
import { Arch, Sparks } from "@/components/brand/Shapes";
import { Reveal } from "@/components/ui/Reveal";
import { Accent } from "@/components/ui/SectionHeading";

export function PakistanSection() {
  return (
    <section aria-labelledby="pk-title" className="relative overflow-hidden bg-cream-deep">
      <div className="container-page relative grid items-center gap-12 py-24 md:py-32 lg:grid-cols-12">
        <div className="relative z-[1] lg:col-span-6">
          <h2 id="pk-title" data-split="" className="font-display text-[clamp(2.2rem,5.6vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-balance text-charcoal">
            Built here. <Accent>Made for the way we eat.</Accent>
          </h2>
          <p className="mt-7 max-w-[50ch] text-[1.05rem] leading-relaxed text-ink/80">
            {siteConfig.name} is a Pakistani technology product, designed around our menus, where a karahi is ordered for the whole table, platters arrive for the family, and one restaurant’s “full” is
            another’s “half”.
          </p>
        </div>

        {/* The Urdu mark is the visual here: the one thing on the page that is unmistakably from here. */}
        <Reveal className="relative lg:col-span-5 lg:col-start-8">
          <div className="relative mx-auto aspect-[10/9] w-full max-w-[460px]">
            <Arch className="absolute inset-0 size-full" color="var(--color-cream)" />
            <Sparks className="absolute -left-2 top-[18%] w-14 -rotate-12" data-sticker="" data-speed="0.8" />
            <Sparks className="absolute -right-1 bottom-[22%] w-12 rotate-[160deg]" color="var(--color-teal)" data-sticker="" data-speed="-0.6" />
            <LogoMark className="absolute inset-x-[16%] bottom-[8%] top-[10%] mx-auto h-[82%] w-auto overflow-visible" data-assemble="" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
