import { experiencePoints } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import { SizeComparator } from "./SizeComparator";

export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-paper-deep/60 py-24 md:py-36">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 lg:col-start-1">
          <Reveal>
            <SizeComparator />
          </Reveal>
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
            A 14-inch pizza has almost twice the surface of a 10-inch — obvious once you see it, easy to miss on a
            menu. One 3D scan, drawn to scale at each menu size.
          </p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <SectionHeading
            id="experience-title"
            index="04"
            eyebrow="Customer experience"
            title={
              <>
                See it <Accent>before</Accent> you order it.
              </>
            }
          />
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {experiencePoints.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.04} className="py-5">
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-1 leading-relaxed text-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
