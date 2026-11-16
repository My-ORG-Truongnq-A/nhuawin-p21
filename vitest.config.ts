import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@/": root,
      // `server-only` ném lỗi ngoài React Server; trong test thay bằng module rỗng.
      "server-only": `${root}tests/setup/server-only.ts`,
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "tests/e2e/**"],
    // Rào: mọi fetch tới *.sanity.io trong test → lỗi ngay (Sanity gói Free).
    setupFiles: ["tests/setup/no-network.ts"],
    env: {
      SANITY_SOURCE: "seed",
      NEXT_PUBLIC_SITE_URL: "https://nhuawin-p21.vercel.app",
    },
  },
});
