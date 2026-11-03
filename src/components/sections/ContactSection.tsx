import { siteConfig } from "@/config/site";
import { Accent } from "@/components/ui/SectionHeading";
import { ContactForm } from "./ContactForm";
import { WhatsAppCTA } from "./WhatsAppCTA";

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-cream-deep pb-12 pt-24 md:pb-16 md:pt-32">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2
            id="contact-title"
            data-split=""
            className="font-display text-[clamp(2.2rem,5.2vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.035em] text-balance text-charcoal"
          >
            Ready to let your customers <Accent>see before they order?</Accent>
          </h2>
          <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-ink/80">
            Tell us about your restaurant. We’ll talk through your menu and show you what {siteConfig.name} could look
            like for your dishes.
          </p>
          <div className="mt-9 flex flex-col items-start gap-3">
            <WhatsAppCTA className="min-h-14 px-6 text-base" />
            <p className="text-sm text-muted">
              Or call / message{" "}
              <a
                href={`tel:+${siteConfig.contact.whatsappNumber}`}
                className="font-semibold text-teal underline decoration-orange decoration-2"
              >
                {siteConfig.contact.whatsappDisplay}
              </a>
            </p>
          </div>
        </div>

        <div className="relative rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgb(0_68_61/0.45)] ring-1 ring-line sm:p-8 md:p-10 lg:col-span-7 lg:mt-0">
          <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-charcoal">
            Bring {siteConfig.name} to your restaurant
          </h3>
          <p className="mt-1 text-sm text-muted">A few details, and we’ll pick it up on WhatsApp.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
