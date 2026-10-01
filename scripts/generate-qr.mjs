/**
 * Generates the static QR code for a restaurant's catalog. Everything is generated
 * locally with the `qrcode` package; no third-party or "dynamic" QR service is involved.
 *
 *   npm run qr -- <restaurant-slug> --base https://your-domain.com
 *
 * Base URL, first one found wins (same order as src/config/app.ts):
 *   --base <url>  →  NEXT_PUBLIC_APP_URL  →  NEXT_PUBLIC_SITE_URL  (env, .env.production.local, .env.local, .env)
 * With none of those, it makes a DEVELOPMENT code for this computer's local network
 * address so a phone on the same Wi-Fi can open `npm run dev`. Development codes are
 * written with a `.dev` suffix and are git-ignored; never print them.
 *
 * Output (public/qr/):
 *   <slug>-catalog.png   1600 x 1600 px, for printing
 *   <slug>-catalog.svg   vector, for designers
 *   <slug>-catalog.txt   the exact URL encoded, and how it was generated
 */
import QRCode from "qrcode";
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const slug = argv.find((a) => !a.startsWith("--"));
const baseFlag = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : undefined;

if (!slug) {
  console.error("usage: npm run qr -- <restaurant-slug> [--base https://your-domain.com]");
  process.exit(1);
}
if (!existsSync(path.join(root, "src/catalog/restaurants", `${slug}.json`))) {
  console.error(`No restaurant "${slug}" (expected src/catalog/restaurants/${slug}.json)`);
  process.exit(1);
}

function fromEnvFiles(key) {
  for (const f of [".env.production.local", ".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(new RegExp(`^\\s*${key}\\s*=\\s*"?([^"\\r\\n]+)"?`, "m"));
    if (m) return m[1].trim();
  }
}
const configured =
  baseFlag ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  fromEnvFiles("NEXT_PUBLIC_APP_URL") ||
  fromEnvFiles("NEXT_PUBLIC_SITE_URL");

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list ?? []) if (a.family === "IPv4" && !a.internal) return a.address;
  return "localhost";
}

let base = configured ? configured.replace(/\/+$/, "") : `http://${lanAddress()}:${process.env.PORT ?? 3000}`;
try {
  base = new URL(base).origin;
} catch {
  console.error(`"${base}" is not a valid URL. Use the full address, e.g. https://dekhkhao.vercel.app`);
  process.exit(1);
}
const host = new URL(base).hostname;
const isDev =
  !configured ||
  host === "localhost" ||
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
  host.endsWith(".local");
if (!isDev && !base.startsWith("https://"))
  console.warn("! Production QR codes should use https (AR on Android needs a secure page).");

const url = `${base}/r/${slug}`;
const name = `${slug}-catalog${isDev ? ".dev" : ""}`;
const outDir = path.join(root, "public/qr");
await fs.mkdir(outDir, { recursive: true });

// Error correction "M" (15%) keeps the code compact but tolerant of print wear.
const opts = { errorCorrectionLevel: "M", margin: 4, color: { dark: "#1b1714", light: "#ffffff" } };
await QRCode.toFile(path.join(outDir, `${name}.png`), url, { ...opts, width: 1600 });
await fs.writeFile(path.join(outDir, `${name}.svg`), await QRCode.toString(url, { ...opts, type: "svg" }));
await fs.writeFile(
  path.join(outDir, `${name}.txt`),
  [
    `Encoded URL: ${url}`,
    `Restaurant:  ${slug}`,
    `Kind:        ${isDev ? "DEVELOPMENT (local network only, do not print)" : "production"}`,
    `Generated:   ${new Date().toISOString()}`,
    "",
    "Regenerate after the domain changes:",
    `  npm run qr -- ${slug} --base https://your-domain.com`,
    "",
  ].join("\n"),
);

console.log(`${isDev ? "DEVELOPMENT " : ""}QR code for ${url}`);
console.log(`  public/qr/${name}.png\n  public/qr/${name}.svg\n  public/qr/${name}.txt`);
if (isDev)
  console.log("  (No production URL configured. Pass --base https://<your-vercel-or-custom-domain> for the printable code.)");
