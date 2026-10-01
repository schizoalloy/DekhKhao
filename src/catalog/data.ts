/**
 * Catalog data access. Pages only talk to these async functions, so swapping the
 * JSON registry for a database later means changing this file, not the UI.
 */
import { restaurantRecords } from "./restaurants";
import type { CatalogItem, Restaurant } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Fails the build with a readable message instead of shipping a broken menu. */
function validate(records: Restaurant[]): Restaurant[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const r of records) {
    const at = `restaurant "${r.slug}"`;
    if (!SLUG.test(r.slug)) problems.push(`${at}: slug must be lowercase letters, numbers and hyphens`);
    if (seen.has(r.slug)) problems.push(`${at}: duplicate slug`);
    seen.add(r.slug);
    if (!r.name?.trim()) problems.push(`${at}: missing name`);
    if (r.accent && !/^#[0-9a-fA-F]{6}$/.test(r.accent)) problems.push(`${at}: accent must be a 6-digit hex colour`);
    const categoryIds = new Set(r.categories.map((c) => c.id));
    const itemSlugs = new Set<string>();
    for (const item of r.items) {
      const iat = `${at}, item "${item.slug}"`;
      if (!SLUG.test(item.slug)) problems.push(`${iat}: slug must be lowercase letters, numbers and hyphens`);
      if (itemSlugs.has(item.slug)) problems.push(`${iat}: duplicate item slug`);
      itemSlugs.add(item.slug);
      if (!categoryIds.has(item.category)) problems.push(`${iat}: unknown category "${item.category}"`);
      if (!item.model.glb && !item.model.usdz) problems.push(`${iat}: needs a GLB or a USDZ model`);
      const d = item.scale.dimensionsCm;
      if (!(d.width > 0 && d.height > 0 && d.depth > 0)) problems.push(`${iat}: dimensionsCm must be positive numbers`);
      if (item.scale.verified && item.scale.source !== "measured")
        problems.push(`${iat}: only a "measured" scale can be marked verified`);
    }
  }
  if (problems.length) throw new Error(`Invalid restaurant catalog:\n- ${problems.join("\n- ")}`);
  return records;
}

const restaurants = validate(restaurantRecords);

export async function listRestaurants(): Promise<Restaurant[]> {
  return restaurants;
}

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  return restaurants.find((r) => r.slug === slug) ?? null;
}

export async function getItem(
  restaurantSlug: string,
  itemSlug: string,
): Promise<{ restaurant: Restaurant; item: CatalogItem } | null> {
  const restaurant = await getRestaurant(restaurantSlug);
  const item = restaurant?.items.find((i) => i.slug === itemSlug);
  return restaurant && item ? { restaurant, item } : null;
}
