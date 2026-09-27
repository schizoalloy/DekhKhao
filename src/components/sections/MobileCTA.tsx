"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { quickChatUrl } from "@/lib/whatsapp";

/**
 * Bottom-fixed CTA for phones. Appears after the hero and hides while the
 * contact section or footer is on screen, so it never covers the form.
 */
export function MobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    const footer = document.querySelector("footer");
    if (!hero || !contact) return;
    let pastHero = false;
    const visibleEnd = new Set<Element>();
    const update = () => setShow(pastHero && visibleEnd.size === 0);

    const heroObs = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting;
      update();
    });
    const endObs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visibleEnd.add(e.target);
        else visibleEnd.delete(e.target);
      }
      update();
    });
    heroObs.observe(hero);
    endObs.observe(contact);
    if (footer) endObs.observe(footer);
    return () => {
      heroObs.disconnect();
      endObs.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex gap-2 rounded-full bg-ink/95 p-1.5 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur md:hidden"
        >
          <a
            href="#contact"
            className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-paper text-[0.95rem] font-medium text-ink active:scale-[0.98]"
          >
            Talk to Us
          </a>
          <a
            href={quickChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="grid min-h-12 w-14 place-items-center rounded-full bg-chilli text-paper active:scale-[0.96]"
          >
            <WhatsappLogo size={22} weight="regular" aria-hidden />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
