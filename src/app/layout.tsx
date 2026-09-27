import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Gulzar, Instrument_Serif } from "next/font/google";
import { siteConfig } from "@/config/site";
import { textures } from "@/content/assets";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const bricolage = Bricolage_Grotesque({
  axes: ["opsz", "wdth"],
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
// Nastaliq display face for the Urdu wordmark. Only the Arabic subset is needed.
const gulzar = Gulzar({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-gulzar",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.company }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_PK",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ece1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} ${instrument.variable} ${gulzar.variable}`}
    >
      <body
        className="grain min-h-[100dvh]"
        // Table texture comes from the asset registry so it can be swapped in one place.
        style={{ ["--table-texture" as string]: `url("${textures.table.src}")` }}
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
