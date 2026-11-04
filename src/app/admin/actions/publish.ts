"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { friendlyDbError, type ActionState } from "@/lib/admin/action-state";
import { keysInSnapshot, removeOrphanFiles, removeStalePublicFiles } from "@/lib/admin/files";
import { refreshMenu, takeMenuOffline } from "@/lib/admin/live-menu";
import { deletePublicFile, publishFile, writeLiveMenu } from "@/lib/r2";

/**
 * Publish: copy the files the menu needs into the public bucket, let the database's publish_menu()
 * validate everything and freeze the snapshot, then write that snapshot to the public bucket as
 * the live menu customers read. If the database refuses, the files copied for this attempt are
 * taken out again, so a failed publish never leaves unpublished models public.
 */
export async function publishMenu(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const restaurantId = z.uuid().safeParse(formData.get("restaurantId"));
  if (!restaurantId.success) return { ok: false, error: "Unknown restaurant." };
  const rid = restaurantId.data;

  const [restaurant, categories, items, assets] = await Promise.all([
    supabase.from("restaurants").select("slug, logo_asset_id").eq("id", rid).single(),
    supabase.from("menu_categories").select("id, is_visible").eq("restaurant_id", rid),
    supabase
      .from("menu_items")
      .select("category_id, is_visible, glb_asset_id, usdz_asset_id, poster_asset_id, thumbnail_asset_id")
      .eq("restaurant_id", rid),
    supabase.from("assets").select("id, storage_key, content_type, status, public_key").eq("restaurant_id", rid),
  ]);
  if (restaurant.error || categories.error || items.error || assets.error)
    return { ok: false, error: friendlyDbError((restaurant.error ?? categories.error ?? items.error ?? assets.error)!) };

  const visibleCategories = new Set(categories.data.filter((c) => c.is_visible).map((c) => c.id));
  const needed = new Set(
    [
      restaurant.data.logo_asset_id,
      ...items.data
        .filter((i) => i.is_visible && visibleCategories.has(i.category_id))
        .flatMap((i) => [i.glb_asset_id, i.usdz_asset_id, i.poster_asset_id, i.thumbnail_asset_id]),
    ].filter(Boolean) as string[],
  );

  const copied: { id: string; key: string }[] = [];
  const undoCopies = async () => {
    for (const file of copied) {
      await deletePublicFile(file.key).catch(() => {});
      await supabase.from("assets").update({ public_key: null }).eq("id", file.id);
    }
  };

  try {
    for (const asset of assets.data) {
      if (!needed.has(asset.id) || asset.status !== "ready" || asset.public_key) continue;
      await publishFile(asset.storage_key, asset.content_type);
      copied.push({ id: asset.id, key: asset.storage_key });
      const { error } = await supabase.from("assets").update({ public_key: asset.storage_key }).eq("id", asset.id);
      if (error) throw error;
    }
  } catch (e) {
    await undoCopies();
    return { ok: false, error: `Couldn't copy files for publishing: ${e instanceof Error ? e.message : String(e)}` };
  }

  const { data: published, error } = await supabase.rpc("publish_menu", { p_restaurant_id: rid });
  if (error) {
    await undoCopies();
    return {
      ok: false,
      error: error.code === "P0001" ? "Not published yet. Fix these first:" : friendlyDbError(error),
      problems: error.details?.split("\n").filter(Boolean),
    };
  }

  const version = (published.snapshot as { version?: number }).version;
  try {
    await writeLiveMenu(restaurant.data.slug, published.snapshot);
  } catch (e) {
    // Customers still see the previous version, and its files are still public, so this is safe
    // to retry. Stale files are only removed once the new copy is live.
    revalidatePath("/admin", "layout");
    return {
      ok: false,
      error: `Version ${version} is saved, but the live menu couldn't be updated (${e instanceof Error ? e.message : String(e)}). Publish again to retry.`,
    };
  }

  // Files the previous version used but this one doesn't come out of the public bucket.
  await removeStalePublicFiles(supabase, rid, keysInSnapshot(published.snapshot));
  await removeOrphanFiles(supabase, rid);
  refreshMenu(restaurant.data.slug);
  return { ok: true, message: `Published${version ? ` version ${version}` : ""}. The live menu is updated.` };
}

/** Takes the menu offline and removes its files from the public bucket. Drafts stay as they are. */
export async function unpublishMenu(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const restaurantId = z.uuid().safeParse(formData.get("restaurantId"));
  if (!restaurantId.success) return { ok: false, error: "Unknown restaurant." };
  const rid = restaurantId.data;

  const { data: restaurant, error: loadError } = await supabase.from("restaurants").select("slug").eq("id", rid).single();
  if (loadError) return { ok: false, error: friendlyDbError(loadError) };

  // If a step fails part-way, pressing Unpublish again finishes it.
  const problem = await takeMenuOffline(supabase, rid, restaurant.slug);
  if (problem) return { ok: false, error: problem };
  await removeOrphanFiles(supabase, rid);
  refreshMenu(restaurant.slug);
  return { ok: true, message: "Unpublished. The menu link now shows “We couldn’t find this menu”." };
}
