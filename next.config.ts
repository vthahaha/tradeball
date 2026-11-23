import type { NextConfig } from "next";

// Cache Components is off on purpose: almost every page in TradeBall is
// per-user (packs, collection), so plain dynamic rendering is simpler.
const nextConfig: NextConfig = {
  // The dev-mode "N" badge sits over the phone tab bar; keep it out of the way.
  devIndicators: false,
  // Card images in public/. Vercel's CDN refreshes them on every deploy; these say how long a
  // browser may keep its own copy. Headshots and logos are named by player/team id and only change
  // when a season is re-shot (scripts/photos.mjs --force), so a month. Insert art is sometimes
  // replaced under the same name, so a day, served from cache while it revalidates.
  async headers() {
    const cache = (value: string) => [{ key: "Cache-Control", value }];
    return [
      { source: "/players/:path*", headers: cache("public, max-age=2592000, stale-while-revalidate=604800") },
      { source: "/logos/:path*", headers: cache("public, max-age=2592000, stale-while-revalidate=604800") },
      { source: "/inserts/:path*", headers: cache("public, max-age=86400, stale-while-revalidate=2592000") },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
