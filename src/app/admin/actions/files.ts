"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/action-state";
import { contentTypeFor, fileExtension, formatBytes, SLOTS, type FileSlot } from "@/lib/admin/file-rules";
import { itemSlotUpdate, matchesSignature, removeOrphanFiles } from "@/lib/admin/files";
import { deletePrivateFile, headPrivate, readPrivateStart, signUpload } from "@/lib/r2";

/**
 * Upload flow: requestUpload() checks the file and returns a signed URL; the browser PUTs the file
 * straight to the private bucket; completeUpload() checks what arrived and attaches it to the
 * item (or restaurant logo). Files only reach the public bucket when a menu is published.
 */

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const Target = z.object({
  restaurantId: z.uuid(),
  itemId: z.uuid().nullable(),
  slot: z.enum(["glb", "usdz", "poster", "thumbnail", "logo"]),
});

function targetError({ itemId, slot }: z.infer<typeof Target>) {
  if (slot === "logo" && itemId) return "Logos belong to the restaurant, not an item.";
  if (slot !== "logo" && !itemId) return "This file needs an item.";
  return null;
}

export async function requestUpload(input: {
  restaurantId: string;
  itemId: string | null;
  slot: FileSlot;
  fileName: string;
  size: number;
}): Promise<Result<{ assetId: string; uploadUrl: string; contentType: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = Target.extend({ fileName: z.string().min(1).max(255), size: z.number().int().positive() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "That upload request wasn't valid." };
  const { restaurantId, itemId, slot, fileName, size } = parsed.data;
  const rules = SLOTS[slot];

  const problem = targetError(parsed.data);
  if (problem) return { ok: false, error: problem };
  const contentType = contentTypeFor(slot, fileName);
  if (!contentType)
    return { ok: false, error: `${rules.label} takes ${Object.keys(rules.types).map((e) => `.${e}`).join(", ")} files.` };
  if (size > rules.maxBytes) return { ok: false, error: `That file is ${formatBytes(size)}; the limit is ${formatBytes(rules.maxBytes)}.` };

  if (itemId) {
    const { data: item } = await supabase.from("menu_items").select("id").eq("id", itemId).eq("restaurant_id", restaurantId).maybeSingle();
    if (!item) return { ok: false, error: "That item doesn't exist any more." };
  }

  // Keys use IDs, never names, so renames don't matter and nobody can guess them.
  const assetId = randomUUID();
  const storageKey = `restaurants/${restaurantId}/${assetId}.${fileExtension(fileName)}`;
  const { error } = await supabase.from("assets").insert({
    id: assetId,
    restaurant_id: restaurantId,
    kind: rules.kind,
    content_type: contentType,
    storage_key: storageKey,
    byte_size: size,
    original_filename: fileName,
  });
  if (error) return { ok: false, error: friendlyDbError(error) };

  return { ok: true, assetId, uploadUrl: await signUpload(storageKey, contentType, size), contentType };
}

export async function completeUpload(input: {
  assetId: string;
  restaurantId: string;
  itemId: string | null;
  slot: FileSlot;
}): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = Target.extend({ assetId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "That upload wasn't valid." };
  const { assetId, restaurantId, itemId, slot } = parsed.data;
  const problem = targetError(parsed.data);
  if (problem) return { ok: false, error: problem };

  const { data: asset } = await supabase
    .from("assets")
    .select("id, kind, content_type, storage_key, byte_size, status")
    .eq("id", assetId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (!asset) return { ok: false, error: "That upload doesn't exist." };
  if (asset.kind !== SLOTS[slot].kind) return { ok: false, error: "That file doesn't belong in this slot." };

  const reject = async (error: string) => {
    await deletePrivateFile(asset.storage_key).catch(() => {});
    await supabase.from("assets").update({ status: "failed" }).eq("id", asset.id);
    return { ok: false as const, error };
  };

  if (asset.status !== "ready") {
    const stored = await headPrivate(asset.storage_key);
    if (!stored) return reject("The file didn't arrive. Try uploading it again.");
    if (stored.size !== asset.byte_size || stored.contentType !== asset.content_type)
      return reject("The uploaded file doesn't match what was expected. Try again.");
    const start = await readPrivateStart(asset.storage_key, 16);
    if (!matchesSignature(asset.content_type, start))
      return reject(`This doesn't look like a real ${SLOTS[slot].label.toLowerCase()} file.`);
    const { error } = await supabase.from("assets").update({ status: "ready" }).eq("id", asset.id);
    if (error) return { ok: false, error: friendlyDbError(error) };
  }

  const { error } =
    slot === "logo"
      ? await supabase.from("restaurants").update({ logo_asset_id: asset.id }).eq("id", restaurantId)
      : await supabase
          .from("menu_items")
          .update(itemSlotUpdate(slot, asset.id))
          .eq("id", itemId!)
          .eq("restaurant_id", restaurantId);
  if (error) return { ok: false, error: friendlyDbError(error) };

  // The file this one replaced is cleaned up unless the live menu still uses it.
  await removeOrphanFiles(supabase, restaurantId);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function removeFile(input: { restaurantId: string; itemId: string | null; slot: FileSlot }): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = Target.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That request wasn't valid." };
  const { restaurantId, itemId, slot } = parsed.data;
  const problem = targetError(parsed.data);
  if (problem) return { ok: false, error: problem };

  const { error } =
    slot === "logo"
      ? await supabase.from("restaurants").update({ logo_asset_id: null }).eq("id", restaurantId)
      : await supabase
          .from("menu_items")
          .update(itemSlotUpdate(slot, null))
          .eq("id", itemId!)
          .eq("restaurant_id", restaurantId);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await removeOrphanFiles(supabase, restaurantId);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
