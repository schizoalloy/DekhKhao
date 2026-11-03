import { Check, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { benefits, managed } from "@/content/copy";
import { Bolt, Dots, Peak, Wedge } from "@/components/brand/Shapes";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

const markers = [
  <Wedge key="w" className="size-8" data-sticker="" />,
  <Bolt key="b" className="size-8" data-sticker="" />,
  <Peak key="p" className="h-7 w-8" data-sticker="" />,
  <Dots key="d" className="h-5 w-9" data-sticker="" />,
];

export function RestaurantBenefits() {
  return (
    <section id="for-restaurants" aria-labelledby="benefits-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="benefits-title"
          title={
            <>
              You send the dishes. <Accent>We do the rest.</Accent>
            </>
          }
          lede="DekhKhao is fully managed. No 3D software, no new system for your staff, nothing for customers to install."
        />

        {/* the managed-service split: what the restaurant does vs what DekhKhao does */}
        <div className="mt-14 grid overflow-hidden rounded-[2rem] text-charcoal md:grid-cols-[1fr_1.5fr]" data-handoff>
          <div className="bg-yellow p-8 md:p-10">
            <h3 className="hand text-[2.1rem] leading-none">What you do</h3>
            <ul className="mt-6 space-y-4">
              {managed.restaurant.map((t) => (
                <li key={t} className="flex gap-3 text-[1.05rem] font-semibold leading-snug">
                  <span data-check className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-charcoal text-yellow">
                    <Check size={14} weight="bold" aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-teal p-8 text-cream md:p-10">
            <h3 className="hand text-[2.1rem] leading-none text-yellow">What DekhKhao does</h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {managed.dekhkhao.map((t) => (
                <li key={t} className="flex gap-3 text-[1.02rem] leading-snug">
                  <span data-check className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-yellow text-charcoal">
                    <Check size={14} weight="bold" aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="font-display text-[1.9rem] font-bold leading-tight tracking-[-0.03em] text-charcoal">What your restaurant gets</h3>
            <ButtonLink href="#contact" variant="chilli" className="mt-8 min-h-14 px-7 text-base" data-magnetic>
              <WhatsappLogo size={20} weight="bold" aria-hidden />
              Talk to Us
            </ButtonLink>
          </div>
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {benefits.map((b, i) => (
              <Reveal as="li" key={b.title} delay={(i % 2) * 0.05}>
                <span aria-hidden className="flex h-9 items-center">
                  {markers[i % markers.length]}
                </span>
                <h4 className="mt-3 font-display text-[1.3rem] font-bold tracking-[-0.02em] text-charcoal">{b.title}</h4>
                <p className="mt-2 max-w-[42ch] leading-relaxed text-muted">{b.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
