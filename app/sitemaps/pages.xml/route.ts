import { publishedRoutes } from "@/content/routes";
import { getPrivacyPage } from "@/lib/content";
import { buildUrlset, pageEntries, xmlResponse } from "@/lib/seo/sitemap";
import { SITE_URL } from "@/lib/site-url";

/** Trang tĩnh đang bật (cờ trung tâm content/routes.ts). Không có ngày sửa đáng tin → bỏ lastmod. */
export async function GET() {
  const privacy = await getPrivacyPage();
  return xmlResponse(buildUrlset(pageEntries(publishedRoutes(privacy !== null)), SITE_URL));
}
