import { POSTS_ENABLED, SITE_ROUTES } from "@/content/routes";
import { getPosts, getSiteSettings } from "@/lib/content";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { SITE_URL } from "@/lib/site-url";

/** /llms.txt sinh từ CMS (cache tag siteSettings + post → webhook làm mới, KT-03). */
export async function GET() {
  const [settings, posts] = await Promise.all([getSiteSettings(), POSTS_ENABLED ? getPosts() : []]);
  const body = buildLlmsTxt({ settings, siteUrl: SITE_URL, routes: SITE_ROUTES, posts });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
