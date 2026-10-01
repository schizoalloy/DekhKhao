import { ArrowLeft, Info } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { z } from "zod";
import { deleteItem, updateItem } from "@/app/admin/actions/menu";
import type { CatalogItem } from "@/catalog/types";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { ui } from "@/components/admin/styles";
import { ItemExperience } from "@/components/catalog/ItemExperience";
import { requireAdmin } from "@/lib/admin/auth";
import type { FileSlot } from "@/lib/admin/file-rules";
import { ITEM_SLOT_COLUMN } from "@/lib/admin/files";
import { signPreview } from "@/lib/r2";

type Params = { params: Promise<{ restaurantId: string; itemId: string }> };

export const metadata: Metadata = { title: "Menu item" };

export default async function ItemAdminPage({ params }: Params) {
  const { restaurantId, itemId } = await params;
  if (!z.uuid().safeParse(restaurantId).success || !z.uuid().safeParse(itemId).success) notFound();
  const { supabase } = await requireAdmin();

  const [restaurant, item, categories, assets] = await Promise.all([
    supabase.from("restaurants").select("id, name, slug, accent").eq("id", restaurantId).maybeSingle(),
    supabase.from("menu_items").select("*").eq("id", itemId).eq("restaurant_id", restaurantId).maybeSingle(),
    supabase.from("menu_categories").select("id, name").eq("restaurant_id", restaurantId).order("position"),
    supabase
      .from("assets")
      .select("id, storage_key, original_filename, byte_size, status, public_key")
      .eq("restaurant_id", restaurantId),
  ]);
  if (restaurant.error || item.error || categories.error || assets.error)
    throw restaurant.error ?? item.error ?? categories.error ?? assets.error;
  if (!restaurant.data || !item.data) notFound();

  const r = restaurant.data;
  const i = item.data;
  const asset = new Map(assets.data.map((a) => [a.id, a]));
  const fileIn = (slot: Exclude<FileSlot, "logo">) => {
    const id = i[ITEM_SLOT_COLUMN[slot]];
    const a = id ? asset.get(id) : undefined;
    return a?.status === "ready" ? a : undefined;
  };
  // Private files, seen through 15-minute signed links. Customers never get these.
  const preview = async (slot: Exclude<FileSlot, "logo">) => {
    const a = fileIn(slot);
    return a ? await signPreview(a.storage_key) : undefined;
  };
  const [glb, usdz, poster, thumbnail] = await Promise.all([preview("glb"), preview("usdz"), preview("poster"), preview("thumbnail")]);

  const hasSize = i.width_cm != null && i.height_cm != null && i.depth_cm != null;
  const previewItem: CatalogItem | null =
    glb || usdz
      ? {
          slug: i.slug,
          name: i.name,
          description: i.description,
          category: i.category_id,
          thumbnail,
          isTestItem: i.is_test_item,
          model: { glb, usdz, poster, cameraOrbit: i.camera_orbit ?? undefined },
          scale: {
            dimensionsCm: { width: i.width_cm ?? 0, height: i.height_cm ?? 0, depth: i.depth_cm ?? 0 },
            source: i.scale_source as "file" | "measured",
            verified: i.scale_verified,
            lockScaleInAR: i.lock_scale_in_ar,
          },
        }
      : null;
  const current = (slot: Exclude<FileSlot, "logo">) => {
    const a = fileIn(slot);
    return a ? { fileName: a.original_filename, size: a.byte_size, isPublic: Boolean(a.public_key) } : null;
  };

  return (
    <>
      <Link href={`/admin/restaurants/${r.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {r.name}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em]">{i.name}</h1>
      <p className="mt-1 font-mono text-sm text-muted">
        /r/{r.slug}/{i.slug}
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm text-muted">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
        Changes here are drafts. Customers see them after you publish the menu.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <ActionForm action={updateItem} className={`${ui.card} space-y-4`}>
          <h2 className="font-display text-xl font-semibold">Details</h2>
          <input type="hidden" name="id" value={i.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={ui.label} htmlFor="name">
                Name
              </label>
              <input id="name" name="name" defaultValue={i.name} required maxLength={120} className={ui.input} />
            </div>
            <div>
              <label className={ui.label} htmlFor="slug">
                Address
              </label>
              <input id="slug" name="slug" defaultValue={i.slug} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={`${ui.input} font-mono`} />
            </div>
          </div>
          <div>
            <label className={ui.label} htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" defaultValue={i.description} maxLength={1000} rows={3} className={ui.input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={ui.label} htmlFor="category">
                Category
              </label>
              <select id="category" name="category_id" defaultValue={i.category_id} className={ui.input}>
                {categories.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={ui.label} htmlFor="price">
                Price ({i.currency}), optional
              </label>
              <input id="price" name="price" type="number" min={0} step="0.01" defaultValue={i.price ?? ""} className={ui.input} />
            </div>
          </div>

          <fieldset className="rounded-2xl border border-line p-4">
            <legend className="px-1 text-sm font-medium">Real size in AR (cm)</legend>
            <p className={ui.hint}>
              Width × height × depth of the model as it will appear. Measure the real dish when you can.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {(["width_cm", "height_cm", "depth_cm"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs text-muted" htmlFor={field}>
                    {field.replace("_cm", "")}
                  </label>
                  <input id={field} name={field} type="number" min={0.01} step="0.01" defaultValue={i[field] ?? ""} className={ui.input} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted" htmlFor="scale_source">
                  Where the size comes from
                </label>
                <select id="scale_source" name="scale_source" defaultValue={i.scale_source} className={ui.input}>
                  <option value="file">The model file (not checked)</option>
                  <option value="measured">Measured from the real dish</option>
                </select>
              </div>
              <div className="space-y-2 pt-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="scale_verified" defaultChecked={i.scale_verified} className={ui.check} /> Size checked against the dish
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="lock_scale_in_ar" defaultChecked={i.lock_scale_in_ar} className={ui.check} /> Lock true size in AR
                </label>
              </div>
            </div>
          </fieldset>

          <div>
            <label className={ui.label} htmlFor="camera_orbit">
              Starting camera angle, optional
            </label>
            <input id="camera_orbit" name="camera_orbit" defaultValue={i.camera_orbit ?? ""} placeholder="20deg 78deg auto" maxLength={60} className={`${ui.input} font-mono`} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_visible" defaultChecked={i.is_visible} className={ui.check} /> Show on the menu
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_test_item" defaultChecked={i.is_test_item} className={ui.check} /> Test item (customers see a note)
            </label>
          </div>
          <SubmitButton>Save details</SubmitButton>
        </ActionForm>

        <section aria-labelledby="files-heading" className="space-y-3">
          <h2 id="files-heading" className="font-display text-xl font-semibold">
            Files
          </h2>
          <p className="text-sm text-muted">
            A GLB gives 3D in the browser and AR on Android. iPhone AR uses the USDZ if there is one.
          </p>
          {(["glb", "usdz", "poster", "thumbnail"] as const).map((slot) => (
            <FileUpload key={slot} restaurantId={r.id} itemId={i.id} slot={slot} current={current(slot)} />
          ))}
          <ActionForm action={deleteItem} className="pt-4">
            <input type="hidden" name="id" value={i.id} />
            <input type="hidden" name="restaurant_id" value={r.id} />
            <SubmitButton variant="danger" confirm={`Delete “${i.name}” and its files? The live menu keeps it until you publish again.`}>
              Delete item
            </SubmitButton>
          </ActionForm>
        </section>
      </div>

      <section aria-labelledby="preview-heading" className="mt-12">
        <h2 id="preview-heading" className="font-display text-xl font-semibold">
          Preview
        </h2>
        <p className="mt-1 text-sm text-muted">
          What customers will see, from your private draft files.
          {!hasSize && " Add the real size above before publishing."}
        </p>
        {previewItem ? (
          <div
            className="menu mt-4 overflow-hidden rounded-3xl border border-line pb-4 lg:pb-0"
            style={r.accent ? ({ "--restaurant-accent": r.accent } as CSSProperties) : undefined}
          >
            <ItemExperience item={previewItem}>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.03em]">{i.name}</h3>
              <p className="mt-3 max-w-[48ch] leading-relaxed text-m-muted">{i.description}</p>
            </ItemExperience>
          </div>
        ) : (
          <p className="mt-4 rounded-3xl border border-dashed border-line p-8 text-center text-sm text-muted">
            Upload a GLB or USDZ model to see the preview.
          </p>
        )}
      </section>
    </>
  );
}
