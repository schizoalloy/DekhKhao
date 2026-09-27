import { Plus } from "@phosphor-icons/react/dist/ssr";
import { faqs } from "@/content/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Native <details> — keyboard and screen-reader friendly with zero JavaScript. */
export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 md:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" index="08" eyebrow="FAQ" title="Questions, answered." className="lg:sticky lg:top-28" />
        </div>
        <div className="divide-y divide-line border-y border-line lg:col-span-7 lg:col-start-6">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-6 font-display text-xl font-medium tracking-[-0.02em] md:text-2xl">
                {f.q}
                <span className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-line transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-45 group-open:bg-ink group-open:text-paper">
                  <Plus size={18} weight="regular" aria-hidden />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-8 pr-12 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
