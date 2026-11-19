/**
 * Ánh xạ payload webhook Sanity → tag / path cần làm mới (T3.7, KT-02; content_model revalidation.tags).
 * Tag = `_type`; bỏ qua draft, asset và loại không có trong CONTENT_TYPES (vd lead — không tồn tại).
 */
import { PAGE_PATHS, type PageType } from "@/lib/content/doc-paths";
import { CONTENT_TYPES, type ContentType } from "@/lib/content/tags";

export type WebhookBody = { _type?: string; _id?: string; slug?: { current?: string } | null };

const isContentType = (t: string): t is ContentType => (CONTENT_TYPES as readonly string[]).includes(t);

/** Route phải làm mới thêm theo loại (ngoài tag). siteSettings / header / footer / leadForms: tag là đủ. */
const EXTRA_PATHS: Partial<Record<ContentType, string[]>> = {
  productGroup: ["/", "/san-pham", "/bao-gia"],
  application: ["/", "/san-pham"],
  category: ["/tin-tuc"],
  post: ["/", "/tin-tuc"],
};

export function planRevalidation(body: WebhookBody): { tags: string[]; paths: string[] } | null {
  const type = body._type;
  if (!type || !isContentType(type)) return null;
  if (body._id?.startsWith("drafts.")) return null;

  const paths = [...(EXTRA_PATHS[type] ?? [])];
  if (type in PAGE_PATHS) paths.push(PAGE_PATHS[type as PageType]);
  if (type === "post" && body.slug?.current) paths.push(`/tin-tuc/${body.slug.current}`);
  return { tags: [type], paths };
}
