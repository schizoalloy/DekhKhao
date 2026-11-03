import { ForkKnife, MagnifyingGlassPlus, Ruler, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { experiencePoints } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import { SizeComparator } from "./SizeComparator";

export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-cream-deep py-24 md:py-32">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 lg:col-start-1">
          <Reveal>
            <SizeComparator />
          </Reveal>
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
            A 14-inch pizza has almost twice the surface of a 10-inch: obvious once you see it, easy to miss on a
            menu. One 3D scan, drawn to scale at each menu size.
          </p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <SectionHeading
            id="experience-title"
            title={
              <>
                See it <Accent>before</Accent> you order it.
              </>
            }
          />
          <ul className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {experiencePoints.map((p, i) => {
              const Icon = [Ruler, ForkKnife, MagnifyingGlassPlus, Sparkle][i % 4];
              return (
                <Reveal as="li" key={p.title} delay={i * 0.04}>
                  <Icon size={30} weight="duotone" className="text-teal" aria-hidden />
                  <h3 className="mt-3 font-display text-[1.2rem] font-bold tracking-[-0.02em] text-charcoal">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{p.body}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
