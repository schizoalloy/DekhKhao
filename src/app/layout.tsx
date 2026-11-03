import type { Metadata, Viewport } from "next";
import { Caveat, Geist_Mono, Sora } from "next/font/google";
import { siteConfig } from "@/config/site";
import { textures } from "@/content/assets";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

// Brand type: Sora for headlines, UI and body; Caveat for handwritten taglines and asides.
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });
// Measurements and admin data only.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
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
  themeColor: "#faf9f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // js-motion is added before paint by the script below; it lets the hero intro start hidden
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${caveat.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-motion')" }} />
      </head>
      <body
        className="min-h-[100dvh]"
        // Table texture comes from the asset registry so it can be swapped in one place.
        style={{ ["--table-texture" as string]: `url("${textures.table.src}")` }}
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
