import { problems } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

/** Three candidate sizes for "12-inch" — the ambiguity, drawn. */
function SizeGuess() {
  return (
    <figure className="relative mt-12 aspect-square w-full max-w-[420px] md:mt-16">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden fill="none">
        <circle cx="100" cy="100" r="96" stroke="currentColor" strokeOpacity="0.18" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="74" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="52" stroke="var(--color-chilli)" strokeWidth="1.2" />
        <line x1="48" y1="100" x2="152" y2="100" stroke="var(--color-chilli)" strokeWidth="0.8" />
        <line x1="48" y1="96" x2="48" y2="104" stroke="var(--color-chilli)" strokeWidth="0.8" />
        <line x1="152" y1="96" x2="152" y2="104" stroke="var(--color-chilli)" strokeWidth="0.8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[clamp(3.4rem,11vw,5.5rem)] font-bold leading-none tracking-[-0.05em] [font-stretch:80%]">
          12&Prime;
        </span>
        <span className="mt-1 font-serif text-xl italic text-muted">…but how big is that?</span>
      </div>
      <figcaption className="sr-only">
        Three dashed circles of different sizes around the label “12 inch”, showing that the number alone is hard to picture.
      </figcaption>
    </figure>
  );
}

export function ProblemSection() {
  return (
    <section aria-labelledby="problem-title" className="py-24 md:py-36">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading
            id="problem-title"
            index="01"
            eyebrow="The problem"
            title={
              <>
                Menus describe food. Customers still have to <Accent>imagine</Accent> it.
              </>
            }
          />
          <SizeGuess />
        </div>

        <ol className="divide-y divide-line border-y border-line lg:col-span-6 lg:col-start-7 lg:self-end">
          {problems.map((p, i) => (
            <Reveal as="li" key={p.label} delay={i * 0.04} className="grid grid-cols-[3rem_1fr] gap-x-4 py-7 md:grid-cols-[4rem_1fr] md:py-9">
              <span className="eyebrow pt-2 text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] md:text-[1.75rem]">{p.label}</h3>
                <p className="mt-2 max-w-[46ch] leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
