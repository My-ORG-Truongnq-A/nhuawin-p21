/**
 * Indexing guard (SEO-01, REQ-12, Q-25). Không import gì để `next.config.ts` dùng được.
 *
 * Chỉ cho index khi ĐỦ cả bốn điều kiện:
 *  1. VERCEL_ENV === "production" (preview / development / chạy ngoài Vercel → không);
 *  2. ALLOW_INDEXING là "1" hoặc "true";
 *  3. host chuẩn (NEXT_PUBLIC_SITE_URL) hợp lệ và KHÔNG phải *.vercel.app;
 *  4. nếu biết host của request: host đó trùng host chuẩn.
 * Không đủ → robots.txt `Disallow: /` + header `X-Robots-Tag: noindex, nofollow`.
 */

export type IndexingEnv = {
  VERCEL_ENV?: string;
  ALLOW_INDEXING?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

const TRUTHY = new Set(["1", "true"]);

export function canonicalHostOf(siteUrl: string | undefined): string | null {
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).host;
  } catch {
    return null;
  }
}

export function indexingAllowed(
  env: IndexingEnv = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    ALLOW_INDEXING: process.env.ALLOW_INDEXING,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  host?: string,
): boolean {
  if (env.VERCEL_ENV !== "production") return false;
  if (!TRUTHY.has((env.ALLOW_INDEXING ?? "").trim().toLowerCase())) return false;
  const canonicalHost = canonicalHostOf(env.NEXT_PUBLIC_SITE_URL);
  if (!canonicalHost || canonicalHost.endsWith(".vercel.app")) return false;
  return !host || host.toLowerCase() === canonicalHost;
}
