import { SITE_ROUTES } from "@/content/routes";
import { buildUrlset, pageEntries, xmlResponse } from "@/lib/seo/sitemap";
import { SITE_URL } from "@/lib/site-url";

/** Trang tĩnh đang bật (cờ trung tâm content/routes.ts). Không có ngày sửa đáng tin → bỏ lastmod. */
export function GET() {
  return xmlResponse(buildUrlset(pageEntries(SITE_ROUTES), SITE_URL));
}
