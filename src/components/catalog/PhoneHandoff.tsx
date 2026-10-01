"use client";

import { DeviceMobile } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/**
 * Desktop visitors can't use AR, so they get a QR code for the page they're on.
 * Generated in the browser from the current URL, so it's right on every deployment.
 */
export function PhoneHandoff({ itemName }: { itemName: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((QR) =>
        QR.toString(window.location.href, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#1b1714", light: "#ffffff" },
        }),
      )
      .then((markup) => !cancelled && setSvg(markup))
      .catch(() => !cancelled && setSvg(""));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center gap-5 rounded-3xl border border-m-line p-5">
      <div className="size-32 shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
        {svg === null ? (
          <div className="size-full animate-pulse rounded-lg bg-black/5" aria-hidden />
        ) : svg ? (
          // Markup comes from the qrcode library, built from this page's own URL.
          <div className="size-full [&_svg]:size-full" role="img" aria-label="QR code for this page" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : null}
      </div>
      <div className="text-sm leading-relaxed">
        <p className="flex items-center gap-2 font-semibold text-m-text">
          <DeviceMobile size={18} aria-hidden /> AR works on phones
        </p>
        <p className="mt-1 text-m-muted">Scan this with your phone to open {itemName} there and place it on your table.</p>
      </div>
    </div>
  );
}
