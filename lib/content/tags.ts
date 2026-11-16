import type { ContentKey } from "./types";

/**
 * `_type` Sanity mà webhook xử lý = 14 singleton + 4 document. PHẢI khớp schema
 * (test ở lib/sanity/revalidate.test.ts). Tag cache = chính tên `_type` (KT-02).
 */
export const CONTENT_TYPES = [
  "siteSettings",
  "header",
  "footer",
  "leadForms",
  "redirectSettings",
  "homePage",
  "productsPage",
  "quotePage",
  "aboutPage",
  "partnershipPage",
  "newsPage",
  "contactPage",
  "privacyPage",
  "notFoundPage",
  "productGroup",
  "application",
  "category",
  "post",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * Tag cache theo LOẠI nội dung (KT-02) — không dùng một tag chung cho cả site.
 * Một khoá đọc nhiều loại (vd link Gọi / Zalo lấy từ siteSettings, bài kèm tên chủ đề) thì gắn đủ tag
 * để publish loại phụ cũng làm mới khoá này.
 */
export const CONTENT_TAGS: Record<ContentKey, ContentType[]> = {
  siteSettings: ["siteSettings"],
  header: ["header", "siteSettings"],
  footer: ["footer", "siteSettings"],
  homePage: ["homePage", "siteSettings"],
  notFoundPage: ["notFoundPage", "siteSettings"],
  posts: ["post", "category"],
  productGroups: ["productGroup"],
  applications: ["application", "productGroup"],
  categories: ["category"],
};
