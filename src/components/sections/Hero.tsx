import { Play, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/brand/LogoMark";
import { Swoosh } from "@/components/brand/Shapes";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { ButtonLink } from "@/components/ui/Button";
import { HeroStage } from "./HeroStage";

/*
 * data-h="…" marks the pieces of the intro timeline (components/motion/HeroMotion.tsx).
 * They are visible by default; with JS and motion allowed they start hidden and play in.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pb-20 pt-24 md:pt-28 lg:flex lg:min-h-[100dvh] lg:items-center lg:pb-16">
      <HeroMotion className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6" data-p="copy">
          {/* The geometric Urdu mark leads; the English name sits beside it, as on the brand sheet. */}
          <h1 id="hero-title" className="flex items-center gap-[clamp(0.75rem,2.5vw,1.75rem)]">
            <LogoMark className="h-[clamp(7.5rem,24vw,12.5rem)] w-auto shrink-0 overflow-visible" data-h="mark" />
            <span lang="ur" className="sr-only">
              {siteConfig.nameUrdu}
            </span>
            <span className="sr-only">{siteConfig.name}</span>
            <span aria-hidden className="font-display text-[clamp(3.4rem,13vw,7.25rem)] font-extrabold leading-[0.86] tracking-[-0.045em] text-teal">
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="block" data-h="word">
                  Dekh
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="block" data-h="word">
                  Khao
                </span>
              </span>
            </span>
          </h1>

          <p className="hand relative mt-7 inline-block text-[clamp(2.1rem,6vw,3.1rem)] text-charcoal">
            <span className="block" data-h="write">
              What you see
            </span>
            <span className="block" data-h="write">
              is what you get.
            </span>
            <Swoosh className="absolute -bottom-3 left-[18%] h-4 w-[78%]" data-h="swoosh" />
          </p>

          <p className="mt-8 max-w-[34ch] text-[1.12rem] leading-relaxed text-ink/85" data-h="copy">
            An AR experience that lets your customers see food in its{" "}
            <mark className="highlight bg-transparent font-semibold text-charcoal" data-h="hl">
              real size
            </mark>
            , on their own table, before they order.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="#contact" className="min-h-14 px-7 text-base" data-h="cta" data-magnetic>
              <WhatsappLogo size={20} weight="bold" aria-hidden />
              Talk to Us
            </ButtonLink>
            <a href="#demo" className="group inline-flex min-h-14 items-center gap-3 font-semibold text-charcoal" data-h="cta">
              <span className="grid size-12 place-items-center rounded-full ring-2 ring-inset ring-charcoal/80 transition-[background-color,box-shadow,transform] duration-200 group-hover:scale-105 group-hover:bg-orange group-hover:ring-orange">
                <Play size={18} weight="fill" aria-hidden className="translate-x-px" />
              </span>
              Watch the demo
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 lg:pl-6" data-p="stage">
          <HeroStage />
        </div>
      </HeroMotion>
    </section>
  );
}
