import { ArrowLeft, ArrowSquareOut, Cube, CubeFocus, EyeSlash, Ruler } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { z } from "zod";
import { createCategory, createItem, deleteCategory, updateCategory, updateRestaurant } from "@/app/admin/actions/menu";
import { publishMenu, unpublishMenu } from "@/app/admin/actions/publish";
import { formatPrice } from "@/catalog/format";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { FileUpload } from "@/components/admin/FileUpload";
import { ui } from "@/components/admin/styles";
import { appUrl, catalogUrl } from "@/config/app";
import { requireAdmin } from "@/lib/admin/auth";

type Params = { params: Promise<{ restaurantId: string }> };

export const metadata: Metadata = { title: "Restaurant" };

const when = new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
const isLocal = (url: string) => /^https?:\/\/(localhost|127\.|10\.|192\.168\.)/.test(url);

export default async function RestaurantAdminPage({ params }: Params) {
  const { restaurantId } = await params;
  if (!z.uuid().safeParse(restaurantId).success) notFound();
  const { supabase } = await requireAdmin();

  const [restaurant, categories, items, assets, published] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", restaurantId).maybeSingle(),
    supabase.from("menu_categories").select("*").eq("restaurant_id", restaurantId).order("position").order("created_at"),
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId).order("position").order("created_at"),
    supabase.from("assets").select("id, original_filename, byte_size, status, public_key").eq("restaurant_id", restaurantId),
    supabase
      .from("published_menus")
      .select("published_at, version:snapshot->version")
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
  ]);
  if (restaurant.error || categories.error || items.error || assets.error)
    throw restaurant.error ?? categories.error ?? items.error ?? assets.error;
  if (!restaurant.data) notFound();

  const r = restaurant.data;
  const live = published.data;
  const asset = new Map(assets.data.map((a) => [a.id, a]));
  const ready = (assetId: string | null) => Boolean(assetId && asset.get(assetId)?.status === "ready");
  const lastEdit = Math.max(
    Date.parse(r.updated_at),
    ...categories.data.map((c) => Date.parse(c.updated_at)),
    ...items.data.map((i) => Date.parse(i.updated_at)),
  );
  const unpublishedChanges = live ? lastEdit > Date.parse(live.published_at) : false;

  const menuUrl = catalogUrl(r.slug);
  const qrSvg = await QRCode.toString(menuUrl, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1714", light: "#ffffff" },
  });
  const logo = r.logo_asset_id ? asset.get(r.logo_asset_id) : undefined;

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> All restaurants
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">{r.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted">/r/{r.slug}</p>
        </div>
        {live ? (
          <span className={`${ui.badge} bg-leaf/10 text-leaf`}>
            Live · v{String(live.version)} · {when.format(new Date(live.published_at))}
          </span>
        ) : (
          <span className={`${ui.badge} bg-ink/5 text-muted`}>Not published</span>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ---------- menu ---------- */}
        <section aria-labelledby="menu-heading" className="space-y-6">
          <h2 id="menu-heading" className="font-display text-xl font-semibold">
            Menu
          </h2>

          {categories.data.length === 0 && (
            <p className="rounded-3xl border border-dashed border-line p-6 text-sm text-muted">
              Start with a category, such as “Mains” or “BBQ”. Items go inside categories.
            </p>
          )}

          {categories.data.map((c) => {
            const inCategory = items.data.filter((i) => i.category_id === c.id);
            return (
              <div key={c.id} className={ui.card}>
                <ActionForm action={updateCategory} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={c.id} />
                  <div className="min-w-48 flex-1">
                    <label className={ui.label} htmlFor={`cat-${c.id}`}>
                      Category
                    </label>
                    <input id={`cat-${c.id}`} name="name" defaultValue={c.name} required maxLength={80} className={ui.input} />
                  </div>
                  <div className="w-20">
                    <label className={ui.label} htmlFor={`pos-${c.id}`}>
                      Order
                    </label>
                    <input id={`pos-${c.id}`} name="position" type="number" defaultValue={c.position} className={ui.input} />
                  </div>
                  <label className="flex min-h-10 items-center gap-2 text-sm">
                    <input type="checkbox" name="is_visible" defaultChecked={c.is_visible} className={ui.check} /> Visible
                  </label>
                  <SubmitButton variant="secondary">Save</SubmitButton>
                </ActionForm>

                {inCategory.length > 0 ? (
                  <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
                    {inCategory.map((i) => (
                      <li key={i.id}>
                        <Link
                          href={`/admin/restaurants/${r.id}/items/${i.id}`}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-paper/60"
                        >
                          <span className="min-w-0">
                            <span className="block font-medium">{i.name}</span>
                            <span className="block font-mono text-xs text-muted">/{i.slug}</span>
                          </span>
                          <span className="flex flex-wrap items-center gap-1.5 text-xs">
                            {i.price != null && <span className={`${ui.badge} bg-ink/5`}>{formatPrice({ amount: i.price, currency: i.currency })}</span>}
                            {ready(i.glb_asset_id) && (
                              <span className={`${ui.badge} bg-ink/5`}>
                                <Cube size={12} aria-hidden /> 3D
                              </span>
                            )}
                            {(ready(i.glb_asset_id) || ready(i.usdz_asset_id)) && (
                              <span className={`${ui.badge} bg-ink/5`}>
                                <CubeFocus size={12} aria-hidden /> AR
                              </span>
                            )}
                            {!ready(i.glb_asset_id) && !ready(i.usdz_asset_id) && (
                              <span className={`${ui.badge} bg-saffron/20`}>No model yet</span>
                            )}
                            {(i.width_cm == null || i.height_cm == null || i.depth_cm == null) && (
                              <span className={`${ui.badge} bg-saffron/20`}>
                                <Ruler size={12} aria-hidden /> No size
                              </span>
                            )}
                            {!i.is_visible && (
                              <span className={`${ui.badge} bg-ink/5 text-muted`}>
                                <EyeSlash size={12} aria-hidden /> Hidden
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ActionForm action={deleteCategory} className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted">No items in this category.</p>
                    <input type="hidden" name="id" value={c.id} />
                    <SubmitButton variant="danger" confirm={`Delete the “${c.name}” category?`}>
                      Delete category
                    </SubmitButton>
                  </ActionForm>
                )}
              </div>
            );
          })}

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionForm action={createCategory} className={ui.card}>
              <input type="hidden" name="restaurant_id" value={r.id} />
              <label className={ui.label} htmlFor="new-category">
                New category
              </label>
              <input id="new-category" name="name" required maxLength={80} className={ui.input} placeholder="e.g. BBQ" />
              <SubmitButton variant="secondary" className="mt-3">
                Add category
              </SubmitButton>
            </ActionForm>

            {categories.data.length > 0 && (
              <ActionForm action={createItem} className={ui.card}>
                <input type="hidden" name="restaurant_id" value={r.id} />
                <label className={ui.label} htmlFor="new-item">
                  New item
                </label>
                <input id="new-item" name="name" required maxLength={120} className={ui.input} placeholder="e.g. Chicken Karahi" />
                <select name="category_id" aria-label="Category" className={ui.input} defaultValue={categories.data[0]?.id}>
                  {categories.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <SubmitButton variant="secondary" className="mt-3">
                  Add item
                </SubmitButton>
              </ActionForm>
            )}
          </div>
        </section>

        {/* ---------- sidebar ---------- */}
        <aside className="space-y-6">
          <section aria-labelledby="publish-heading" className={ui.card}>
            <h2 id="publish-heading" className="font-display text-xl font-semibold">
              Publishing
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {live
                ? unpublishedChanges
                  ? "You have changes that customers can't see yet."
                  : "Customers see the latest version."
                : "Customers can't see this menu yet. Publishing checks every visible item first."}
            </p>
            <ActionForm action={publishMenu} className="mt-4">
              <input type="hidden" name="restaurantId" value={r.id} />
              <SubmitButton>{live ? "Publish changes" : "Publish menu"}</SubmitButton>
            </ActionForm>
            {live && (
              <div className="mt-5 space-y-3 border-t border-line pt-4">
                <a href={`/r/${r.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
                  Open the live menu <ArrowSquareOut size={14} aria-hidden />
                </a>
                <ActionForm action={unpublishMenu}>
                  <input type="hidden" name="restaurantId" value={r.id} />
                  <SubmitButton
                    variant="danger"
                    confirm="Take this menu offline? Its QR code will show “We couldn’t find this menu” until you publish again."
                  >
                    Unpublish
                  </SubmitButton>
                </ActionForm>
              </div>
            )}
          </section>

          <section aria-labelledby="qr-heading" className={ui.card}>
            <h2 id="qr-heading" className="font-display text-xl font-semibold">
              Table QR code
            </h2>
            {/* Markup generated by the qrcode library from our own URL. */}
            <div className="mx-auto mt-4 w-44 rounded-xl bg-white p-1 [&_svg]:size-full" role="img" aria-label={`QR code for ${menuUrl}`} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className="mt-3 break-all text-center font-mono text-xs text-muted">{menuUrl}</p>
            {isLocal(appUrl) && (
              <p className="mt-3 rounded-2xl bg-chilli/10 p-3 text-xs text-chilli-deep">
                Development build: this code points at this computer. Don&apos;t print it.
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              {live ? (
                <a href={`/qr/${r.slug}`} target="_blank" rel="noreferrer" className="font-medium text-ink underline underline-offset-4">
                  Printable card and PNG
                </a>
              ) : (
                "The printable card is available once the menu is published."
              )}
            </p>
          </section>

          <section aria-labelledby="settings-heading" className={ui.card}>
            <h2 id="settings-heading" className="font-display text-xl font-semibold">
              Settings
            </h2>
            <ActionForm action={updateRestaurant} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={r.id} />
              <div>
                <label className={ui.label} htmlFor="r-name">
                  Name
                </label>
                <input id="r-name" name="name" defaultValue={r.name} required maxLength={120} className={ui.input} />
              </div>
              <div>
                <label className={ui.label} htmlFor="r-title">
                  Menu heading
                </label>
                <input id="r-title" name="catalog_title" defaultValue={r.catalog_title} required maxLength={60} className={ui.input} />
              </div>
              <div>
                <label className={ui.label} htmlFor="r-accent">
                  Accent colour
                </label>
                <input id="r-accent" name="accent" defaultValue={r.accent ?? ""} placeholder="#c2410c" pattern="#[0-9a-fA-F]{6}" className={`${ui.input} font-mono`} />
                <p className={ui.hint}>Used for small highlights only. Leave empty for the default.</p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="indexable" defaultChecked={r.indexable} className={`${ui.check} mt-0.5`} />
                <span>Let search engines list this menu</span>
              </label>
              <SubmitButton variant="secondary">Save settings</SubmitButton>
            </ActionForm>
          </section>

          <FileUpload
            restaurantId={r.id}
            itemId={null}
            slot="logo"
            current={logo ? { fileName: logo.original_filename, size: logo.byte_size, isPublic: Boolean(logo.public_key) } : null}
          />
        </aside>
      </div>
    </>
  );
}
