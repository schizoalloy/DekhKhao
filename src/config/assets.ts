/**
 * Public address of the published-assets bucket (dekhkhao-public). Published menus store file
 * keys, not URLs, so this can move to a custom domain without republishing anything.
 */
export const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.replace(/\/+$/, "") || null;

export function publicAssetUrl(key: string): string {
  if (!assetsBaseUrl)
    throw new Error("NEXT_PUBLIC_ASSETS_BASE_URL is not set, so published files can't be linked. See .env.example.");
  return `${assetsBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
