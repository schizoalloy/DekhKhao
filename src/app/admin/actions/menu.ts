"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { friendlyDbError, slugify, type ActionState } from "@/lib/admin/action-state";
import { removeOrphanFiles } from "@/lib/admin/files";

/**
 * Restaurant, category and item edits. Every action re-checks the admin session, validates its
 * input, and writes as the signed-in user, so RLS applies. Nothing here touches the live menu:
 * customers only see changes after Publish (actions/publish.ts).
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const id = z.uuid();
const name = (max: number) => z.string().trim().min(1, "Enter a name.").max(max, `Keep it under ${max} characters.`);
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(max).nullable());
const optionalPositive = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number({ error: "Use a number." }).positive("Must be more than 0.").nullable(),
);

function invalid(error: z.ZodError): ActionState {
  return { ok: false, error: error.issues[0]?.message ?? "Check the form and try again." };
}

const refreshAdmin = () => revalidatePath("/admin", "layout");

// --- restaurants -----------------------------------------------------------------------------

const NewRestaurant = z.object({
  name: name(120),
  slug: z
    .string()
    .min(2, "The address needs at least 2 characters.")
    .max(60)
    .regex(SLUG, "Use lowercase letters, numbers and single hyphens only."),
});

export async function createRestaurant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const nameValue = String(formData.get("name") ?? "");
  const slugValue = String(formData.get("slug") ?? "").trim().toLowerCase() || slugify(nameValue);
  const parsed = NewRestaurant.safeParse({ name: nameValue, slug: slugValue });
  if (!parsed.success) return invalid(parsed.error);

  const { data, error } = await supabase.from("restaurants").insert(parsed.data).select("id").single();
  if (error)
    return {
      ok: false,
      error: friendlyDbError(error, {
        unique: `/r/${parsed.data.slug} is already taken. Pick another address.`,
        invalid: parsed.data.slug === "demo" ? "“demo” is reserved for the built-in demo menu." : undefined,
      }),
    };
  refreshAdmin();
  redirect(`/admin/restaurants/${data.id}`);
}

const RestaurantSettings = z.object({
  id,
  name: name(120),
  catalog_title: name(60),
  accent: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : null),
    z.string().regex(/^#[0-9a-fA-F]{6}$/, "Accent colour must look like #c2410c.").nullable(),
  ),
  indexable: checkbox,
});

export async function updateRestaurant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = RestaurantSettings.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id: restaurantId, ...changes } = parsed.data;
  const { error } = await supabase.from("restaurants").update(changes).eq("id", restaurantId);
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshAdmin();
  return { ok: true, message: "Saved. Publish to show it on the live menu." };
}

// --- categories ------------------------------------------------------------------------------

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ restaurant_id: id, name: name(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: last } = await supabase
    .from("menu_categories")
    .select("position")
    .eq("restaurant_id", parsed.data.restaurant_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("menu_categories").insert({ ...parsed.data, position: (last?.position ?? -1) + 1 });
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshAdmin();
  return { ok: true };
}

const CategoryChanges = z.object({
  id,
  name: name(80),
  position: z.coerce.number().int(),
  is_visible: checkbox,
});

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = CategoryChanges.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id: categoryId, ...changes } = parsed.data;
  const { error } = await supabase.from("menu_categories").update(changes).eq("id", categoryId);
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshAdmin();
  return { ok: true, message: "Saved." };
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.from("menu_categories").delete().eq("id", parsed.data.id);
  if (error)
    return { ok: false, error: friendlyDbError(error, { inUse: "Move or delete this category's items first." }) };
  refreshAdmin();
  return { ok: true };
}

// --- items -----------------------------------------------------------------------------------

export async function createItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = z
    .object({ restaurant_id: id, category_id: z.uuid("Add a category first."), name: name(120) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  // Item addresses are /r/<restaurant>/<item-slug>; add a number if the name is already used.
  const base = slugify(parsed.data.name, 76) || "item";
  for (let n = 1; n <= 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { data, error } = await supabase.from("menu_items").insert({ ...parsed.data, slug }).select("id").single();
    if (!error) {
      refreshAdmin();
      redirect(`/admin/restaurants/${parsed.data.restaurant_id}/items/${data.id}`);
    }
    if (error.code !== "23505") return { ok: false, error: friendlyDbError(error) };
  }
  return { ok: false, error: "Couldn't find a free address for this item. Try a different name." };
}

const ItemChanges = z.object({
  id,
  category_id: id,
  name: name(120),
  slug: z.string().trim().min(1).max(80).regex(SLUG, "Use lowercase letters, numbers and single hyphens only."),
  description: z.string().trim().max(1000, "Keep the description under 1000 characters."),
  price: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number({ error: "Price must be a number." }).min(0).max(99_999_999).nullable(),
  ),
  camera_orbit: optionalText(60),
  width_cm: optionalPositive,
  height_cm: optionalPositive,
  depth_cm: optionalPositive,
  scale_source: z.enum(["file", "measured"]),
  scale_verified: checkbox,
  lock_scale_in_ar: checkbox,
  is_visible: checkbox,
  is_test_item: checkbox,
});

export async function updateItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = ItemChanges.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { id: itemId, ...changes } = parsed.data;
  if (changes.scale_verified && changes.scale_source !== "measured")
    return { ok: false, error: "Only a measured size can be marked as checked." };

  const { error } = await supabase.from("menu_items").update(changes).eq("id", itemId);
  if (error) return { ok: false, error: friendlyDbError(error, { unique: `Another item already uses /${changes.slug}.` }) };
  refreshAdmin();
  return { ok: true, message: "Saved. Publish to show it on the live menu." };
}

export async function deleteItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ id, restaurant_id: id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.from("menu_items").delete().eq("id", parsed.data.id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await removeOrphanFiles(supabase, parsed.data.restaurant_id);
  refreshAdmin();
  redirect(`/admin/restaurants/${parsed.data.restaurant_id}`);
}
