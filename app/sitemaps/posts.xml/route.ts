import { POSTS_ENABLED } from "@/content/routes";
import { getPosts } from "@/lib/content";
import { buildUrlset, postEntries, xmlResponse } from "@/lib/seo/sitemap";
import { SITE_URL } from "@/lib/site-url";

/** Bài viết: đọc qua cửa nội dung (cache tag "post") → webhook publish bài làm mới tệp này (KT-03). */
export async function GET() {
  const posts = POSTS_ENABLED ? await getPosts() : [];
  return xmlResponse(buildUrlset(postEntries(posts, SITE_URL), SITE_URL));
}
