import type { NextConfig } from "next";

// Published menu images (thumbnails, posters, logos) come from the public-assets bucket. Only that
// host, only uploaded files, and no query strings, so the image optimizer can't be used as a proxy.
const assetsHost = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ? new URL(process.env.NEXT_PUBLIC_ASSETS_BASE_URL).hostname : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: assetsHost ? [{ protocol: "https", hostname: assetsHost, pathname: "/restaurants/**", search: "" }] : [],
  },
  async headers() {
    return [
      {
        // AR Quick Look (iPhone/iPad) expects USDZ files with this media type.
        source: "/:path(.*\\.usdz)",
        headers: [{ key: "Content-Type", value: "model/vnd.usdz+zip" }],
      },
      {
        source: "/:path(.*\\.glb)",
        headers: [{ key: "Content-Type", value: "model/gltf-binary" }],
      },
    ];
  },
};

export default nextConfig;
