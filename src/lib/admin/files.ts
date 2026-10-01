import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deletePrivateFile, deletePublicFile } from "@/lib/r2";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

/** Item columns for each file slot. */
export const ITEM_SLOT_COLUMN = {
  glb: "glb_asset_id",
  usdz: "usdz_asset_id",
  poster: "poster_asset_id",
  thumbnail: "thumbnail_asset_id",
} as const;

type ItemSlot = keyof typeof ITEM_SLOT_COLUMN;

/** The menu_items update that puts a file in (or takes it out of) one slot. */
export function itemSlotUpdate(slot: ItemSlot, assetId: string | null): Database["public"]["Tables"]["menu_items"]["Update"] {
  switch (slot) {
    case "glb":
      return { glb_asset_id: assetId };
    case "usdz":
      return { usdz_asset_id: assetId };
    case "poster":
      return { poster_asset_id: assetId };
    case "thumbnail":
      return { thumbnail_asset_id: assetId };
  }
}

/** Whether the first bytes of a file match its declared type (the browser's label isn't trusted). */
export function matchesSignature(contentType: string, b: Uint8Array) {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  switch (contentType) {
    case "model/gltf-binary": // "glTF", then version 2 (little-endian uint32)
      return ascii(0, 4) === "glTF" && b[4] === 2 && b[5] === 0 && b[6] === 0 && b[7] === 0;
    case "model/vnd.usdz+zip": // USDZ is an uncompressed zip
      return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
    case "image/png":
      return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v);
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    default:
      return false;
  }
}

/** Every public-bucket key a published snapshot points at. */
export function keysInSnapshot(snapshot: unknown): Set<string> {
  const s = snapshot as {
    logo?: string;
    items?: { thumbnail?: string; model?: { glb?: string; usdz?: string; poster?: string } }[];
  };
  const keys = [s.logo, ...(s.items ?? []).flatMap((i) => [i.thumbnail, i.model?.glb, i.model?.usdz, i.model?.poster])];
  return new Set(keys.filter((k): k is string => Boolean(k)));
}

/** Takes files out of the public bucket unless the live menu still uses them. */
export async function removeStalePublicFiles(supabase: Supabase, restaurantId: string, keep: Set<string>) {
  const { data: assets, error } = await supabase
    .from("assets")
    .select("id, public_key")
    .eq("restaurant_id", restaurantId)
    .not("public_key", "is", null);
  if (error) throw error;
  for (const asset of assets) {
    if (!asset.public_key || keep.has(asset.public_key)) continue;
    await deletePublicFile(asset.public_key);
    await supabase.from("assets").update({ public_key: null }).eq("id", asset.id);
  }
}

/**
 * Deletes uploads nothing uses any more (replaced or removed files), from R2 and the database.
 * Skips files the live menu still serves and uploads that may still be in progress.
 */
export async function removeOrphanFiles(supabase: Supabase, restaurantId: string) {
  const [assets, items, restaurant] = await Promise.all([
    supabase.from("assets").select("id, storage_key, status, public_key, created_at").eq("restaurant_id", restaurantId),
    supabase
      .from("menu_items")
      .select("glb_asset_id, usdz_asset_id, poster_asset_id, thumbnail_asset_id")
      .eq("restaurant_id", restaurantId),
    supabase.from("restaurants").select("logo_asset_id").eq("id", restaurantId).single(),
  ]);
  if (assets.error || items.error || restaurant.error) throw assets.error ?? items.error ?? restaurant.error;

  const used = new Set(
    [restaurant.data.logo_asset_id, ...items.data.flatMap((i) => Object.values(i))].filter(Boolean) as string[],
  );
  const uploadGraceMs = 60 * 60 * 1000;
  for (const asset of assets.data) {
    const mayStillBeUploading = asset.status === "pending" && Date.now() - Date.parse(asset.created_at) < uploadGraceMs;
    if (used.has(asset.id) || asset.public_key || mayStillBeUploading) continue;
    await deletePrivateFile(asset.storage_key);
    await supabase.from("assets").delete().eq("id", asset.id);
  }
}
