import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { AI_CRAWLERS, type CrawlerGroup } from "./ai-crawlers";

/** Đường không cho crawl ở mọi nhóm (GEO-01: khối riêng phải lặp lại disallow của '*'). */
const PRIVATE_PATHS = ["/studio", "/api/"];

/**
 * robots.txt hai chế độ (T2.3, SEO-01 lớp 1):
 * - không được index (preview, domain tạm, cờ tắt) → chỉ `User-agent: *` / `Disallow: /`, không Sitemap;
 * - được index → nhóm '*' + nhóm crawler AI theo cấu hình, dòng Sitemap tuyệt đối.
 */
export function buildRobots(opts: {
  indexable: boolean;
  siteUrl: string;
  crawlers?: CrawlerGroup[];
}): MetadataRoute.Robots {
  if (!opts.indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };

  const groups = (opts.crawlers ?? AI_CRAWLERS).map((g) =>
    g.allow ? { userAgent: g.agents, allow: "/", disallow: PRIVATE_PATHS } : { userAgent: g.agents, disallow: "/" },
  );
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }, ...groups],
    sitemap: absoluteUrl("/sitemap.xml", opts.siteUrl),
  };
}
