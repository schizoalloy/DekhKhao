import { problems } from "@/content/copy";
import { Bolt, Dots, Peak, Sparks, Wedge } from "@/components/brand/Shapes";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

/** Three candidate sizes for "12-inch": the ambiguity, drawn. */
function SizeGuess() {
  return (
    <figure className="relative mt-12 aspect-square w-full max-w-[400px] md:mt-14" data-rings>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden fill="none">
        <circle data-ring="dashed" cx="100" cy="100" r="96" stroke="var(--color-charcoal)" strokeOpacity="0.22" strokeWidth="1.2" strokeDasharray="3 5" />
        <circle data-ring="dashed" cx="100" cy="100" r="74" stroke="var(--color-charcoal)" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 5" />
        {/* the "12-inch" ring swells and shrinks as you scroll: is it this big, or this big? */}
        <g data-ring="solid">
          <circle cx="100" cy="100" r="52" fill="var(--color-cream-deep)" stroke="var(--color-teal)" strokeWidth="2.2" />
          <g data-ring="measure">
            <line x1="48" y1="122" x2="152" y2="122" stroke="var(--color-orange)" strokeWidth="2" strokeLinecap="round" />
            <line x1="48" y1="117" x2="48" y2="127" stroke="var(--color-orange)" strokeWidth="2" strokeLinecap="round" />
            <line x1="152" y1="117" x2="152" y2="127" stroke="var(--color-orange)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      </svg>
      <Sparks className="absolute right-[6%] top-[4%] w-12 rotate-[60deg]" data-sticker="" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[clamp(3.2rem,10vw,5rem)] font-extrabold leading-none tracking-[-0.05em] text-teal">12&Prime;</span>
      </div>
      <figcaption className="hand absolute -bottom-2 left-1/2 w-max -translate-x-1/2 text-[1.7rem] text-orange-ink" data-ring="ask">
        …but how big is that?
      </figcaption>
    </figure>
  );
}

const bullets = [
  <Wedge key="w" className="size-7" data-sticker="" />,
  <Bolt key="b" className="size-7" data-sticker="" />,
  <Peak key="p" className="h-6 w-7" data-sticker="" />,
  <Dots key="d" className="h-4 w-8" data-sticker="" />,
];

export function ProblemSection() {
  return (
    <section aria-labelledby="problem-title" className="py-24 md:py-32">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading
            id="problem-title"
            title={
              <>
                Menus describe food. Customers still have to <Accent>imagine</Accent> it.
              </>
            }
          />
          <SizeGuess />
        </div>

        <ul className="divide-y divide-line border-y border-line lg:col-span-6 lg:col-start-7 lg:self-center">
          {problems.map((p, i) => (
            <Reveal as="li" key={p.label} delay={i * 0.04} className="grid grid-cols-[2.75rem_1fr] gap-x-4 py-7 md:grid-cols-[3.5rem_1fr] md:py-8">
              <span aria-hidden className="flex h-9 items-center">
                {bullets[i % bullets.length]}
              </span>
              <div>
                <h3 className="font-display text-[1.6rem] font-bold tracking-[-0.03em] text-charcoal">{p.label}</h3>
                <p className="mt-2 max-w-[46ch] leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
