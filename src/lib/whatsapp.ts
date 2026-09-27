import { siteConfig } from "@/config/site";

export type EnquiryFields = {
  name: string;
  restaurant: string;
  phone: string;
  email?: string;
  message?: string;
};

const DEFAULT_GREETING =
  "Hello DekhKhao, I'm interested in bringing DekhKhao to my restaurant.";

/** Builds the plain-text body of the WhatsApp enquiry. Empty optional fields are omitted. */
export function buildEnquiryMessage(fields: EnquiryFields): string {
  const lines = [
    DEFAULT_GREETING,
    "",
    `Name: ${fields.name.trim()}`,
    `Restaurant: ${fields.restaurant.trim()}`,
    `Phone: ${fields.phone.trim()}`,
  ];
  if (fields.email?.trim()) lines.push(`Email: ${fields.email.trim()}`);
  if (fields.message?.trim()) lines.push("", `Message: ${fields.message.trim()}`);
  return lines.join("\n");
}

/** wa.me deep link. Works on phones (opens the app) and desktop (WhatsApp Web / Desktop). */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${siteConfig.contact.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const quickChatUrl = whatsappUrl(DEFAULT_GREETING);
