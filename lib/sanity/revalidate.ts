/**
 * Ánh xạ payload webhook Sanity → tag / path cần làm mới (T3.7, KT-02).
 * Tag theo LOẠI nội dung; bỏ qua draft, asset, lead và loại không có trong CONTENT_TYPES.
 */
import { CONTENT_TAGS, CONTENT_TYPES, type ContentType } from "@/lib/content/tags";

export type WebhookBody = { _type?: string; _id?: string; slug?: { current?: string } | null };

const TAG_OF: Record<ContentType, string> = {
  siteSettings: CONTENT_TAGS.siteSettings,
  header: CONTENT_TAGS.header,
  footer: CONTENT_TAGS.footer,
  homePage: CONTENT_TAGS.homePage,
  notFoundPage: CONTENT_TAGS.notFoundPage,
  post: CONTENT_TAGS.posts,
};

const isContentType = (t: string): t is ContentType => (CONTENT_TYPES as readonly string[]).includes(t);

export function planRevalidation(body: WebhookBody): { tags: string[]; paths: string[] } | null {
  const type = body._type;
  if (!type || !isContentType(type)) return null;
  if (body._id?.startsWith("drafts.")) return null;

  const paths: string[] = [];
  if (type === "homePage") paths.push("/");
  if (type === "post") {
    paths.push("/", "/tin-tuc");
    const slug = body.slug?.current;
    if (slug) paths.push(`/tin-tuc/${slug}`);
  }
  return { tags: [TAG_OF[type]], paths };
}
