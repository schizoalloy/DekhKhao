import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { buttonClass } from "@/components/ui/Button";
import { quickChatUrl } from "@/lib/whatsapp";

type WhatsAppCTAProps = { variant?: "ink" | "chilli" | "ghost" | "paper"; className?: string; label?: string };

/** Direct link into a WhatsApp chat with a short pre-filled greeting. */
export function WhatsAppCTA({ variant = "ghost", className = "", label = "Chat on WhatsApp" }: WhatsAppCTAProps) {
  return (
    <a href={quickChatUrl} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, className)}>
      <WhatsappLogo size={20} weight="regular" aria-hidden />
      {label}
      <span className="sr-only">(opens WhatsApp)</span>
    </a>
  );
}
