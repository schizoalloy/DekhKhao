import { legalLinks, navLinks, siteConfig } from "@/config/site";
import { UrduWordmark } from "@/components/ui/UrduWordmark";
import { allCredits } from "@/content/assets";
import { quickChatUrl } from "@/lib/whatsapp";

const linkClass = "inline-flex min-h-10 items-center text-paper/80 hover:text-paper";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink pb-[max(2rem,env(safe-area-inset-bottom))] pt-20 text-paper md:pt-28">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <UrduWordmark className="block text-left text-[clamp(3.6rem,14vw,7.5rem)] leading-[1.55] text-paper" />
            <p className="font-display text-[clamp(2.2rem,7vw,4.4rem)] font-bold leading-[0.9] tracking-[-0.04em] [font-stretch:82%]">
              {siteConfig.name}
            </p>
            <p className="mt-5 font-serif text-2xl italic text-saffron md:text-3xl">{siteConfig.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-4 lg:self-end">
            <nav aria-label="Footer">
              <p className="eyebrow text-paper/45">Explore</p>
              <ul className="mt-4 space-y-1">
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
              <p className="eyebrow text-paper/45">Contact</p>
              <ul className="mt-4 space-y-1">
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

        <details className="group mt-16 border-t border-paper/15 pt-6 text-xs text-paper/50">
          <summary className="inline-flex min-h-10 cursor-pointer items-center gap-2 hover:text-paper/80">
            Photo &amp; 3D credits
            <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 max-w-[70ch]">
            The 3D pizza is a sample scan used for illustration, not a dish from any partner restaurant.
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {allCredits.map((c) => (
              <li key={c.title}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-paper/25 underline-offset-2 hover:text-paper/80">
                  {c.title}
                </a>{" "}
                — {c.author}, {c.license}
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-6 flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.name} by {siteConfig.company}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href} className="inline-flex min-h-10 items-center text-paper/70 underline decoration-paper/25 underline-offset-4 hover:text-paper">
                {l.label}
              </a>
            ))}
            <p>
              © {year} {siteConfig.company}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
