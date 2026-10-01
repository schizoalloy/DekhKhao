import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { publicAssetUrl } from "@/config/assets";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Restaurant } from "./types";

/**
 * Menus published from the admin console. Each one is a frozen snapshot written by the database's
 * publish_menu() (supabase/migrations), read with the anonymous key, so drafts can't leak here.
 */

/** Cache tag for one restaurant's published menu. Publishing and unpublishing expire it. */
export const menuTag = (slug: string) => `menu:${slug}`;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SnapshotItem = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.object({ amount: z.number(), currency: z.string() }).optional(),
  isTestItem: z.boolean().optional(),
  thumbnail: z.string().optional(),
  model: z.object({
    glb: z.string().optional(),
    usdz: z.string().optional(),
    poster: z.string().optional(),
    cameraOrbit: z.string().optional(),
  }),
  scale: z.object({
    dimensionsCm: z.object({ width: z.number(), height: z.number(), depth: z.number() }),
    source: z.enum(["file", "measured"]),
    verified: z.boolean(),
    lockScaleInAR: z.boolean(),
  }),
});

const Snapshot = z.object({
  schemaVersion: z.literal(1),
  slug: z.string(),
  name: z.string(),
  catalogTitle: z.string(),
  accent: z.string().optional(),
  indexable: z.boolean(),
  logo: z.string().optional(),
  categories: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(SnapshotItem),
});

/** File fields in a snapshot are public-bucket keys; turn them into URLs. */
function toRestaurant(raw: unknown): Restaurant {
  const s = Snapshot.parse(raw);
  const url = (key?: string) => (key ? publicAssetUrl(key) : undefined);
  return {
    slug: s.slug,
    name: s.name,
    catalogTitle: s.catalogTitle,
    accent: s.accent,
    indexable: s.indexable,
    logo: url(s.logo),
    categories: s.categories,
    items: s.items.map((item) => ({
      ...item,
      thumbnail: url(item.thumbnail),
      model: { ...item.model, glb: url(item.model.glb), usdz: url(item.model.usdz), poster: url(item.model.poster) },
    })),
  };
}

const loadSnapshot = (slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createSupabasePublicClient();
      if (!supabase) return null;
      const { data, error } = await supabase.from("published_menus").select("snapshot").eq("slug", slug).maybeSingle();
      if (error) throw new Error(`Couldn't load the published menu for "${slug}": ${error.message}`);
      return data?.snapshot ?? null;
    },
    ["published-menu", slug],
    // Publishing expires the tag straight away; the hour is only a safety net.
    { tags: [menuTag(slug)], revalidate: 3600 },
  )();

export async function getPublishedRestaurant(slug: string): Promise<Restaurant | null> {
  if (!SLUG.test(slug)) return null;
  const snapshot = await loadSnapshot(slug);
  return snapshot ? toRestaurant(snapshot) : null;
}
