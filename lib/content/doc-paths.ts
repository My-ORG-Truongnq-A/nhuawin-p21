/**
 * Một nguồn cho "tài liệu Sanity nào nằm ở URL nào" (sitemap.json, legacy_url_map.json nonSitemapUrls).
 * Dùng cho: đích của object `link` (reference), GROQ dựng href, revalidate theo path.
 * Không phụ thuộc Next / Sanity — Studio và server cùng import được.
 */

/** Singleton trang → route cố định. */
export const PAGE_PATHS = {
  homePage: "/",
  productsPage: "/san-pham",
  quotePage: "/bao-gia",
  aboutPage: "/ve-win",
  partnershipPage: "/hop-tac",
  newsPage: "/tin-tuc",
  contactPage: "/lien-he",
  privacyPage: "/chinh-sach-bao-mat",
} as const;

export type PageType = keyof typeof PAGE_PATHS;
export const PAGE_TYPES = Object.keys(PAGE_PATHS) as PageType[];

/**
 * Tài liệu có slug → URL. `{slug}` thay bằng slug.current.
 * - post: trang riêng /tin-tuc/{slug} (giữ URL cũ, REQ-01).
 * - category: trang lọc cũ /tin-tuc?chu-de={slug} (giữ tham số cũ).
 * - productGroup / application: anchor trên /san-pham (REQ-18).
 */
export const SLUG_PATHS = {
  post: "/tin-tuc/{slug}",
  category: "/tin-tuc?chu-de={slug}",
  productGroup: "/san-pham#{slug}",
  application: "/san-pham#ung-dung-{slug}",
} as const;

export type SlugDocType = keyof typeof SLUG_PATHS;

/** Loại tài liệu mà object `link` được phép trỏ tới (content_model objects.link.internal.to). */
export const LINKABLE_TYPES = [...PAGE_TYPES, ...(Object.keys(SLUG_PATHS) as SlugDocType[])];

export function pathOf(type: string, slug?: string): string | undefined {
  if (type in PAGE_PATHS) return PAGE_PATHS[type as PageType];
  const tpl = SLUG_PATHS[type as SlugDocType];
  return tpl && slug ? tpl.replace("{slug}", slug) : undefined;
}

/**
 * Biểu thức GROQ trả href của một reference đã dereference (`@` là tài liệu đích).
 * Sinh từ cùng bảng trên → không lệch giữa GROQ và code.
 */
export function groqPathOf(ref: string): string {
  const pages = Object.entries(PAGE_PATHS).map(([t, p]) => `${ref}->_type == "${t}" => "${p}"`);
  const slugs = Object.entries(SLUG_PATHS).map(([t, tpl]) => {
    const [before, after] = tpl.split("{slug}");
    return `${ref}->_type == "${t}" => "${before}" + ${ref}->slug.current${after ? ` + "${after}"` : ""}`;
  });
  return `select(${[...pages, ...slugs].join(", ")})`;
}
