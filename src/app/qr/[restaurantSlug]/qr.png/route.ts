import QRCode from "qrcode";
import { getRestaurant, listRestaurants } from "@/catalog/data";
import { catalogUrl } from "@/config/app";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await listRestaurants()).map((r) => ({ restaurantSlug: r.slug }));
}

/** 1600 px print-quality PNG of the restaurant's catalog QR code. */
export async function GET(_req: Request, { params }: { params: Promise<{ restaurantSlug: string }> }) {
  const restaurant = await getRestaurant((await params).restaurantSlug);
  if (!restaurant) return new Response("Not found", { status: 404 });
  const png = await QRCode.toBuffer(catalogUrl(restaurant.slug), {
    width: 1600,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1714", light: "#ffffff" },
  });
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png" } });
}
