import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project sits under a parent folder that also contains a package-lock,
  // so Turbopack's root inference walks too far up and warns. Pinning it keeps
  // module resolution scoped to this app.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  images: {
    // The brand assets and portraits are all local PNGs with transparency;
    // AVIF/WebP conversion is handled by the built-in optimizer.
    formats: ["image/avif", "image/webp"],
    // Next 16 rejects any `quality` prop not listed here. The particle artwork
    // bands visibly at 75, so 80 is allowed alongside the default.
    qualities: [75, 80],
    // Founder portraits uploaded via /admin live in Supabase Storage, not in
    // this repo's public/ folder, so the optimizer needs the project's host
    // allow-listed to fetch and resize them.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  poweredByHeader: false,
};

export default nextConfig;
