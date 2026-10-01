import type { Metadata } from "next";
import Link from "next/link";
import { createRestaurant } from "@/app/admin/actions/menu";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ui } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Restaurants" };

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [restaurants, published] = await Promise.all([
    supabase.from("restaurants").select("id, slug, name, updated_at").order("name"),
    supabase.from("published_menus").select("restaurant_id, published_at, version:snapshot->version"),
  ]);
  if (restaurants.error) throw restaurants.error;
  const live = new Map((published.data ?? []).map((p) => [p.restaurant_id, p]));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="restaurants-heading">
        <h1 id="restaurants-heading" className="font-display text-3xl font-semibold tracking-[-0.03em]">
          Restaurants
        </h1>
        {restaurants.data.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-line p-8 text-center text-muted">
            No restaurants yet. Add the first one to start building its menu.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white/70">
            {restaurants.data.map((r) => {
              const p = live.get(r.id);
              return (
                <li key={r.id}>
                  <Link href={`/admin/restaurants/${r.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block font-mono text-xs text-muted">/r/{r.slug}</span>
                    </span>
                    {p ? (
                      <span className={`${ui.badge} bg-leaf/10 text-leaf`}>Live · v{String(p.version)}</span>
                    ) : (
                      <span className={`${ui.badge} bg-ink/5 text-muted`}>Not published</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="new-restaurant-heading" className={`${ui.card} self-start`}>
        <h2 id="new-restaurant-heading" className="font-display text-xl font-semibold">
          Add a restaurant
        </h2>
        <ActionForm action={createRestaurant} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className={ui.label}>
              Name
            </label>
            <input id="name" name="name" required maxLength={120} className={ui.input} />
          </div>
          <div>
            <label htmlFor="slug" className={ui.label}>
              Menu address
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-line bg-white pl-3 focus-within:border-ink">
              <span className="font-mono text-sm text-muted">/r/</span>
              <input
                id="slug"
                name="slug"
                maxLength={60}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="from the name"
                className="min-w-0 flex-1 rounded-xl bg-transparent px-1 py-2 font-mono text-sm outline-none"
                aria-describedby="slug-hint"
              />
            </div>
            <p id="slug-hint" className={ui.hint}>
              Lowercase letters, numbers and hyphens. Printed on QR codes, so it can&apos;t change later.
            </p>
          </div>
          <SubmitButton>Create restaurant</SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
