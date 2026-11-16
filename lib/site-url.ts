/**
 * Nguồn DUY NHẤT của host website (SEO-02). Canonical, og:url, og:image, sitemap,
 * robots `Sitemap:`, JSON-LD, llms.txt đều đi qua `SITE_URL` / `absoluteUrl()`.
 * Không đọc `process.env.NEXT_PUBLIC_SITE_URL` ở nơi khác.
 *
 * Module không import gì để `next.config.ts` dùng được.
 */

const DEV_FALLBACK = "http://localhost:3000";

export function parseSiteUrl(raw: string | undefined, opts: { production: boolean }): string {
  const value = raw?.trim();
  if (!value) {
    if (opts.production) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL chưa đặt. Production phải có host cuối trả 200 (vd https://www.ten-mien.vn).",
      );
    }
    return DEV_FALLBACK;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL không phải URL hợp lệ: "${value}".`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`NEXT_PUBLIC_SITE_URL phải là http(s): "${value}".`);
  }
  if (value.endsWith("/") || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL chỉ gồm origin, không có "/" cuối, path, query: "${value}" → dùng "${url.origin}".`,
    );
  }
  return url.origin;
}

export const SITE_URL = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, {
  production: process.env.NODE_ENV === "production",
});

export const SITE_HOST = new URL(SITE_URL).host;

/** URL tuyệt đối từ path; trang chủ không có "/" cuối, path khác bỏ "/" cuối. */
export function absoluteUrl(path = "/", base: string = SITE_URL): string {
  if (/^https?:\/\//i.test(path)) return path;
  const [pathname, query] = splitQuery(path);
  const clean = `/${pathname.replace(/^\/+/, "")}`.replace(/\/+$/, "");
  return `${base}${clean}${query ? `?${query}` : ""}`;
}

function splitQuery(path: string): [string, string] {
  const i = path.indexOf("?");
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i + 1)];
}
