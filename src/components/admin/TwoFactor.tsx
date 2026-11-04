"use client";

import { DeviceMobile, QrCode } from "@phosphor-icons/react";
import { useState, useTransition } from "react";
import {
  confirmAuthenticatorSetup,
  startAuthenticatorSetup,
  verifyAuthenticatorCode,
  type AuthenticatorSetup as Setup,
} from "@/app/admin/actions/two-factor";
import { ActionForm, SubmitButton } from "./ActionForm";
import { ui } from "./styles";

function CodeInput({ id }: { id: string }) {
  return (
    <input
      id={id}
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\s*(\d\s*){6}"
      maxLength={9}
      required
      autoFocus
      placeholder="123456"
      className={`${ui.input} text-center font-mono text-xl tracking-[0.35em]`}
    />
  );
}

/** Sign-in with an authenticator app already linked: enter its current code. */
export function CodeForm() {
  return (
    <ActionForm action={verifyAuthenticatorCode} className="mt-6 space-y-4">
      <div>
        <label htmlFor="code" className={ui.label}>
          6-digit code from your authenticator app
        </label>
        <CodeInput id="code" />
      </div>
      <SubmitButton className="w-full">Confirm</SubmitButton>
    </ActionForm>
  );
}

/** First sign-in: link an authenticator app by QR code (or the setup key), then confirm one code. */
export function AuthenticatorSetup() {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [starting, startTransition] = useTransition();

  if (!setup?.ok)
    return (
      <div className="mt-6 space-y-4">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>
            Install an authenticator app on your phone: Google Authenticator, Microsoft Authenticator or 1Password. Pick one
            that backs up to your account, so a lost phone doesn&apos;t lock you out.
          </li>
          <li>Show the QR code below and scan it with the app.</li>
          <li>Enter the 6-digit code the app shows.</li>
        </ol>
        <button
          type="button"
          className={`${ui.button} w-full`}
          disabled={starting}
          onClick={() => startTransition(async () => setSetup(await startAuthenticatorSetup()))}
        >
          <QrCode size={18} aria-hidden /> {starting ? "Working…" : "Show QR code"}
        </button>
        {setup && !setup.ok && (
          <p role="alert" className="rounded-2xl bg-chilli/10 px-4 py-3 text-sm text-chilli-deep">
            {setup.error}
          </p>
        )}
      </div>
    );

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl border border-line bg-white p-4">
        {/* Supabase returns the QR code as an SVG data URL. */}
        <img src={setup.qrCode} alt="QR code to scan with your authenticator app" className="mx-auto size-48" />
        <p className="mt-3 text-center text-xs text-muted">Can&apos;t scan it? Type this setup key into the app:</p>
        <p className="mt-1 select-all break-all text-center font-mono text-sm font-medium">{setup.secret}</p>
        <a href={setup.uri} className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium underline underline-offset-4 sm:hidden">
          <DeviceMobile size={16} aria-hidden /> On this phone? Add it to your authenticator app
        </a>
      </div>
      <ActionForm action={confirmAuthenticatorSetup} className="space-y-4">
        <input type="hidden" name="factorId" value={setup.factorId} />
        <div>
          <label htmlFor="setup-code" className={ui.label}>
            Code the app shows now
          </label>
          <CodeInput id="setup-code" />
        </div>
        <SubmitButton className="w-full">Link app and sign in</SubmitButton>
      </ActionForm>
    </div>
  );
}
