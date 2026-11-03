import { CubeFocus, HandTap, QrCode, Smiley } from "@phosphor-icons/react/dist/ssr";
import { steps } from "@/content/copy";
import { Sparks } from "@/components/brand/Shapes";
import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

const icons = [QrCode, HandTap, CubeFocus, Smiley];
const tilt = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-3"];

/** The customer's path, drawn as the brand's sticker icons joined by a dashed trail. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="how-title"
          title={
            <>
              From the QR code to the table, <Accent>in four taps</Accent>
            </>
          }
          lede="Everything happens on the customer’s own phone. Ordering stays exactly as it is: DekhKhao only shows the food."
        />

        <ol className="relative mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:mt-20 lg:grid-cols-4 lg:gap-8">
          {/* dashed trail behind the icons (desktop) */}
          <svg
            aria-hidden
            className="absolute left-[2.75rem] right-[calc((100%-6rem)/4-2.75rem)] top-[2.15rem] hidden h-6 lg:block"
            viewBox="0 0 1000 24"
            preserveAspectRatio="none"
            fill="none"
            data-trail
          >
            <path
              d="M0 12 C 120 0, 210 24, 333 12 S 545 0, 666 12 S 880 24, 1000 12"
              stroke="var(--color-teal)"
              strokeOpacity="0.5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 9"
            />
          </svg>
          {steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal as="li" key={s.title} delay={i * 0.06} className="relative">
                <span data-step-icon className={`relative grid size-16 place-items-center rounded-[1.25rem] bg-cream-deep text-teal ring-[3px] ring-cream sm:size-[5.5rem] sm:rounded-[1.6rem] ${tilt[i]}`}>
                  <Icon weight="duotone" aria-hidden className="size-8 sm:size-11" />
                  {i === 2 && <Sparks className="absolute -right-6 -top-5 w-9" color="var(--color-orange)" />}
                </span>
                <h3 className="mt-5 font-display text-[1.15rem] font-bold tracking-[-0.025em] text-charcoal sm:mt-6 sm:text-[1.45rem]">{s.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[0.94rem] leading-relaxed text-muted sm:text-base">{s.body}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
