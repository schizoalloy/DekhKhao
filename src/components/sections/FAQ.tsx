import { Plus } from "@phosphor-icons/react/dist/ssr";
import { faqs } from "@/content/copy";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

/** Native <details>: keyboard and screen-reader friendly with zero JavaScript. */
export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            id="faq-title"
            title={
              <>
                Questions, <Accent>answered</Accent>
              </>
            }
            className="lg:sticky lg:top-28"
          />
        </div>
        <div className="space-y-3 lg:col-span-7 lg:col-start-6">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white/70 px-5 ring-1 ring-line transition-[background-color,box-shadow] duration-200 open:bg-white open:ring-teal/25 md:px-7">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-5 font-display text-lg font-semibold tracking-[-0.02em] text-charcoal md:text-xl">
                {f.q}
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-deep text-teal transition-[transform,background-color,color] duration-300 ease-[var(--ease-snap)] group-open:rotate-45 group-open:bg-orange group-open:text-charcoal">
                  <Plus size={18} weight="bold" aria-hidden />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 pr-10 leading-relaxed text-ink/80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
