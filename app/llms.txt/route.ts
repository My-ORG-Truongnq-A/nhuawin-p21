import { POSTS_ENABLED, publishedRoutes } from "@/content/routes";
import { getPosts, getPrivacyPage, getSiteSettings } from "@/lib/content";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { SITE_URL } from "@/lib/site-url";

/** /llms.txt sinh từ CMS (cache tag siteSettings + post → webhook làm mới, KT-03). */
export async function GET() {
  const [settings, posts, privacy] = await Promise.all([getSiteSettings(), POSTS_ENABLED ? getPosts() : [], getPrivacyPage()]);
  const body = buildLlmsTxt({ settings, siteUrl: SITE_URL, routes: publishedRoutes(privacy !== null), posts });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
