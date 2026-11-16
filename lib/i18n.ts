/**
 * Ngôn ngữ của site (SEO-16). Dự án chỉ có tiếng Việt: không tiền tố URL, không bộ chọn ngôn ngữ,
 * không hreflang; /en trả 404 (route catch-all). Thêm ngôn ngữ → theo skill i18n-content.
 */
export const LOCALES = ["vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";
export const HTML_LANG = "vi";
export const OG_LOCALE = "vi_VN";
