/**
 * `?loai=` của /bao-gia (REQ-19): chỉ nhận slug productGroup có thật trong CMS — không hard-code danh sách.
 * Giá trị lạ / rỗng / nhiều giá trị → undefined (form hiện bình thường, không chọn sẵn, không lỗi).
 */
export function parseLoai(raw: string | string[] | undefined, validSlugs: readonly string[]): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") return undefined;
  const slug = v.trim().toLowerCase();
  return validSlugs.includes(slug) ? slug : undefined;
}
