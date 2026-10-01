import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
