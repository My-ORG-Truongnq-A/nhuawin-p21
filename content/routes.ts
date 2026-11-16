/**
 * CỜ TRUNG TÂM cho route công khai (KT-10): ảnh hưởng đồng bộ sitemap, llms.txt và e2e.
 * Bật route khi template của nó đã dựng xong (P4). Menu đọc từ CMS (header) nên không phụ thuộc cờ này.
 * 7 trang chính của site cũ: /, /san-pham, /bao-gia, /ve-win, /hop-tac, /tin-tuc, /lien-he (+ bài /tin-tuc/[slug]).
 */
export type SiteRoute = {
  path: string;
  title: string;
  enabled: boolean;
  noindex?: boolean;
};

export const PRIVACY_PATH = "/chinh-sach-bao-mat";

export const SITE_ROUTES: SiteRoute[] = [
  { path: "/", title: "Trang chủ", enabled: true },
  { path: "/san-pham", title: "Sản phẩm", enabled: true }, // T4.2
  { path: "/bao-gia", title: "Nhận báo giá", enabled: true }, // T4.3
  { path: "/ve-win", title: "Về WIN", enabled: true }, // T4.4
  { path: "/hop-tac", title: "Hợp tác", enabled: true }, // T4.5
  { path: "/tin-tuc", title: "Tin tức", enabled: true }, // T4.6
  { path: "/lien-he", title: "Liên hệ", enabled: true }, // T4.8
  // T4.9 (REQ-21): template có; chỉ vào sitemap / llms.txt khi privacyPage đã publish (publishedRoutes).
  { path: PRIVACY_PATH, title: "Chính sách bảo mật", enabled: true },
];

/** Route chỉ sống khi singleton đã publish. */
export function publishedRoutes(privacyPublished: boolean): SiteRoute[] {
  return SITE_ROUTES.filter((r) => r.path !== PRIVACY_PATH || privacyPublished);
}

/** Bài viết có trang riêng chưa (T4.7). Tắt thì posts.xml / llms.txt không liệt kê bài. */
export const POSTS_ENABLED = true;
