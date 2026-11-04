import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { publicAssetUrl } from "@/config/assets";
import { isR2Configured, readLiveMenu } from "@/lib/r2";
import type { Restaurant } from "./types";

/**
 * Menus published from the admin console. The database's publish_menu() (supabase/migrations)
 * freezes each one as a snapshot, and the publish action writes a copy of it to the public R2
 * bucket. Customer pages read only that copy: drafts can't leak here, and menus stay up while the
 * database is paused or unreachable.
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
      // Without R2 settings only the built-in JSON menus exist.
      if (!isR2Configured()) return null;
      try {
        return await readLiveMenu(slug);
      } catch (e) {
        throw new Error(`Couldn't load the live menu for "${slug}": ${e instanceof Error ? e.message : String(e)}`);
      }
    },
    ["live-menu", slug],
    // Publishing expires the tag straight away; the hour is only a safety net.
    { tags: [menuTag(slug)], revalidate: 3600 },
  )();

export async function getPublishedRestaurant(slug: string): Promise<Restaurant | null> {
  if (!SLUG.test(slug)) return null;
  const snapshot = await loadSnapshot(slug);
  return snapshot ? toRestaurant(snapshot) : null;
}
