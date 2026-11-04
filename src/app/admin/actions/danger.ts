"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { friendlyDbError, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";
import { DANGER_CONFIRMATION, isDangerConfirmed } from "@/lib/admin/danger";
import { removeOrphanFiles } from "@/lib/admin/files";
import { refreshMenu, takeMenuOffline } from "@/lib/admin/live-menu";
import { deleteLiveMenu, deleteRestaurantFiles } from "@/lib/r2";

/**
 * The Danger Zone on a restaurant's admin page. Everything here deletes for good, so every action
 * re-checks the admin and refuses unless the form carries the typed confirmation. The browser only
 * enables the button once the text matches, but this check is the one that counts.
 */

const DangerRequest = z.object({ restaurantId: z.uuid(), confirmation: z.string() });

async function confirmedRestaurant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = DangerRequest.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Unknown restaurant." } as const;
  if (!isDangerConfirmed(parsed.data.confirmation))
    return { ok: false, error: `Type “${DANGER_CONFIRMATION}” exactly to confirm. Nothing was deleted.` } as const;

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, slug, name, published_menus(restaurant_id)")
    .eq("id", parsed.data.restaurantId)
    .maybeSingle();
  if (error) return { ok: false, error: friendlyDbError(error) } as const;
  if (!restaurant) return { ok: false, error: "That restaurant doesn't exist any more." } as const;
  return { ok: true, supabase, restaurant, wasLive: Boolean(restaurant.published_menus) } as const;
}

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Every category and item, with the files they use. The restaurant, its logo and settings stay. */
export async function deleteWholeMenu(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const target = await confirmedRestaurant(formData);
  if (!target.ok) return target;
  const { supabase, restaurant, wasLive } = target;

  const offline = await takeMenuOffline(supabase, restaurant.id, restaurant.slug);
  if (offline) return { ok: false, error: offline };

  // Items first: they reference their categories.
  const items = await supabase.from("menu_items").delete().eq("restaurant_id", restaurant.id).select("id");
  if (items.error) return { ok: false, error: friendlyDbError(items.error) };
  const categories = await supabase.from("menu_categories").delete().eq("restaurant_id", restaurant.id).select("id");
  if (categories.error) return { ok: false, error: friendlyDbError(categories.error) };

  // Their models and pictures are unused now, so this deletes them from R2 and the database.
  await removeOrphanFiles(supabase, restaurant.id);
  refreshMenu(restaurant.slug);
  return {
    ok: true,
    message:
      `Deleted ${count(categories.data.length, "category", "categories")} and ${count(items.data.length, "item")} with their files.` +
      (wasLive ? " The live menu is offline." : ""),
  };
}

/** Every GLB and USDZ. Items keep their details and pictures; the menu goes offline, since it can't be live without models. */
export async function deleteArModels(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const target = await confirmedRestaurant(formData);
  if (!target.ok) return target;
  const { supabase, restaurant, wasLive } = target;

  const modelsIn = () =>
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).in("kind", ["glb", "usdz"]);
  const before = await modelsIn();
  if (before.error) return { ok: false, error: friendlyDbError(before.error) };

  const offline = await takeMenuOffline(supabase, restaurant.id, restaurant.slug);
  if (offline) return { ok: false, error: offline };

  const { error } = await supabase
    .from("menu_items")
    .update({ glb_asset_id: null, usdz_asset_id: null })
    .eq("restaurant_id", restaurant.id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await removeOrphanFiles(supabase, restaurant.id);
  refreshMenu(restaurant.slug);

  const after = await modelsIn();
  const left = after.count ?? 0;
  return {
    ok: true,
    message:
      `Deleted ${count((before.count ?? 0) - left, "3D model file")}.` +
      (wasLive ? " The live menu is offline until items have models again and you publish." : "") +
      (left ? ` ${count(left, "upload")} still in progress will be cleaned up within the hour.` : ""),
  };
}

/** The restaurant and everything in it. The database deletes the menu, file records and history with it. */
export async function deleteRestaurant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const target = await confirmedRestaurant(formData);
  if (!target.ok) return target;
  const { supabase, restaurant } = target;

  // Customers lose the menu first, then every stored file, then the records.
  try {
    await deleteLiveMenu(restaurant.slug);
    await deleteRestaurantFiles(restaurant.id);
  } catch (e) {
    return { ok: false, error: `Couldn't delete all the files (${message(e)}). The restaurant is still here; try again.` };
  }

  const { data, error } = await supabase.from("restaurants").delete().eq("id", restaurant.id).select("id");
  if (error) return { ok: false, error: friendlyDbError(error) };
  if (data.length === 0) return { ok: false, error: "You don't have permission to delete this restaurant." };

  refreshMenu(restaurant.slug);
  redirect(`/admin?deleted=${encodeURIComponent(restaurant.name)}`);
}
