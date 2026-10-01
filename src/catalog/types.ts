/**
 * Shape of a restaurant catalog. Records live as JSON in `src/catalog/restaurants/`
 * today; the same shape can come from a database later (see `data.ts`).
 */

/** A 3D model in one or both of the formats browsers and phones understand. */
export type ModelAsset = {
  /**
   * glTF binary. Drives the in-browser 3D viewer and Android AR (Scene Viewer / WebXR).
   * Omit it when only a USDZ exists: the item then shows its poster, and AR is offered on
   * iPhone/iPad only.
   */
  glb?: string;
  /** USDZ. Used for AR Quick Look on iPhone and iPad. */
  usdz?: string;
  /** Where the GLB came from, e.g. "converted from luffy.usdz". Shown nowhere; kept for audits. */
  glbProvenance?: string;
  /** Still image of the model shown while the viewer loads, and when 3D isn't possible. */
  poster?: string;
  /** Initial camera, in model-viewer's `camera-orbit` syntax, e.g. "20deg 75deg auto". */
  cameraOrbit?: string;
};

/**
 * Real-world size. The core promise is that AR shows the dish at its true size, so this
 * records where the size comes from and whether anyone has checked it.
 */
export type ModelScale = {
  /** Bounding box of the model as served, in centimetres. */
  dimensionsCm: { width: number; height: number; depth: number };
  /**
   * "file": size as authored in the model file (e.g. an Object Capture scan), not checked.
   * "measured": the model was scaled to the physical dish's measured size.
   */
  source: "file" | "measured";
  /** True only when someone has compared the model with the real item. */
  verified: boolean;
  /** Lock AR to the true size (true) or let customers pinch to resize (false). */
  lockScaleInAR: boolean;
};

export type CatalogItem = {
  /** URL segment, unique within the restaurant. Lowercase letters, numbers and hyphens. */
  slug: string;
  name: string;
  description: string;
  /** Category id, see `Restaurant.categories`. */
  category: string;
  /** Square thumbnail for the menu card. */
  thumbnail?: string;
  model: ModelAsset;
  scale: ModelScale;
  /** Marks test / placeholder items so the UI can say so. */
  isTestItem?: boolean;
};

export type Category = { id: string; name: string };

export type Restaurant = {
  /** URL segment: /r/<slug>. Stable once printed on a QR code. */
  slug: string;
  name: string;
  /** Heading above the item list, e.g. "Menu". */
  catalogTitle: string;
  /** Optional logo, path under /public. Square or wide, shown at ~40px height. */
  logo?: string;
  /** Optional brand accent (hex). Used for small highlights only, never for body text. */
  accent?: string;
  /** Whether search engines may index the catalog. Keep false for demos. */
  indexable: boolean;
  categories: Category[];
  items: CatalogItem[];
};
