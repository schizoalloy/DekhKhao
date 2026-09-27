"use client";

import { ArrowUpRight, CheckCircle, WarningCircle, WhatsappLogo } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { buildEnquiryMessage, whatsappUrl, type EnquiryFields } from "@/lib/whatsapp";
import { buttonClass } from "@/components/ui/Button";

type Field = keyof EnquiryFields;
type Errors = Partial<Record<Field, string>>;

const EMPTY: EnquiryFields = { name: "", restaurant: "", phone: "", email: "", message: "" };

function validate(v: EnquiryFields): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (v.restaurant.trim().length < 2) e.restaurant = "Which restaurant or company is this for?";
  const digits = v.phone.replace(/\D/g, "");
  if (!/^[+\d\s()-]+$/.test(v.phone.trim()) || digits.length < 10 || digits.length > 15)
    e.phone = "Enter a phone number we can reach you on, e.g. 0300 1234567.";
  if (v.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "That email doesn’t look right. It’s optional — you can leave it blank.";
  return e;
}

/**
 * Client-only enquiry form. There is no backend: on submit it builds a
 * WhatsApp message from the fields and opens a chat with the team.
 */
export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<EnquiryFields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "opening" | "sent">("idle");
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const set = (k: Field) => (e: { target: { value: string } }) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const url = whatsappUrl(buildEnquiryMessage(values));
    setLastUrl(url);
    setStatus("opening");
    // Must run inside the submit gesture so browsers don't block it.
    // ("noopener" in the features string would make window.open return null, so detach manually.)
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    window.setTimeout(() => setStatus("sent"), 600);
  };

  const input =
    "w-full min-h-13 rounded-2xl border border-line bg-white/70 px-4 py-3 text-base text-ink placeholder:text-ink/35 " +
    "transition-[border-color,box-shadow] duration-300 focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/10 " +
    "aria-[invalid=true]:border-chilli aria-[invalid=true]:ring-chilli/10";

  const fieldProps = (k: Field) => ({
    id: `${uid}-${k}`,
    name: k,
    value: values[k] ?? "",
    onChange: set(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : `${uid}-${k}-hint`,
  });

  const Label = ({ k, children, optional }: { k: Field; children: string; optional?: boolean }) => (
    <label htmlFor={`${uid}-${k}`} className="flex items-baseline justify-between text-sm font-medium text-ink">
      {children}
      {optional && <span className="text-xs font-normal text-muted">Optional</span>}
    </label>
  );

  const FieldMessage = ({ k, hint }: { k: Field; hint?: string }) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="flex items-start gap-1.5 text-sm text-chilli-deep">
        <WarningCircle size={16} weight="regular" className="mt-0.5 shrink-0" aria-hidden />
        {errors[k]}
      </p>
    ) : (
      <p id={`${uid}-${k}-hint`} className={hint ? "text-xs text-muted" : "sr-only"}>
        {hint ?? ""}
      </p>
    );

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5" aria-describedby={`${uid}-note`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Label k="name">Your name</Label>
          <input {...fieldProps("name")} autoComplete="name" className={input} placeholder="Full name" />
          <FieldMessage k="name" />
        </div>
        <div className="grid content-start gap-2">
          <Label k="restaurant">Restaurant / company</Label>
          <input {...fieldProps("restaurant")} autoComplete="organization" className={input} placeholder="Restaurant name" />
          <FieldMessage k="restaurant" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Label k="phone">Phone</Label>
          <input {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" className={input} placeholder="03xx xxxxxxx" />
          <FieldMessage k="phone" hint="Ideally the number you use on WhatsApp." />
        </div>
        <div className="grid content-start gap-2">
          <Label k="email" optional>
            Email
          </Label>
          <input {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" className={input} placeholder="you@restaurant.com" />
          <FieldMessage k="email" />
        </div>
      </div>
      <div className="grid content-start gap-2">
        <Label k="message" optional>
          Message
        </Label>
        <textarea
          {...fieldProps("message")}
          rows={4}
          className={`${input} resize-y`}
          placeholder="Tell us about your restaurant and which dishes you’d like to show."
        />
        <FieldMessage k="message" />
      </div>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={status === "opening"} className={buttonClass("ink", "min-h-14 px-7 text-base disabled:opacity-70")}>
          <WhatsappLogo size={20} weight="regular" aria-hidden />
          {status === "opening" ? "Opening WhatsApp…" : "Send on WhatsApp"}
        </button>
        <p id={`${uid}-note`} className="max-w-[34ch] text-xs leading-relaxed text-muted">
          This opens WhatsApp with your details filled in. Nothing is sent until you press send there.
        </p>
      </div>

      <AnimatePresence>
        {status === "sent" && lastUrl && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="flex items-start gap-3 rounded-2xl bg-leaf/10 p-4 text-sm text-ink"
          >
            <CheckCircle size={20} weight="regular" className="mt-0.5 shrink-0 text-leaf" aria-hidden />
            <p>
              WhatsApp should now be open with your message.{" "}
              <a href={lastUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium underline underline-offset-4">
                Didn’t open? Try again <ArrowUpRight size={14} aria-hidden />
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
