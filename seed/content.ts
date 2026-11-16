/**
 * SEED dự phòng cho cửa nội dung (KT-01): dùng khi SANITY_SOURCE=seed, chưa có projectId,
 * hoặc Sanity lỗi. Không phải nguồn sự thật — nguồn sự thật là Sanity (siteSettings…).
 *
 * Nguồn dữ kiện: web cũ https://www.nhuawinvietnam.com.vn (JSON-LD LocalBusiness + footer,
 * đọc ngày 16/11/2026). Chờ khách xác nhận: nhãn 2 SĐT (OQ-CM-07), Fanpage (MI-16),
 * pháp nhân / MST (MI-15), logo gốc vector (MI-05, MI-25).
 *
 * Thư mục seed/ được loại khỏi check:hardcode; mã nguồn KHÔNG được chép các giá trị này.
 */
import type { ContentMap } from "@/lib/content/types";

export const SEED: ContentMap = {
  siteSettings: {
    brandName: "Nhựa WIN Việt Nam",
    legalName: "Công ty TNHH Nhựa WIN Việt Nam",
    slogan: "Fomex cho người Việt",
    description:
      "Tấm Fomex 3–18 ly sản xuất tại nhà máy WIN, Hà Nội. Cung ứng toàn quốc cho nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công.",
    schemaType: "LocalBusiness",
    logo: {
      url: "/images/brand/logo-win.png",
      width: 1440,
      height: 701,
      alt: "Logo Nhựa WIN Việt Nam — Nhà sản xuất tấm Fomex",
    },
    defaultOgImage: {
      url: "/images/brand/win-social-v2.png",
      width: 1200,
      height: 630,
      alt: "Nhựa WIN Việt Nam — Nhà sản xuất tấm Fomex",
    },
    address: {
      street: "Cụm công nghiệp Quất Động, xã Thượng Phúc",
      locality: "Hà Nội",
      region: "Hà Nội",
      country: "VN",
      mapUrl: "https://maps.app.goo.gl/7VgHcAP3EXp4rP7T6",
      geo: { lat: 20.841295, lng: 105.8699602 },
    },
    phones: [{ number: "0824 862 689" }, { number: "0979 072 186" }],
    email: "nhuawinvietnam@gmail.com",
    zalo: { url: "https://zalo.me/0824862689", label: "Nhắn Zalo" },
    socials: [
      {
        platform: "facebook",
        label: "Fanpage Fomex WIN Việt Nam",
        url: "https://www.facebook.com/profile.php?id=61591527334082",
        confirmed: false,
      },
    ],
    openingHours: [
      {
        label: "Thứ 2 – Thứ 7",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
      { label: "Chủ nhật", days: ["Sunday"], opens: "09:00", closes: "17:00" },
    ],
    areaServed: "Việt Nam",
  },

  header: {
    items: [
      {
        label: "Sản phẩm",
        link: { kind: "internal", path: "/san-pham" },
        children: [
          { label: "Bảng quy cách", link: { kind: "internal", path: "/san-pham", anchor: "bang-quy-cach" }, children: [] },
          { label: "Ứng dụng", link: { kind: "internal", path: "/san-pham", anchor: "ung-dung" }, children: [] },
        ],
      },
      {
        label: "Về WIN",
        link: { kind: "internal", path: "/ve-win" },
        children: [{ label: "Nhà máy", link: { kind: "internal", path: "/ve-win", anchor: "nha-may" }, children: [] }],
      },
      {
        label: "Hợp tác",
        link: { kind: "internal", path: "/hop-tac" },
        children: [
          { label: "Đối tượng hợp tác", link: { kind: "internal", path: "/hop-tac", anchor: "doi-tuong" }, children: [] },
        ],
      },
      { label: "Tin tức", link: { kind: "internal", path: "/tin-tuc" }, children: [] },
      { label: "Liên hệ", link: { kind: "internal", path: "/lien-he" }, children: [] },
    ],
    cta: { label: "Nhận báo giá", link: { kind: "internal", path: "/bao-gia" }, children: [] },
  },

  footer: {
    columns: [
      {
        title: "Khám phá",
        items: [
          { label: "Sản phẩm", link: { kind: "internal", path: "/san-pham" }, children: [] },
          { label: "Bảng quy cách", link: { kind: "internal", path: "/san-pham", anchor: "bang-quy-cach" }, children: [] },
          { label: "Ứng dụng", link: { kind: "internal", path: "/san-pham", anchor: "ung-dung" }, children: [] },
          { label: "Về WIN", link: { kind: "internal", path: "/ve-win" }, children: [] },
          { label: "Nhà máy", link: { kind: "internal", path: "/ve-win", anchor: "nha-may" }, children: [] },
          { label: "Tin tức", link: { kind: "internal", path: "/tin-tuc" }, children: [] },
        ],
      },
      {
        title: "Hợp tác",
        items: [
          { label: "Nhà phân phối", link: { kind: "internal", path: "/hop-tac", anchor: "doi-tuong" }, children: [] },
          { label: "Đại lý vật liệu", link: { kind: "internal", path: "/hop-tac", anchor: "doi-tuong" }, children: [] },
          { label: "Nhà thầu thi công", link: { kind: "internal", path: "/hop-tac", anchor: "doi-tuong" }, children: [] },
          { label: "Nhận báo giá", link: { kind: "internal", path: "/bao-gia" }, children: [] },
          { label: "Liên hệ", link: { kind: "internal", path: "/lien-he" }, children: [] },
        ],
      },
    ],
    // privacyLink: chỉ thêm khi /chinh-sach-bao-mat đã publish (REQ-21, MI-15).
  },

  homePage: {
    seo: {
      title: "Nhựa WIN Việt Nam — Nhà sản xuất tấm Fomex tại Việt Nam",
      description:
        "Tấm Fomex 3–18 ly sản xuất tại nhà máy WIN, Hà Nội. Cung ứng toàn quốc cho nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công.",
      noindex: false,
    },
    hero: {
      eyebrow: "Fomex cho người Việt",
      titleLines: ["Làm chủ công nghệ.", "Chủ động nguồn Fomex Việt."],
      lead: "Tấm Fomex 3–18 ly sản xuất tại nhà máy WIN, Hà Nội. Cung ứng toàn quốc cho nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công.",
      cta: { label: "Nhận báo giá", link: { kind: "internal", path: "/bao-gia" }, children: [] },
    },
  },

  notFoundPage: {
    title: "Không tìm thấy trang",
    body: "Trang bạn tìm có thể đã đổi địa chỉ hoặc không còn. Mời bạn xem các trang dưới đây.",
    links: [
      { label: "Trang chủ", link: { kind: "internal", path: "/" }, children: [] },
      { label: "Sản phẩm", link: { kind: "internal", path: "/san-pham" }, children: [] },
      { label: "Nhận báo giá", link: { kind: "internal", path: "/bao-gia" }, children: [] },
      { label: "Liên hệ", link: { kind: "internal", path: "/lien-he" }, children: [] },
    ],
  },

  // 6 bài cũ nhập ở T3.4 / T4.7 (cần bản crawl đầy đủ); chưa có dữ liệu thì để trống, không bịa.
  posts: [],
};
