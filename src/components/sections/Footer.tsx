import { legalLinks, navLinks, siteConfig } from "@/config/site";
import { allCredits } from "@/content/assets";
import { demo } from "@/content/demo";
import { LogoMark } from "@/components/brand/LogoMark";
import { HillCat } from "@/components/brand/HillCat";
import { Swoosh } from "@/components/brand/Shapes";
import { quickChatUrl } from "@/lib/whatsapp";

const linkClass = "inline-flex min-h-10 items-center text-cream/85 underline decoration-transparent decoration-2 underline-offset-4 hover:text-cream hover:decoration-orange";

const skies = { cream: "bg-cream", "cream-deep": "bg-cream-deep" } as const;

/** `sky` is the background of whatever sits above the footer, so the hill rises out of it seamlessly. */
export function Footer({ sky = "cream" }: { sky?: keyof typeof skies }) {
  const year = new Date().getFullYear();
  return (
    <footer className="text-cream">
      {/* the brand sheet's hill rises out of the footer, with the cat peeking over it. It takes its own
          space in the layout, so it never covers the content above. */}
      <div aria-hidden className={`pointer-events-none -mb-px overflow-hidden ${skies[sky]}`} data-hill-wrap>
        <HillCat className="block h-auto w-[min(100%,72rem)]" data-hill />
      </div>
      <div className="relative bg-teal pb-[max(2rem,env(safe-area-inset-bottom))] pt-20 md:pt-24">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-5">
                <LogoMark variant="inverse" className="h-[clamp(6rem,16vw,9rem)] w-auto" />
                <p className="font-display text-[clamp(2.6rem,8vw,4.8rem)] font-extrabold leading-[0.86] tracking-[-0.045em]">
                  <span className="sr-only">{siteConfig.name}</span>
                  <span aria-hidden>
                    Dekh
                    <br />
                    Khao
                  </span>
                </p>
              </div>
              <p className="hand relative mt-8 inline-block text-[2rem] text-yellow md:text-[2.4rem]">
                {siteConfig.tagline}
                <Swoosh className="absolute -bottom-2.5 left-[30%] h-3.5 w-[66%]" />
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-4 lg:self-end">
              <nav aria-label="Footer">
                <p className="font-semibold text-yellow">Explore</p>
                <ul className="mt-3 space-y-1">
                  {navLinks.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={linkClass}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div>
                <p className="font-semibold text-yellow">Contact</p>
                <ul className="mt-3 space-y-1">
                  <li>
                    <a href={quickChatUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <a href={`tel:+${siteConfig.contact.whatsappNumber}`} className={`${linkClass} whitespace-nowrap`}>
                      {siteConfig.contact.whatsappDisplay}
                    </a>
                  </li>
                  <li>
                    <a href="/#contact" className={linkClass}>
                      Talk to Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <details className="group mt-16 border-t border-cream/20 pt-6 text-xs text-cream/80">
            <summary className="inline-flex min-h-10 cursor-pointer items-center gap-2 hover:text-cream">
              Photo, video &amp; 3D credits
              <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 max-w-[70ch]">
              The 3D pizza is a sample scan used for illustration, not a dish from any partner restaurant. {demo.video.credit}
            </p>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {allCredits.map((c) => (
                <li key={c.title}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-cream/40 underline-offset-2 hover:text-cream">
                    {c.title}
                  </a>
                  : {c.author}, {c.license}
                </li>
              ))}
            </ul>
          </details>

          <div className="mt-6 flex flex-col gap-3 border-t border-cream/20 pt-6 text-xs text-cream/80 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              {legalLinks.map((l) => (
                <a key={l.href} href={l.href} className="inline-flex min-h-10 items-center text-cream/85 underline decoration-cream/40 underline-offset-4 hover:text-cream">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
