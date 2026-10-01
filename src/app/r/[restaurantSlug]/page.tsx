import { notFound } from "next/navigation";
import { getRestaurant, listRestaurants } from "@/catalog/data";
import { ItemCard } from "@/components/catalog/ItemCard";
import { MenuFooter, MenuHeader } from "@/components/catalog/MenuChrome";

type Params = { params: Promise<{ restaurantSlug: string }> };

export async function generateStaticParams() {
  return (await listRestaurants()).map((r) => ({ restaurantSlug: r.slug }));
}

/** The page a table QR code opens: the restaurant's menu. */
export default async function CatalogPage({ params }: Params) {
  const restaurant = await getRestaurant((await params).restaurantSlug);
  if (!restaurant) notFound();

  const groups = restaurant.categories
    .map((c) => ({ ...c, items: restaurant.items.filter((i) => i.category === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <MenuHeader restaurant={restaurant} />
      <main id="main" className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
        <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.035em] sm:text-6xl">
          {restaurant.catalogTitle}
        </h1>
        <p className="mt-3 max-w-[40ch] text-[0.98rem] leading-relaxed text-m-muted">
          Tap a dish to see it in 3D, then place it on your table in AR.
        </p>

        {groups.length === 0 ? (
          <p className="mt-12 rounded-3xl border border-dashed border-m-line p-8 text-center text-m-muted">
            This menu has no items yet. Ask a member of staff for the printed menu.
          </p>
        ) : (
          groups.map((group, gi) => (
            <section key={group.id} aria-labelledby={`cat-${group.id}`} className="mt-10 sm:mt-14">
              <h2 id={`cat-${group.id}`} className="flex items-baseline justify-between border-b border-m-line pb-3">
                <span className="font-display text-xl font-semibold tracking-[-0.02em]">{group.name}</span>
                <span className="text-xs text-m-muted">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </h2>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
                {group.items.map((item, ii) => {
                  const featured = group.items.length === 1;
                  return (
                    <li key={item.slug} className={featured ? "col-span-2 md:col-span-3" : undefined}>
                      <ItemCard restaurantSlug={restaurant.slug} item={item} featured={featured} priority={gi === 0 && ii < 2} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </main>
      <MenuFooter />
    </>
  );
}
