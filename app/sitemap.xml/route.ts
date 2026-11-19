import { buildSitemapIndex, SITEMAP_FILES, xmlResponse } from "@/lib/seo/sitemap";
import { SITE_URL } from "@/lib/site-url";

/** Sitemap index (T2.4): trỏ tệp con theo loại. */
export function GET() {
  return xmlResponse(buildSitemapIndex(SITEMAP_FILES, SITE_URL));
}
