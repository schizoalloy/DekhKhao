import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { getRestaurant } from "@/catalog/data";
import { siteConfig } from "@/config/site";

type Params = { params: Promise<{ restaurantSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const restaurant = await getRestaurant((await params).restaurantSlug);
  if (!restaurant) return {};
  return {
    title: { default: `${restaurant.catalogTitle} | ${restaurant.name}`, template: `%s | ${restaurant.name}` },
    description: `See ${restaurant.name}'s menu in 3D and place dishes on your table in AR. ${siteConfig.tagline}`,
    robots: restaurant.indexable ? undefined : { index: false, follow: false },
    applicationName: siteConfig.name,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ece1" },
    { media: "(prefers-color-scheme: dark)", color: "#141110" },
  ],
};

/** Every page under /r/<slug> shares the restaurant's theme. Unknown slugs 404 here. */
export default async function RestaurantLayout({ params, children }: Params & { children: ReactNode }) {
  const restaurant = await getRestaurant((await params).restaurantSlug);
  if (!restaurant) notFound();
  const style = restaurant.accent ? ({ "--restaurant-accent": restaurant.accent } as CSSProperties) : undefined;
  return (
    <div className="menu min-h-[100dvh]" style={style}>
      {children}
    </div>
  );
}
