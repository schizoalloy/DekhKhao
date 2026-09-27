import { siteConfig } from "@/config/site";
import { Accent } from "@/components/ui/SectionHeading";
import { ContactForm } from "./ContactForm";
import { WhatsAppCTA } from "./WhatsAppCTA";

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-paper-deep py-24 md:py-36">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow flex items-center gap-3 text-muted">
            <span className="text-chilli">09</span>
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
            Talk to us
          </p>
          <h2
            id="contact-title"
            className="mt-5 font-display text-[clamp(2.3rem,5.6vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance"
          >
            Ready to let your customers <Accent>see before they order?</Accent>
          </h2>
          <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-muted">
            Tell us about your restaurant. We’ll talk through your menu and show you what {siteConfig.name} could look
            like for your dishes.
          </p>
          <div className="mt-9 flex flex-col items-start gap-3">
            <WhatsAppCTA className="min-h-14 px-6 text-base" />
            <p className="text-sm text-muted">
              Or call / message{" "}
              <a
                href={`tel:+${siteConfig.contact.whatsappNumber}`}
                className="font-medium text-ink underline decoration-line underline-offset-4"
              >
                {siteConfig.contact.whatsappDisplay}
              </a>
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-paper p-6 shadow-[0_40px_80px_-50px_rgb(60_30_10/0.45)] ring-1 ring-line sm:p-8 md:p-10 lg:col-span-7">
          <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">
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
