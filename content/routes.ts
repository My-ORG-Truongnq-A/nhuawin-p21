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

export const SITE_ROUTES: SiteRoute[] = [
  { path: "/", title: "Trang chủ", enabled: true },
  { path: "/san-pham", title: "Sản phẩm", enabled: false }, // T4.2
  { path: "/bao-gia", title: "Nhận báo giá", enabled: false }, // T4.3
  { path: "/ve-win", title: "Về WIN", enabled: false }, // T4.4
  { path: "/hop-tac", title: "Hợp tác", enabled: false }, // T4.5
  { path: "/tin-tuc", title: "Tin tức", enabled: false }, // T4.6
  { path: "/lien-he", title: "Liên hệ", enabled: false }, // T4.8
  { path: "/chinh-sach-bao-mat", title: "Chính sách bảo mật", enabled: false }, // T4.9 (REQ-21)
];

/** Bài viết có trang riêng chưa (T4.7). Tắt thì posts.xml / llms.txt không liệt kê bài. */
export const POSTS_ENABLED = false;
