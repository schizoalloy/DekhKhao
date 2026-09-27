/**
 * Typed access to every visual asset on the site.
 *
 * Edit `assets.manifest.json` to swap an asset, then run:
 *   node scripts/build-assets.mjs     (photos, textures, true-to-size models)
 *   node scripts/render-stills.mjs    (transparent stills of the models)
 *
 * PROTOTYPE: third-party photos and scans are placeholders for owned restaurant assets.
 */
import manifest from "./assets.manifest.json";
import generated from "./assets.generated.json";

export type Credit = { title: string; author: string; license: string; url: string };
export type Photo = { src: string; width: number; height: number; alt: string; credit: Credit };
export type Render = { src: string; width: number; height: number; model: ModelId };
export type Model = {
  glb: string;
  label: string;
  /** Real-world size the model is normalised to, e.g. "12 in". */
  realSize: string;
  /** Final bounding box of the prepared model, in centimetres. */
  sizeCm: { width: number; height: number; depth: number };
  credit: Credit;
};

type PhotoEntry = { file: string; alt: string; credit: Credit };
// Typed explicitly so the registry still works when the manifest has no photos.
const photoEntries = manifest.photos as Record<string, PhotoEntry>;
type PhotoId = keyof typeof manifest.photos;
type RenderId = keyof typeof manifest.renders;
type ModelId = keyof typeof manifest.models;

const dims = generated as Record<string, { width?: number; height?: number; widthCm?: number; heightCm?: number; depthCm?: number }>;
const url = (file: string) => `/${file}`;

export const photos = Object.fromEntries(
  Object.entries(photoEntries).map(([id, p]) => [
    id,
    { src: url(p.file), width: dims[`photos.${id}`]?.width ?? 1600, height: dims[`photos.${id}`]?.height ?? 1200, alt: p.alt, credit: p.credit },
  ]),
) as Record<PhotoId, Photo>;

export const renders = Object.fromEntries(
  Object.entries(manifest.renders).map(([id, r]) => [
    id,
    { src: url(r.file), width: dims[`renders.${id}`]?.width ?? r.size, height: dims[`renders.${id}`]?.height ?? r.size, model: r.model as ModelId },
  ]),
) as Record<RenderId, Render>;

function sizeLabel(s: { dimension: string; value?: number; unit?: string }, cm: { widthCm?: number; depthCm?: number }) {
  if (s.dimension === "asScanned") return `${Math.round(Math.max(cm.widthCm ?? 0, cm.depthCm ?? 0))} cm`;
  return `${s.value} ${s.unit}`;
}

export const models = Object.fromEntries(
  Object.entries(manifest.models).map(([id, m]) => {
    const d = dims[`models.${id}`] ?? {};
    return [
      id,
      {
        glb: url(m.file),
        label: m.label,
        realSize: sizeLabel(m.realSize, d),
        sizeCm: { width: d.widthCm ?? 0, height: d.heightCm ?? 0, depth: d.depthCm ?? 0 },
        credit: m.credit,
      },
    ];
  }),
) as Record<ModelId, Model>;

export const textures = {
  table: { src: url(manifest.textures.table.file), credit: manifest.textures.table.credit },
  environment: { src: url(manifest.textures.environment.file), credit: manifest.textures.environment.credit },
};

/** Everything that needs attribution, for the credits list in the footer. */
export const allCredits: Credit[] = [
  ...Object.values(photoEntries).map((p) => p.credit),
  ...Object.values(manifest.models).map((m) => m.credit),
  manifest.textures.table.credit,
  manifest.textures.environment.credit,
].filter((c, i, arr) => arr.findIndex((x) => x.title === c.title) === i);
