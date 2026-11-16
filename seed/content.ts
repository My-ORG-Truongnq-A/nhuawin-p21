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
      display: "Cụm công nghiệp Quất Động, xã Thượng Phúc, Hà Nội",
      street: "Cụm công nghiệp Quất Động, xã Thượng Phúc",
      locality: "Hà Nội",
      region: "Hà Nội",
      country: "VN",
      mapUrl: "https://maps.app.goo.gl/7VgHcAP3EXp4rP7T6",
      geo: { lat: 20.841295, lng: 105.8699602 },
    },
    // OQ-CM-07: tạm đặt 0824 862 689 là số chính (trùng số Zalo).
    phones: [
      { number: "0824 862 689", e164: "+84824862689" },
      { number: "0979 072 186", e164: "+84979072186" },
    ],
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
    floatingContact: { enabled: true, showCall: true, showZalo: true, showFacebook: true },
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
    showContact: true,
    // Chính sách bảo mật: chỉ thêm khi /chinh-sach-bao-mat đã publish (REQ-21, MI-15).
    legalLinks: [],
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

  // 6 bài cũ (legacy_url_map.json: slug, tiêu đề, ngày). Chủ đề, tóm tắt, ảnh, nội dung nhập ở T3.4 từ bản crawl — không bịa.
  posts: [
    { slug: "cach-chon-do-day-tam-fomex", title: "Cách chọn độ dày tấm Fomex cho từng hạng mục", publishedAt: "2026-09-22", noindex: false },
    { slug: "in-uv-va-dan-decal-len-tam-fomex", title: "Kinh nghiệm in UV và dán decal lên tấm Fomex", publishedAt: "2026-09-15", noindex: false },
    { slug: "nhap-fomex-so-luong-lon-cho-dai-ly", title: "Kinh nghiệm nhập Fomex số lượng lớn cho đại lý vật liệu", publishedAt: "2026-09-08", noindex: false },
    { slug: "tam-fomex-la-gi", title: "Tấm Fomex là gì? Cấu tạo, đặc tính và ứng dụng", publishedAt: "2026-08-25", noindex: false },
    { slug: "cach-cat-va-gia-cong-tam-fomex", title: "Cắt và gia công tấm Fomex gọn mép, không vỡ cạnh", publishedAt: "2026-08-11", noindex: false },
    { slug: "dung-tam-fomex-ngoai-troi", title: "Dùng tấm Fomex ngoài trời: chọn tấm, lắp đặt và bảo quản", publishedAt: "2026-07-28", noindex: false },
  ],

  // brief.json offerings.products. Bảng quy cách (specs) chờ chốt cột OQ-CM-01; ảnh chờ quyền dùng MI-10.
  productGroups: [
    {
      slug: "fomex-3-ly",
      title: "Fomex 3 ly",
      order: 1,
      nominalLabel: "3 ly",
      actualRangeMm: { min: 2.4, max: 2.7 },
      sheetsPerBundle: "15 tấm/kẹp",
      description: "Nhẹ, dễ cắt — decor sinh nhật, tiệc cưới, background, biển bảng, chân quảng cáo, cắt dán decal.",
      specs: [],
    },
    {
      slug: "fomex-5-ly",
      title: "Fomex 5 ly",
      order: 2,
      nominalLabel: "5 ly",
      actualRangeMm: { min: 3.8, max: 4.7 },
      sheetsPerBundle: "10–12 tấm/kẹp",
      description: "Cứng hơn, giữ phẳng tốt — decor trang trí.",
      specs: [],
    },
    {
      slug: "fomex-8-10-ly",
      title: "Fomex 8–10 ly",
      order: 3,
      nominalLabel: "8–10 ly",
      actualRangeMm: { min: 7, max: 9.5 },
      sheetsPerBundle: "5 tấm/kẹp",
      description: "Chịu lực tốt — hashtag, bảng check-in cầm tay, nội thất.",
      specs: [],
    },
    {
      slug: "fomex-15-18-ly",
      title: "Fomex 15–18 ly",
      order: 4,
      nominalLabel: "15–18 ly",
      actualRangeMm: { min: 13.5, max: 17 },
      sheetsPerBundle: "2–3 tấm/kẹp",
      description: "Chân chữ, chữ nổi, logo khối, nội thất.",
      specs: [],
    },
  ],

  // brief.json offerings.applications. Nhóm phù hợp / mô tả / ảnh / album (MI-08) nhập ở T3.4.
  applications: [
    { slug: "bang-quang-cao-in-uv", title: "Bảng quảng cáo, in UV", order: 1, thicknessHint: "3 ly", recommendedGroups: [], album: [] },
    { slug: "chu-noi-logo-khoi", title: "Chữ nổi, logo khối", order: 2, thicknessHint: "15–18 ly", recommendedGroups: [], album: [] },
    { slug: "noi-that-vach-trang-tri", title: "Nội thất, vách trang trí", order: 3, thicknessHint: "8–18 ly", recommendedGroups: [], album: [] },
    { slug: "backdrop-sinh-nhat", title: "Backdrop sinh nhật", order: 4, thicknessHint: "gợi ý 3–5 ly", recommendedGroups: [], album: [] },
    { slug: "backdrop-su-kien", title: "Backdrop sự kiện", order: 5, thicknessHint: "gợi ý 3–10 ly", recommendedGroups: [], album: [] },
    { slug: "cat-dan-decal", title: "Cắt dán decal", order: 6, thicknessHint: "gợi ý 3 ly", recommendedGroups: [], album: [] },
    { slug: "hashtag-check-in", title: "Hashtag check-in", order: 7, thicknessHint: "gợi ý 8–10 ly", recommendedGroups: [], album: [] },
  ],

  // brief.json content.newsCategories (slug = slugifyVi(tên), giữ ?chu-de= cũ).
  categories: [
    { slug: "kien-thuc-vat-lieu", title: "Kiến thức vật liệu", order: 1 },
    { slug: "tin-win", title: "Tin WIN", order: 2 },
    { slug: "chon-gia-cong", title: "Chọn & gia công", order: 3 },
    { slug: "danh-cho-dai-ly", title: "Dành cho đại lý", order: 4 },
  ],
};
