import type { NextConfig } from "next";

// Cache Components is off on purpose: almost every page in TradeBall is
// per-user (packs, collection), so plain dynamic rendering is simpler.
const nextConfig: NextConfig = {
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
