import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Absolute path to this project (folder containing next.config.ts). Fixes Tailwind/PostCSS resolution when a parent folder has package.json or extra lockfiles. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function safeHostnameFromUrl(raw?: string) {
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["hugeicons-react"],
  },
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname:
          safeHostnameFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
          "placeholder.invalid",
      },
    ],
    qualities: [75, 82],
    unoptimized: false, // Keep optimization enabled
    // Keep optimized variants around longer in Vercel cache (local /assets only).
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
