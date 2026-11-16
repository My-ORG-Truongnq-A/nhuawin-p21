/**
 * Sitemap index + tệp con theo loại (T2.4, SEO-06). Sinh từ dữ liệu; chỉ URL canonical index được.
 * lastmod lấy ngày sửa thật; trang tĩnh không có ngày đáng tin thì bỏ trống (không dùng new Date()).
 */
import type { PostSummary } from "@/lib/content/types";
import type { SiteRoute } from "@/content/routes";
import { absoluteUrl } from "@/lib/site-url";

export type SitemapEntry = { path: string; lastmod?: string; images?: string[] };

const EXCLUDED = [/^\/studio(\/|$)/, /^\/api\//];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const encodePath = (path: string) => encodeURI(decodeURI(path));

export function buildUrlset(entries: SitemapEntry[], siteUrl: string): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const e of entries) {
    if (e.path.includes("?") || EXCLUDED.some((re) => re.test(e.path)) || seen.has(e.path)) continue;
    seen.add(e.path);
    const parts = [`<loc>${xmlEscape(absoluteUrl(encodePath(e.path), siteUrl))}</loc>`];
    if (e.lastmod) parts.push(`<lastmod>${xmlEscape(e.lastmod)}</lastmod>`);
    for (const img of e.images ?? []) parts.push(`<image:image><image:loc>${xmlEscape(img)}</image:loc></image:image>`);
    urls.push(`<url>${parts.join("")}</url>`);
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls.join("\n") +
    `\n</urlset>\n`
  );
}

export function buildSitemapIndex(paths: string[], siteUrl: string): string {
  const items = paths.map((p) => `<sitemap><loc>${xmlEscape(absoluteUrl(p, siteUrl))}</loc></sitemap>`);
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    items.join("\n") +
    `\n</sitemapindex>\n`
  );
}

export function pageEntries(routes: SiteRoute[]): SitemapEntry[] {
  return routes.filter((r) => r.enabled && !r.noindex).map((r) => ({ path: r.path }));
}

export function postEntries(posts: PostSummary[], siteUrl: string): SitemapEntry[] {
  return posts
    .filter((p) => !p.noindex)
    .map((p) => {
      const lastmod = p.updatedAt ?? p.publishedAt;
      return {
        path: `/tin-tuc/${p.slug}`,
        ...(lastmod ? { lastmod } : {}),
        images: p.image ? [absoluteUrl(p.image.url, siteUrl)] : [],
      };
    });
}

export const SITEMAP_FILES = ["/sitemaps/pages.xml", "/sitemaps/posts.xml"];

export function xmlResponse(body: string): Response {
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
