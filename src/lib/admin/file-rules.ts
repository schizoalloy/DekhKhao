/**
 * What each upload slot accepts. Shared by the upload button (early, friendly checks) and the
 * server (the checks that count). Browsers often report an empty type for .glb and .usdz, so the
 * content type comes from the file extension, and the server then checks the file's first bytes.
 */
export type FileSlot = "glb" | "usdz" | "poster" | "thumbnail" | "logo";
export type AssetKind = "glb" | "usdz" | "image";

const MB = 1024 * 1024;
const IMAGE_TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" } as const;

export const SLOTS: Record<
  FileSlot,
  { kind: AssetKind; label: string; hint: string; types: Record<string, string>; maxBytes: number }
> = {
  glb: {
    kind: "glb",
    label: "3D model (GLB)",
    hint: "Turnable 3D in the browser and AR on Android.",
    types: { glb: "model/gltf-binary" },
    maxBytes: 50 * MB,
  },
  usdz: {
    kind: "usdz",
    label: "AR model for iPhone (USDZ)",
    hint: "AR Quick Look on iPhone and iPad. Optional when there's a GLB.",
    types: { usdz: "model/vnd.usdz+zip" },
    maxBytes: 50 * MB,
  },
  poster: {
    kind: "image",
    label: "Poster image",
    hint: "Shown while the model loads. Square, transparent WebP or PNG works best.",
    types: IMAGE_TYPES,
    maxBytes: 5 * MB,
  },
  thumbnail: {
    kind: "image",
    label: "Menu thumbnail",
    hint: "The picture on the menu card. Square, about 640 px.",
    types: IMAGE_TYPES,
    maxBytes: 5 * MB,
  },
  logo: {
    kind: "image",
    label: "Logo",
    hint: "Shown at about 40 px tall in the menu header.",
    types: IMAGE_TYPES,
    maxBytes: 5 * MB,
  },
};

export function fileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** Content type for a file in this slot, or null if the slot doesn't take that kind of file. */
export function contentTypeFor(slot: FileSlot, fileName: string): string | null {
  return SLOTS[slot].types[fileExtension(fileName)] ?? null;
}

export function acceptAttribute(slot: FileSlot) {
  return Object.keys(SLOTS[slot].types)
    .map((ext) => `.${ext}`)
    .join(",");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}
