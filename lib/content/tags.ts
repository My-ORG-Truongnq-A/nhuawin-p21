import type { ContentKey } from "./types";

/**
 * Tag cache theo LOẠI nội dung (KT-02) — không dùng một tag chung cho cả site.
 * Webhook `/api/revalidate` ánh xạ `_type` Sanity → tag ở đây.
 */
export const CONTENT_TAGS: Record<ContentKey, string> = {
  siteSettings: "siteSettings",
  header: "header",
  footer: "footer",
  homePage: "homePage",
  notFoundPage: "notFoundPage",
  posts: "post",
};

/** `_type` Sanity mà webhook xử lý. PHẢI khớp schema (test ở lib/sanity/revalidate.test.ts). */
export const CONTENT_TYPES = ["siteSettings", "header", "footer", "homePage", "notFoundPage", "post"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
