/**
 * Tham số /tin-tuc (T4.6, REQ-11, seo_plan blog_topic_and_pagination):
 * - ?chu-de={slug category} (giữ của web cũ), ?trang={n} (n ≥ 2).
 * - Canonical tự trỏ về URL chuẩn hoá: chỉ giữ chu-de rồi trang; bỏ utm_* / tham số lạ; trang=1 bỏ.
 * - Có chủ đề hoặc trang ≥ 2 → "noindex, follow"; trang vượt số trang / không phải số → notFound.
 */
export type SearchParams = Record<string, string | string[] | undefined>;

export type NewsQuery = {
  topic?: string;
  page: number;
  canonicalPath: string;
  noindex: boolean;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim();

export function parseNewsParams(sp: SearchParams, topicSlugs: readonly string[]): NewsQuery | "not-found" {
  const rawTopic = first(sp["chu-de"]);
  const topic = rawTopic && topicSlugs.includes(rawTopic) ? rawTopic : undefined;
  // Chủ đề không tồn tại: hiện tất cả bài (không 404 — giữ URL cũ chia sẻ ngoài), canonical bỏ tham số.
  const rawPage = first(sp.trang);
  let page = 1;
  if (rawPage !== undefined && rawPage !== "") {
    if (!/^\d+$/.test(rawPage) || Number(rawPage) < 1) return "not-found";
    page = Number(rawPage);
  }
  return { topic, page, canonicalPath: newsHref(topic, page), noindex: Boolean(topic) || page > 1 };
}

/** URL chuẩn của một trang danh sách. */
export function newsHref(topic: string | undefined, page = 1): string {
  const q = new URLSearchParams();
  if (topic) q.set("chu-de", topic);
  if (page > 1) q.set("trang", String(page));
  const s = q.toString();
  return s ? `/tin-tuc?${s}` : "/tin-tuc";
}

export function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; totalPages: number } | "not-found" {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  if (page > totalPages) return "not-found";
  return { items: items.slice((page - 1) * perPage, page * perPage), totalPages };
}
