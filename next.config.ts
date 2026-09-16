import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (dev-only in-memory db) loads WASM from disk; don't bundle it.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
