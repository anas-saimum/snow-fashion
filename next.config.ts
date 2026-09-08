import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `next dev` and `next start` cannot share a build directory — the dev
   * server overwrites the production build and the served output goes to
   * pieces. The e2e suite runs both at once (production storefront, dev admin),
   * so the dev one is pointed elsewhere via NEXT_DIST_DIR.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Demo imagery is served from /public/images. Product photography uploaded
    // through the admin lives in Supabase Storage, which is why that host is
    // allowed here; nothing else is.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320, 400],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
