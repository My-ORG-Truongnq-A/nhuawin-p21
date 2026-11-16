import type { NextConfig } from "next";
import { indexingAllowed } from "./lib/indexing";
import { buildHeaders } from "./lib/security-headers";
import { SITE_HOST } from "./lib/site-url";

// Env đọc lúc build: đổi ALLOW_INDEXING / NEXT_PUBLIC_* phải redeploy (GL-03).
const indexable = indexingAllowed();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // URL web cũ không có "/" cuối (seo_plan hostPolicy).
  trailingSlash: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return buildHeaders({ indexable, canonicalHost: SITE_HOST });
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
