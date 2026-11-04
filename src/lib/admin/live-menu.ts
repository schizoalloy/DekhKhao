import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { menuTag } from "@/catalog/published";
import { friendlyDbError } from "@/lib/admin/action-state";
import { removeStalePublicFiles } from "@/lib/admin/files";
import { deleteLiveMenu } from "@/lib/r2";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Takes a restaurant's menu offline: the live copy in R2 first, so customers lose it at once, then
 * the database's record of it and the files in the public bucket. Drafts stay. Harmless when the
 * menu isn't live, and safe to repeat after a failure. Returns an error message, or null.
 */
export async function takeMenuOffline(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
  slug: string,
): Promise<string | null> {
  try {
    await deleteLiveMenu(slug);
  } catch (e) {
    return `Couldn't take the live menu offline: ${e instanceof Error ? e.message : String(e)}`;
  }
  const { error } = await supabase.from("published_menus").delete().eq("restaurant_id", restaurantId);
  if (error) return friendlyDbError(error);
  await removeStalePublicFiles(supabase, restaurantId, new Set());
  return null;
}

/** Expires a restaurant's cached customer pages and refreshes the admin. */
export function refreshMenu(slug: string) {
  revalidateTag(menuTag(slug), { expire: 0 });
  revalidatePath(`/r/${slug}`, "layout");
  revalidatePath(`/qr/${slug}`, "layout");
  revalidatePath("/admin", "layout");
}
