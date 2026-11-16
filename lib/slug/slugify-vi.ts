/**
 * Slug tiếng Việt không dấu (content_model conventions.slug, REQ-01).
 * Dùng chung cho Studio (nút "Tạo" slug) và script seed — không phụ thuộc Next / Sanity.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyVi(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const isValidSlug = (slug: string): boolean => SLUG_PATTERN.test(slug);
