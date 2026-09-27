import { benefits } from "@/content/copy";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

export function RestaurantBenefits() {
  return (
    <section id="for-restaurants" aria-labelledby="benefits-title" className="py-24 md:py-36">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="benefits-title"
              index="06"
              eyebrow="For restaurants"
              title={
                <>
                  Give your menu something <Accent>worth looking at.</Accent>
                </>
              }
              lede="For owners, general managers and marketing teams who want their food to be understood before it reaches the table."
            />
            <ButtonLink href="#contact" variant="chilli" className="mt-10 min-h-14 px-7 text-base">
              Talk to Us
            </ButtonLink>
          </div>
        </div>

        <ol className="lg:col-span-6 lg:col-start-7">
          {benefits.map((b, i) => (
            <Reveal
              as="li"
              key={b.title}
              className="grid grid-cols-[3.25rem_1fr] gap-x-5 border-t border-line py-9 last:border-b md:grid-cols-[5rem_1fr] md:py-11"
            >
              <span className="font-serif text-4xl italic leading-none text-chilli md:text-5xl">{i + 1}</span>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] md:text-3xl">{b.title}</h3>
                <p className="mt-3 max-w-[44ch] leading-relaxed text-muted">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
