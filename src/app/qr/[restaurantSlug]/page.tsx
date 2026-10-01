import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getRestaurant, listRestaurants } from "@/catalog/data";
import { catalogUrl } from "@/config/app";
import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/ui/LogoMark";
import { PrintButton } from "./PrintButton";

type Params = { params: Promise<{ restaurantSlug: string }> };

export const metadata: Metadata = {
  title: `Table QR code | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export async function generateStaticParams() {
  return (await listRestaurants()).map((r) => ({ restaurantSlug: r.slug }));
}

const isLocal = (url: string) => /^https?:\/\/(([^/]*\.)?localhost|127\.|10\.|192\.168\.)/.test(url);

/**
 * Print-ready table card for a restaurant. The QR code is static: it encodes the
 * catalog URL for the domain this build was deployed with (see src/config/app.ts).
 */
export default async function QrPage({ params }: Params) {
  const restaurant = await getRestaurant((await params).restaurantSlug);
  if (!restaurant) notFound();
  const url = catalogUrl(restaurant.slug);
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1714", light: "#ffffff" },
  });
  const dev = isLocal(url);

  return (
    <main className="min-h-[100dvh] bg-paper px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-sm">
        {/* the card that gets printed */}
        <section
          aria-label={`Table card for ${restaurant.name}`}
          className="rounded-3xl bg-white p-8 text-center text-ink shadow-[0_30px_60px_-40px_rgb(60_30_10/0.5)] print:shadow-none"
        >
          <p className="font-display text-2xl font-semibold tracking-[-0.02em]">{restaurant.name}</p>
          <p className="mt-1 text-sm text-muted">Scan to see our menu in 3D</p>
          {/* Markup generated above by the qrcode library from our own URL. */}
          <div className="mx-auto mt-6 w-56 [&_svg]:size-full" role="img" aria-label={`QR code for ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
            <LogoMark className="size-4" /> {siteConfig.name}
          </p>
        </section>

        {/* screen-only details */}
        <div className="mt-8 space-y-4 text-sm print:hidden">
          {dev && (
            <p className="rounded-2xl border border-chilli/40 bg-chilli/10 p-4 text-chilli-deep" role="alert">
              Development build: this code points at <strong>{url}</strong> and only works on this computer. Use the
              code from the live site for printing.
            </p>
          )}
          <div>
            <p className="text-xs text-muted">Encoded URL</p>
            <p className="mt-1 break-all font-mono">{url}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrintButton />
            <a
              href={`/qr/${restaurant.slug}/qr.png`}
              download={`${restaurant.slug}-catalog.png`}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-5 font-medium hover:border-ink"
            >
              Download PNG
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
