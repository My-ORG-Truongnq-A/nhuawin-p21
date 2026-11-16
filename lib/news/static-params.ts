/**
 * Tham số dựng sẵn cho /tin-tuc/[slug] (BUILD-EMPTY-CMS).
 * Với cacheComponents, generateStaticParams phải trả ≥ 1 kết quả — dataset trống (chưa nạp nội dung)
 * làm build vỡ. Khi đó trả một slug giữ chỗ cố định; trang / generateMetadata coi nó là 404 (noindex)
 * mà không đọc CMS. Slug này chỉ sinh ở đây nên không vào sitemap / llms.txt / danh sách / liên kết.
 */
export const PLACEHOLDER_POST_SLUG = "_chua-co-bai";

export const isPlaceholderPostSlug = (slug: string) => slug === PLACEHOLDER_POST_SLUG;

export function postStaticParams(posts: readonly { slug: string }[]): { slug: string }[] {
  const params = posts.filter((p) => !isPlaceholderPostSlug(p.slug)).map((p) => ({ slug: p.slug }));
  return params.length ? params : [{ slug: PLACEHOLDER_POST_SLUG }];
}
