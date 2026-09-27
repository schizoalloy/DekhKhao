import { ArrowDown, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { UrduWordmark } from "@/components/ui/UrduWordmark";
import { quickChatUrl } from "@/lib/whatsapp";
import { HeroStage } from "./HeroStage";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-16 pt-24 md:pt-28 lg:flex lg:min-h-[100dvh] lg:items-center lg:pb-12"
    >
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="hero-rise eyebrow flex items-center gap-3 text-muted" style={{ ["--d" as string]: 0 }}>
            <span className="relative flex size-2">
              <span className="animate-pulse-ring absolute inset-0 rounded-full bg-chilli" />
              <span className="relative size-2 rounded-full bg-chilli" />
            </span>
            3D + AR menus for restaurants
          </p>

          <h1 id="hero-title" className="mt-16 md:mt-24">
            {/* The Urdu mark is the primary identity; the English name sits beneath it. */}
            <UrduWordmark className="hero-wipe block text-left text-[clamp(5rem,26vw,10.5rem)] leading-[1.5] text-ink" />
            <span
              className="hero-rise mt-2 block font-display text-[clamp(2.6rem,9vw,5.6rem)] font-bold leading-[0.9] tracking-[-0.04em] [font-stretch:82%]"
              style={{ ["--d" as string]: 350 }}
            >
              {siteConfig.name}
            </span>
          </h1>

          <p
            className="hero-rise mt-6 font-serif text-[clamp(1.7rem,4.6vw,2.6rem)] italic leading-[1.05] text-chilli"
            style={{ ["--d" as string]: 550 }}
          >
            {siteConfig.tagline}
          </p>

          <p
            className="hero-rise mt-6 max-w-[38ch] text-[1.08rem] leading-relaxed text-ink/75"
            style={{ ["--d" as string]: 700 }}
          >
            Customers can see their food in 3D and augmented reality before they order it.
          </p>

          <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: 850 }}>
            <ButtonLink href="#contact" className="min-h-14 px-7 text-base">
              Talk to Us
            </ButtonLink>
            <ButtonLink href="#how-it-works" variant="ghost" className="min-h-14 px-6 text-base">
              See how it works
              <ArrowDown size={18} weight="regular" aria-hidden />
            </ButtonLink>
          </div>

          <p className="hero-rise mt-7 text-sm text-muted" style={{ ["--d" as string]: 1000 }}>
            <a
              href={quickChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 underline decoration-line underline-offset-4 hover:text-ink"
            >
              <WhatsappLogo size={18} weight="regular" aria-hidden />
              Or message us on WhatsApp, {siteConfig.contact.whatsappDisplay}
            </a>
          </p>
        </div>

        <div className="lg:col-span-6 lg:pl-4 xl:col-span-6">
          <HeroStage />
        </div>
      </div>
    </section>
  );
}
