import type { NextConfig } from "next";

// Cache Components is off on purpose: almost every page in TradeBall is
// per-user (packs, collection), so plain dynamic rendering is simpler.
const nextConfig: NextConfig = {
  // The dev-mode "N" badge sits over the phone tab bar; keep it out of the way.
  devIndicators: false,
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
