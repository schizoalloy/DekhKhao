import { ArrowLeft, Info } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, listRestaurants } from "@/catalog/data";
import { ItemExperience } from "@/components/catalog/ItemExperience";
import { MenuHeader } from "@/components/catalog/MenuChrome";
import { catalogPath } from "@/config/app";

type Params = { params: Promise<{ restaurantSlug: string; itemSlug: string }> };

export async function generateStaticParams() {
  return (await listRestaurants()).flatMap((r) => r.items.map((i) => ({ restaurantSlug: r.slug, itemSlug: i.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { restaurantSlug, itemSlug } = await params;
  const found = await getItem(restaurantSlug, itemSlug);
  if (!found) return {};
  const { item, restaurant } = found;
  return {
    title: item.name,
    description: `${item.description}. See it in 3D and place it on your table in AR at ${restaurant.name}.`,
    openGraph: item.thumbnail ? { images: [{ url: item.thumbnail, width: 640, height: 640, alt: item.name }] } : undefined,
  };
}

export default async function ItemPage({ params }: Params) {
  const { restaurantSlug, itemSlug } = await params;
  const found = await getItem(restaurantSlug, itemSlug);
  if (!found) notFound();
  const { restaurant, item } = found;
  const category = restaurant.categories.find((c) => c.id === item.category);

  return (
    <>
      <MenuHeader
        restaurant={restaurant}
        back={
          <Link
            href={catalogPath(restaurant.slug)}
            className="-ml-2 flex min-h-11 min-w-0 items-center gap-2 rounded-full px-2 font-medium active:scale-[0.98]"
          >
            <ArrowLeft size={20} aria-hidden />
            <span className="truncate">
              {restaurant.catalogTitle}
              <span className="sr-only">, back to {restaurant.name}</span>
            </span>
          </Link>
        }
      />
      <main id="main">
        <ItemExperience item={item}>
          {category && <p className="text-sm font-medium text-m-accent">{category.name}</p>}
          <h1 className="mt-1 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{item.name}</h1>
          <p className="mt-3 max-w-[48ch] text-[1.02rem] leading-relaxed text-m-muted">{item.description}</p>
          {item.isTestItem && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-m-surface px-4 py-3 text-sm leading-relaxed text-m-muted">
              <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
              A test item for trying the 3D and AR experience. It isn’t a dish on the menu.
            </p>
          )}
        </ItemExperience>
      </main>
    </>
  );
}
