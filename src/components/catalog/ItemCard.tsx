import { ArrowRight, Cube, CubeFocus } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "@/catalog/types";
import { itemPath } from "@/config/app";

type ItemCardProps = {
  restaurantSlug: string;
  item: CatalogItem;
  /** A lone item gets a wider, side-by-side layout so the menu doesn't look empty. */
  featured?: boolean;
  priority?: boolean;
};

/**
 * One menu entry. Only the lightweight thumbnail loads here; the 3D model is fetched
 * on the item page, never while browsing the list.
 */
export function ItemCard({ restaurantSlug, item, featured = false, priority = false }: ItemCardProps) {
  const has3D = Boolean(item.model.glb);
  const hasAR = Boolean(item.model.glb || item.model.usdz);
  return (
    <Link
      href={itemPath(restaurantSlug, item.slug)}
      className={`group block rounded-3xl outline-offset-4 transition-transform duration-300 active:scale-[0.99] ${
        featured ? "sm:grid sm:grid-cols-[1.1fr_1fr] sm:items-center sm:gap-8" : ""
      }`}
    >
      <div className="menu-stage relative aspect-square overflow-hidden rounded-3xl">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={`${item.name}, 3D preview`}
            fill
            priority={priority}
            sizes={featured ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 768px) 30vw, 50vw"}
            className="object-contain p-[6%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-m-muted">
            <Cube size={40} weight="light" aria-hidden />
          </div>
        )}
      </div>

      <div className={featured ? "mt-4 sm:mt-0" : "mt-3"}>
        <h3 className={`font-display font-semibold tracking-[-0.02em] ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
          {item.name}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-m-muted">{item.description}</p>

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-m-muted">
          {has3D && (
            <span className="inline-flex items-center gap-1">
              <Cube size={14} aria-hidden /> 3D
            </span>
          )}
          {hasAR && (
            <span className="inline-flex items-center gap-1">
              <CubeFocus size={14} aria-hidden /> AR
            </span>
          )}
        </p>

        <span
          className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full font-medium transition-colors ${
            featured
              ? "bg-m-button px-5 text-sm text-m-button-text"
              : "text-sm text-m-text underline decoration-m-line underline-offset-4 group-hover:decoration-current"
          }`}
        >
          {has3D ? "View in 3D" : "View item"}
          <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
