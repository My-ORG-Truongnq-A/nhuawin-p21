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
import type { Application, Category, ContentMap, NavItem, Post, PostSummary, ProductGroup, RichText } from "@/lib/content/types";
import { CRAWL_APPLICATIONS, CRAWL_IMAGES, CRAWL_POSTS, CRAWL_PRODUCT_GROUPS } from "./crawl";

const IMG = CRAWL_IMAGES;

const nav = (label: string, path: string, anchor?: string): NavItem => ({
  label,
  link: anchor ? { kind: "internal", path, anchor } : { kind: "internal", path },
  children: [],
});

let k = 0;
const p = (text: string): RichText[number] => ({
  _type: "block",
  _key: `s${k++}`,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `s${k++}`, text, marks: [] }],
});
const qa = (question: string, answer: string) => ({ question, answer: [p(answer)] });

const CATEGORIES: Category[] = [
  { slug: "kien-thuc-vat-lieu", title: "Kiến thức vật liệu", order: 1, description: "Kiến thức về tấm Fomex (PVC foam): cấu tạo, đặc tính, độ dày danh nghĩa và thực tế, cách dùng trong quảng cáo, sự kiện, nội thất — từ Nhựa WIN." },
  { slug: "tin-win", title: "Tin WIN", order: 2, description: "Tin hoạt động của Công ty TNHH Nhựa WIN Việt Nam, nhà máy sản xuất tấm Fomex 3–18 ly tại Cụm công nghiệp Quất Động, Hà Nội, và hoạt động cùng đối tác." },
  { slug: "chon-gia-cong", title: "Chọn & gia công", order: 3, description: "Hướng dẫn chọn độ dày và gia công tấm Fomex: cắt, phay CNC, in UV, dán decal, lắp đặt ngoài trời — kinh nghiệm thực tế từ nhà máy Nhựa WIN." },
  { slug: "danh-cho-dai-ly", title: "Dành cho đại lý", order: 4, description: "Kinh nghiệm cho đại lý vật liệu quảng cáo: nhập tấm Fomex số lượng lớn, cơ cấu độ dày tồn kho, kiểm hàng, lưu kho và làm việc với nhà máy WIN." },
];

/** seoTitle ngắn theo seo_plan (title bài cũ > 60 ký tự). */
const SEO_TITLES: Record<string, string> = {
  "cach-chon-do-day-tam-fomex": "Chọn độ dày tấm Fomex cho từng hạng mục",
  "in-uv-va-dan-decal-len-tam-fomex": "In UV và dán decal lên tấm Fomex",
  "nhap-fomex-so-luong-lon-cho-dai-ly": "Nhập Fomex số lượng lớn cho đại lý",
  "tam-fomex-la-gi": "Tấm Fomex là gì? Cấu tạo và ứng dụng",
  "cach-cat-va-gia-cong-tam-fomex": "Cắt, gia công tấm Fomex không vỡ cạnh",
  "dung-tam-fomex-ngoai-troi": "Dùng tấm Fomex ngoài trời đúng cách",
};

/** Bài đầy đủ (thân bài Portable Text) — cửa nội dung đọc qua getPost(slug). */
export const SEED_POSTS: Post[] = CRAWL_POSTS.map((c) => {
  const cat = CATEGORIES.find((x) => x.slug === c.categorySlug);
  return {
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    publishedAt: c.publishedAt,
    image: c.image,
    ...(cat ? { category: { slug: cat.slug, title: cat.title } } : {}),
    noindex: false,
    seoTitle: SEO_TITLES[c.slug],
    seoDescription: c.seoDescription,
    body: c.body,
    relatedSlugs: [],
  };
});

function toSummary(p: Post): PostSummary {
  const { slug, title, excerpt, publishedAt, updatedAt, image, category, noindex } = p;
  return { slug, title, excerpt, publishedAt, ...(updatedAt ? { updatedAt } : {}), image, ...(category ? { category } : {}), noindex };
}

function group(
  slug: string,
  title: string,
  order: number,
  nominalLabel: string,
  actualRangeMm: { min: number; max: number },
  sheetsPerBundle: string,
  description: string,
): ProductGroup {
  const c = CRAWL_PRODUCT_GROUPS.find((x) => x.slug === slug);
  return {
    slug,
    title,
    order,
    nominalLabel,
    actualRangeMm,
    sheetsPerBundle,
    description,
    ...(c?.badge ? { badge: c.badge } : {}),
    ...(c?.image ? { image: c.image } : {}),
    specs: c?.specs ?? [],
    quoteCtaLabel: `Báo giá ${title}`,
  };
}

function app(slug: string, title: string, order: number, thicknessHint: string, recommendedGroups: string[]): Application {
  const c = CRAWL_APPLICATIONS.find((x) => x.slug === slug);
  return {
    slug,
    title,
    order,
    thicknessHint,
    recommendedGroups,
    ...(c?.summary ? { summary: c.summary } : {}),
    ...(c?.cardImage ? { cardImage: c.cardImage } : {}),
    album: c?.album ?? [],
  };
}


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
    // seo_plan site.geo.quickFactsBlock (REQ-27).
    quickFacts: {
      what: "Sản xuất tấm Fomex (PVC foam) 3–18 ly, khổ 1220 × 2440 mm",
      forWhom: "Nhà phân phối, đại lý vật liệu, nhà thầu thi công, xưởng in",
    },
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

  // Câu chữ trang: nguyên văn web cũ (crawl 16/11/2026) + title / description / H1 theo seo_plan.
  homePage: {
    seo: {
      title: "Nhựa WIN Việt Nam — Nhà sản xuất tấm Fomex tại Việt Nam",
      description:
        "Tấm Fomex 3–18 ly sản xuất tại nhà máy WIN, Hà Nội. Cung ứng toàn quốc cho nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công.",
      noindex: false,
    },
    hero: {
      // seo_plan: kicker (thẻ p) ngay trên H1.
      eyebrow: "Nhà sản xuất tấm Fomex 3–18 ly tại Hà Nội",
      titleLines: ["Làm chủ công nghệ.", "Chủ động nguồn Fomex Việt."],
      lead: "Tấm Fomex 3–18 ly sản xuất tại nhà máy WIN, Hà Nội — cung ứng cho nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công theo chuỗi trên cả nước.",
      cta: nav("Nhận báo giá", "/bao-gia"),
      secondaryCta: nav("Đăng ký hợp tác", "/hop-tac", "dang-ky"),
      image: IMG["47d2391c86"],
    },
    capability: {
      heading: {
        eyebrow: "Năng lực sản xuất",
        title: "Năng lực sản xuất tạo nền tảng hợp tác",
        intro: "Đầu tư công nghệ, phát triển năng lực vận hành và kiểm soát chất lượng ngay tại nhà máy ở Cụm công nghiệp Quất Động, Hà Nội.",
      },
      items: [
        { title: "Công nghệ sản xuất", text: "Dây chuyền đùn ép đồng bộ, hiện đại; đội ngũ WIN trực tiếp vận hành.", image: IMG["141c077228"] },
        { title: "Kiểm soát quy cách", text: "Đo kiểm độ dày, độ phẳng, bề mặt theo từng lô trước khi xuất kho.", image: IMG["6161c1f91a"] },
        { title: "Cung ứng cho đối tác", text: "Sản lượng ổn định cho đơn hàng lớn, giao hàng toàn quốc.", image: IMG["183f540afc"] },
      ],
    },
    productGroupsSection: { eyebrow: "Sản phẩm", title: "Tấm Fomex cho từng nhu cầu" },
    applicationsSection: {
      eyebrow: "Ứng dụng",
      title: "Một tấm vật liệu, nhiều thành phẩm",
      intro: "Tư vấn lựa chọn sản phẩm phù hợp từng hạng mục.",
    },
    partnerSection: {
      heading: {
        eyebrow: "Hợp tác cùng phát triển",
        title: "Đồng hành cùng đối tác trên cả nước",
        intro: "Nguồn Fomex sản xuất trong nước giúp nhà phân phối, đại lý vật liệu và nhà thầu thi công theo chuỗi chủ động kế hoạch nhập hàng và tiến độ công trình.",
      },
      cta: nav("Đăng ký hợp tác", "/hop-tac", "dang-ky"),
    },
    latestPosts: { heading: { eyebrow: "Tin tức & kiến thức", title: "Chọn đúng tấm, gia công đúng cách" }, count: 3 },
    messageForm: {},
  },

  productsPage: {
    seo: {
      title: "Tấm Fomex 3 – 18 ly | Nhựa WIN Việt Nam",
      description:
        "Bảng quy cách tấm Fomex WIN 3, 5, 8, 10, 15, 18 ly: độ dày thực tế 2,4–17 mm, khổ 1220 × 2440 mm, số tấm mỗi kẹp. Chọn độ dày theo ứng dụng.",
      noindex: false,
    },
    title: "Tấm Fomex WIN 3 – 18 ly",
    intro:
      "Bốn nhóm độ dày cho quảng cáo, sự kiện và nội ngoại thất — độ dày thực tế 2,4 – 17 mm, khổ 1220 × 2440 mm, sản xuất tại nhà máy WIN, Hà Nội và giao hàng toàn quốc.",
    heroImage: IMG["39ad65ea3f"],
    groupsSection: { title: "Chọn theo độ dày" },
    specTableSection: {
      heading: { title: "Bảng quy cách tấm Fomex WIN" },
      footnote: "Linh hoạt kích thước và độ dày tấm theo yêu cầu",
    },
    applicationsSection: {
      eyebrow: "Ứng dụng",
      title: "Một tấm vật liệu, nhiều thành phẩm",
      intro: "Tư vấn lựa chọn sản phẩm phù hợp từng hạng mục.",
    },
    whyChoose: {
      heading: { eyebrow: "Đặc tính chung", title: "Vì sao chọn tấm Fomex" },
      items: [
        { title: "Nhẹ, dễ vận chuyển", text: "Cấu trúc bọt khí giúp tấm nhẹ hơn gỗ và MDF cùng độ dày, thuận tiện bốc xếp và thi công trên cao." },
        { title: "Không thấm nước", text: "Nhựa PVC không hút ẩm nên tấm không mục, không trương nở; dùng được ở khu vực ẩm và ngoài trời có mái che." },
        { title: "Bề mặt in đẹp", text: "Bề mặt trắng, phẳng, mịn cho màu in UV sắc nét; decal bám chắc, ít bong mép khi cắt chữ." },
        { title: "Dễ gia công", text: "Rọc dao với tấm mỏng; cưa, CNC, khoan, uốn nhiệt với tấm dày. Mép cắt gọn, chà nhám là mịn." },
        { title: "Thay thế gỗ, MDF", text: "Dùng thay gỗ dán, MDF cho tủ, kệ, vách ở khu vực ẩm; không cong vênh do nước, không mối mọt." },
        { title: "Đóng kiện theo kẹp", text: "Mỗi loại đóng kẹp với số tấm cố định (2 – 15 tấm/kẹp) — dễ kiểm đếm khi nhận hàng và lưu kho." },
      ],
    },
    chooseByUse: {
      heading: { title: "Chọn độ dày theo hạng mục" },
      rows: [
        { use: "Cắt dán decal, biển bảng, chân quảng cáo", thickness: "3 ly", note: "Nhẹ, rọc dao được, tiết kiệm chi phí" },
        { use: "Decor sinh nhật, tiệc cưới, background", thickness: "3 – 5 ly", note: "3 ly cho mảng phụ, 5 ly cho mảng chính" },
        { use: "Decor trang trí, backdrop sự kiện", thickness: "5 – 10 ly", note: "Khung lớn nên dùng tấm dày hơn để giữ phẳng" },
        { use: "Hashtag, bảng check-in cầm tay", thickness: "8 – 10 ly", note: "Đủ cứng khi cầm, mép cắt CNC gọn" },
        { use: "Nội ngoại thất, tủ kệ, vách", thickness: "8 – 18 ly", note: "Bắt vít, dán cạnh như ván gỗ công nghiệp" },
        { use: "Chân chữ, chữ nổi, logo", thickness: "15 – 18 ly", note: "Độ dày tạo chiều sâu cho chữ" },
      ],
    },
    faq: {
      title: "Câu hỏi thường gặp về tấm Fomex",
      items: [
        qa("Tấm Fomex là gì?", "Tấm Fomex (PVC foam) là tấm nhựa PVC có cấu trúc bọt khí bên trong: nhẹ, bề mặt phẳng, dễ cắt và gia công — dùng nhiều trong quảng cáo, decor sự kiện và nội ngoại thất."),
        qa("“3 ly thiếu” và “3 ly đủ” khác nhau thế nào?", "“Ly” là tên gọi theo độ dày danh nghĩa; “thiếu” và “đủ” cho biết độ dày thực tế. Ví dụ Fomex 3 ly thiếu dày 2,4 mm, 3 ly đủ dày 2,7 mm. Bảng quy cách ghi độ dày thực tế của từng loại để bạn so sánh đúng khi đặt hàng."),
        qa("Khổ tấm tiêu chuẩn là bao nhiêu?", "Khổ tiêu chuẩn 1220 × 2440 mm cho mọi độ dày. WIN linh hoạt kích thước và độ dày tấm theo yêu cầu của đơn hàng."),
        qa("Một kẹp có bao nhiêu tấm?", "Tuỳ độ dày: 15 tấm/kẹp với 3 ly, 10 – 12 tấm/kẹp với 5 ly, 5 tấm/kẹp với 8 – 10 ly, 2 – 3 tấm/kẹp với 15 – 18 ly. Chi tiết từng loại có trong bảng quy cách."),
        qa("Tấm Fomex có chịu nước không?", "Tấm Fomex làm từ nhựa PVC nên chịu ẩm tốt, không mục mọt như gỗ. Với hạng mục ngoài trời, hãy trao đổi để được tư vấn độ dày và cách thi công phù hợp."),
        qa("Làm sao để nhận giá tấm Fomex?", "Giá thay đổi theo độ dày, số lượng và khu vực giao hàng. Chọn quy cách tại trang Nhận báo giá hoặc nhắn Zalo để được báo giá sỉ từ nhà máy."),
      ],
    },
    messageForm: {},
  },

  quotePage: {
    seo: {
      title: "Báo giá tấm Fomex | Nhựa WIN Việt Nam",
      description:
        "Nhận báo giá sỉ tấm Fomex 3–18 ly trực tiếp từ nhà máy Nhựa WIN Việt Nam: chọn độ dày, số lượng và khu vực giao hàng, WIN liên hệ tư vấn ngay.",
      noindex: false,
    },
    title: "Báo giá tấm Fomex theo độ dày & số lượng",
    intro:
      "Giá tấm Fomex thay đổi theo độ dày, số lượng và khu vực giao hàng. Chọn quy cách bên dưới — WIN báo giá sỉ trực tiếp từ nhà máy.",
    benefits: [
      { title: "Giá theo số lượng", text: "Đơn càng lớn, giá càng tốt." },
      { title: "Phí & lịch giao dự kiến", text: "Về đúng tỉnh/thành của bạn." },
      { title: "Chính sách đại lý", text: "Nếu bạn nhập hàng thường xuyên." },
    ],
    faq: {
      title: "Hỏi đáp về giá tấm Fomex",
      items: [
        qa("Giá tấm Fomex phụ thuộc vào những gì?", "Chủ yếu vào độ dày, số lượng đặt và khu vực giao hàng. Vì vậy WIN báo giá theo từng yêu cầu để chính xác nhất."),
        qa("Mua số lượng lớn có giá tốt hơn không?", "Có. WIN báo giá theo số lượng; đối tác nhập hàng thường xuyên có thể áp dụng chính sách đại lý."),
        qa("Có đặt được kích thước hoặc độ dày riêng không?", "Có. Khổ tiêu chuẩn 1220 × 2440 mm, WIN linh hoạt kích thước và độ dày tấm theo yêu cầu — ghi rõ trong phần ghi chú của form."),
      ],
    },
  },

  aboutPage: {
    seo: {
      title: "Nhà máy sản xuất tấm Fomex tại Hà Nội | Nhựa WIN Việt Nam",
      description:
        "Công ty TNHH Nhựa WIN Việt Nam sản xuất tấm Fomex 3–18 ly tại Cụm công nghiệp Quất Động, Hà Nội. Năng lực, quy trình 6 công đoạn, hình ảnh nhà máy.",
      noindex: false,
    },
    title: "Nhà máy sản xuất tấm Fomex tại Hà Nội",
    intro: "Làm chủ công nghệ, chủ động nguồn Fomex Việt — cho nhà phân phối, đại lý và nhà thầu trên cả nước.",
    heroImage: IMG["a9e342c97c"],
    story: {
      heading: { eyebrow: "Giới thiệu tổng quan", title: "Nhà sản xuất tấm Fomex 3–18 ly tại Hà Nội" },
      body: [
        p("Công ty TNHH Nhựa WIN Việt Nam đầu tư nhà máy và dây chuyền sản xuất tấm Fomex tại Cụm công nghiệp Quất Động, Hà Nội. WIN tập trung vào một dòng sản phẩm, làm chủ quy trình từ phối trộn nguyên liệu đến đo kiểm và xuất hàng."),
        p("Khách hàng chính của WIN là nhà phân phối, đại lý vật liệu quảng cáo, nội ngoại thất và nhà thầu thi công theo chuỗi trên cả nước."),
      ],
      image: IMG["7c47e034d8"],
    },
    mission: "Góp phần phát triển nguồn cung Fomex sản xuất trong nước, giúp đối tác chủ động nguồn vật liệu cho công việc.",
    vision: "Trở thành nhà sản xuất tấm Fomex uy tín tại Việt Nam, từng bước vươn ra thị trường quốc tế.",
    values: ["Chất lượng", "Tiến độ", "Đồng hành"],
    capability: {
      heading: {
        eyebrow: "Năng lực sản xuất",
        title: "Quy mô và nền tảng công nghệ",
        intro: "Dây chuyền sản xuất hiện đại, tự động hóa từ phối trộn đến cắt khổ — đội ngũ WIN trực tiếp vận hành, bảo trì và kiểm soát chất lượng tại nhà máy.",
      },
      // Ý "Khả năng đáp ứng (sản lượng/năm)" của web cũ chờ khách xác minh (REQ-14) — không đưa vào seed.
      items: [
        { title: "Dải độ dày 3–18 ly", text: "Độ dày thực tế 2,4 – 17 mm." },
        { title: "14 loại quy cách", text: "Khổ 1220 × 2440 mm." },
        { title: "Giao hàng toàn quốc", text: "Cung ứng cho đối tác trên cả nước." },
      ],
    },
    factory: {
      heading: {
        eyebrow: "Nhà máy",
        title: "Hình ảnh nhà máy WIN",
        intro: "Quy trình sản xuất & kiểm tra chất lượng — 6 công đoạn khép kín tại nhà máy WIN.",
      },
      processSteps: [
        { title: "Phối trộn nguyên liệu", text: "Định lượng theo công thức chuẩn.", image: IMG["d9f007e896"] },
        { title: "Đùn ép", text: "Đùn ép liên tục, kiểm soát nhiệt ổn định.", image: IMG["9ba63de8b8"] },
        { title: "Định hình & làm nguội", text: "Giữ độ dày đều, bề mặt phẳng.", image: IMG["712c57da05"] },
        { title: "Cắt khổ", text: "Theo khổ tiêu chuẩn hoặc yêu cầu.", image: IMG["835e9446e4"] },
        { title: "Đo kiểm", text: "Độ dày, độ phẳng, bề mặt theo từng lô.", image: IMG["6161c1f91a"] },
        { title: "Đóng gói & xuất hàng", text: "Đóng kẹp, giao đi toàn quốc.", image: IMG["793b375590"] },
      ],
      gallery: [IMG["1f0240b13d"], IMG["141c077228"], IMG["ec73a227fb"], IMG["6d29e262bb"], IMG["183f540afc"], IMG["58cb260fde"]],
      visitCta: nav("Đặt lịch tham quan", "/lien-he", "lien-he"),
    },
    messageForm: {},
  },

  partnershipPage: {
    seo: {
      title: "Hợp tác phân phối tấm Fomex | Nhựa WIN Việt Nam",
      description:
        "Trở thành nhà phân phối, đại lý tấm Fomex của Nhựa WIN Việt Nam: nguồn hàng sản xuất trong nước, giao hàng toàn quốc, hỗ trợ mẫu tấm và tư vấn kỹ thuật.",
      noindex: false,
    },
    title: "Trở thành đối tác phân phối tấm Fomex WIN",
    intro:
      "Làm việc trực tiếp với nhà máy WIN tại Hà Nội: 14 quy cách tấm Fomex 3 – 18 ly, tư vấn quy cách, gửi mẫu thử, báo giá theo số lượng và khu vực, giao hàng toàn quốc — cho nhà phân phối, đại lý vật liệu và nhà thầu thi công theo chuỗi.",
    heroImage: IMG["58ff559f46"],
    partnerGroups: {
      heading: {
        eyebrow: "Đối tượng hợp tác",
        title: "Ba nhóm đối tác của WIN",
        intro: "Mỗi nhóm có cách nhập hàng và bán hàng khác nhau — WIN điều chỉnh cách tư vấn, báo giá và giao hàng theo từng nhóm, trao đổi trực tiếp với nhà máy.",
      },
      items: [
        { title: "Nhà phân phối", text: "Nhập hàng số lượng lớn trực tiếp từ nhà máy, chủ động kế hoạch phân phối theo khu vực." },
        { title: "Đại lý vật liệu", text: "Đại lý vật liệu quảng cáo, nội ngoại thất: đủ dải độ dày 3 – 18 ly, đóng kẹp sẵn để bán lẻ." },
        { title: "Nhà thầu theo chuỗi", text: "Đơn hàng theo dự án, giao theo đợt theo tiến độ công trình; tư vấn quy cách và thử mẫu trước khi chốt khối lượng." },
      ],
    },
    growTogether: {
      eyebrow: "Hợp tác cùng phát triển",
      title: "Đồng hành cùng đối tác trên cả nước",
      intro: "Nguồn Fomex sản xuất trong nước giúp nhà phân phối, đại lý vật liệu và nhà thầu thi công theo chuỗi chủ động kế hoạch nhập hàng và tiến độ công trình.",
      benefits: [
        { title: "Chính sách hợp tác rõ ràng", text: "Riêng cho từng nhóm đối tác." },
        { title: "Nguồn hàng ổn định", text: "Đáp ứng đơn hàng số lượng lớn." },
        { title: "Giao hàng nhanh chóng", text: "Quy trình gọn, giao toàn quốc." },
        { title: "Xử lý phát sinh nhanh", text: "Đầu mối hỗ trợ từ nhà máy." },
      ],
      logisticsImage: IMG["a9e342c97c"],
    },
    processSteps: [
      { title: "Gửi nhu cầu", text: "Loại hình, khu vực, sản lượng dự kiến." },
      { title: "Tư vấn & báo giá", text: "Quy cách, giá theo số lượng, gửi mẫu thử." },
      { title: "Thống nhất & đặt hàng", text: "Ký thỏa thuận, có thể tham quan nhà máy." },
      { title: "Giao hàng & hỗ trợ", text: "Giao toàn quốc, đầu mối hỗ trợ riêng." },
    ],
    registerCta: nav("Đăng ký hợp tác", "/hop-tac", "dang-ky"),
    faq: {
      title: "Câu hỏi về hợp tác",
      items: [
        qa("Có được tham quan nhà máy trước khi hợp tác không?", "Có. Đối tác có thể đặt lịch tham quan dây chuyền và kho hàng tại Cụm công nghiệp Quất Động, Hà Nội; WIN xác nhận lịch qua điện thoại."),
        qa("WIN có gửi mẫu tấm để thử không?", "Có. Gửi hạng mục, hệ mực, decal và cách cắt đang dùng — WIN tư vấn quy cách và trao đổi phương án thử mẫu trước khi chốt đơn."),
        qa("WIN giao hàng những khu vực nào?", "WIN cung ứng toàn quốc. Phí và lịch giao được báo cùng báo giá theo tỉnh/thành của đối tác."),
      ],
    },
  },

  newsPage: {
    seo: {
      title: "Tin tức & kiến thức Fomex | Nhựa WIN Việt Nam",
      description:
        "Tin hoạt động của Nhựa WIN Việt Nam và kinh nghiệm chọn, cắt, in, gia công tấm Fomex dành cho đại lý vật liệu, xưởng in và nhà thầu thi công.",
      noindex: false,
    },
    title: "Tin tức & kiến thức Fomex",
    intro: "Tin hoạt động của WIN và kinh nghiệm chọn, gia công tấm Fomex cho đại lý, xưởng in và nhà thầu thi công.",
    // OQ-CM-04 chưa chốt: tạm 9 bài (lưới 3 cột).
    postsPerPage: 9,
    emptyText: "Chủ đề này chưa có bài viết.",
    articleCta: {
      heading: "Nhận báo giá tấm Fomex từ nhà máy",
      text: "Báo giá theo số lượng, tư vấn quy cách và thử mẫu cho đại lý, nhà thầu.",
      cta: nav("Gửi yêu cầu báo giá", "/bao-gia"),
    },
  },

  contactPage: {
    seo: {
      title: "Liên hệ nhà máy tấm Fomex tại Hà Nội | Nhựa WIN Việt Nam",
      description:
        "Liên hệ Nhựa WIN Việt Nam: hotline, Zalo, Fanpage, địa chỉ nhà máy tại Cụm công nghiệp Quất Động, Hà Nội. Đặt lịch tham quan nhà máy, nhận báo giá tấm Fomex.",
      noindex: false,
    },
    title: "Liên hệ Nhựa WIN Việt Nam",
    intro: "Cần báo giá, đăng ký đại lý hay tham quan nhà máy? Chọn kênh thuận tiện nhất với bạn.",
    showMap: true,
    messageForm: {},
  },

  // Chưa publish: chờ pháp nhân / MST / địa chỉ đăng ký (MI-15) và khách duyệt câu chữ (OQ-SA-01).
  privacyPage: null,

  leadForms: {
    // S3 / MI-24: đúng 2 câu khách đưa; phạm vi áp dụng chờ chốt.
    messageFormDefault: {
      heading: "Bạn cần nguồn Fomex chất lượng",
      subheading: "Để lại thông tin Nhựa Win sẽ liên hệ tư vấn ngay",
    },
    // OQ-CM-02: lựa chọn giữ như web cũ, chờ khách xác nhận.
    contact: {
      roleOptions: ["Nhà phân phối", "Đại lý vật liệu", "Nhà thầu thi công", "Xưởng in ấn & gia công", "Khác"],
      needOptions: ["Báo giá", "Tư vấn quy cách", "Thử mẫu", "Hợp tác phân phối", "Tham quan nhà máy"],
      notePlaceholder: "Số lượng dự kiến, độ dày, khu vực giao hàng",
      submitLabel: "Gửi yêu cầu tư vấn",
    },
    quote: {
      heading: "Thông tin nhận báo giá",
      notePlaceholder: "Hạng mục, kích thước hoặc độ dày riêng",
      submitLabel: "Gửi yêu cầu báo giá",
    },
    partnership: { heading: "Đăng ký hợp tác", submitLabel: "Gửi đăng ký hợp tác" },
    // Câu thông báo: bản nháp, chờ khách duyệt cùng câu chữ form (MI-24).
    successMessage: "Cảm ơn bạn! WIN đã nhận thông tin và sẽ liên hệ lại sớm.",
    errorMessage: "Chưa gửi được thông tin. Bạn vui lòng gọi {hotline} hoặc nhắn Zalo để WIN hỗ trợ ngay.",
    // Chưa có link Chính sách bảo mật vì trang chưa publish (MI-15) — giữ câu của web cũ.
    privacyNote: [p("Thông tin chỉ dùng để liên hệ tư vấn, báo giá.")],
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

  // 6 bài cũ (crawl 16/11/2026): tiêu đề, ngày, chủ đề, tóm tắt, ảnh đại diện giữ nguyên.
  posts: SEED_POSTS.map(toSummary),

  // Quy cách 14 loại + ảnh từ web cũ. Không có giá (REQ-14).
  productGroups: [
    group("fomex-3-ly", "Fomex 3 ly", 1, "3 ly", { min: 2.4, max: 2.7 }, "15 tấm/kẹp",
      "Nhẹ, dễ cắt — decor sinh nhật, tiệc cưới, background, biển bảng, chân quảng cáo, cắt dán decal."),
    group("fomex-5-ly", "Fomex 5 ly", 2, "5 ly", { min: 3.8, max: 4.7 }, "10–12 tấm/kẹp",
      "Cứng cáp hơn, giữ phẳng tốt — phù hợp hạng mục decor trang trí."),
    group("fomex-8-10-ly", "Fomex 8 – 10 ly", 3, "8 – 10 ly", { min: 7, max: 9.5 }, "5 tấm/kẹp",
      "Chịu lực tốt — hashtag, bảng check-in cầm tay, đồ nội thất."),
    group("fomex-15-18-ly", "Fomex 15 – 18 ly", 4, "15 – 18 ly", { min: 13.5, max: 17 }, "2–3 tấm/kẹp",
      "Cắt chân chữ, chữ nổi, logo tạo khối và hạng mục nội thất."),
  ],

  // Nhóm phù hợp suy từ dải độ dày gợi ý của từng ứng dụng (web cũ).
  applications: [
    app("bang-quang-cao-in-uv", "Bảng quảng cáo, in UV", 1, "3 ly", ["fomex-3-ly"]),
    app("chu-noi-logo-khoi", "Chữ nổi, logo khối", 2, "15 – 18 ly", ["fomex-15-18-ly"]),
    app("noi-that-vach-trang-tri", "Nội thất, vách trang trí", 3, "8 – 18 ly", ["fomex-8-10-ly", "fomex-15-18-ly"]),
    app("backdrop-sinh-nhat", "Backdrop sinh nhật", 4, "Gợi ý 3 – 5 ly", ["fomex-3-ly", "fomex-5-ly"]),
    app("backdrop-su-kien", "Backdrop sự kiện", 5, "Gợi ý 3 – 10 ly", ["fomex-3-ly", "fomex-5-ly", "fomex-8-10-ly"]),
    app("cat-dan-decal", "Cắt dán decal", 6, "Gợi ý 3 ly", ["fomex-3-ly"]),
    app("hashtag-check-in", "Hashtag check-in", 7, "Gợi ý 8 – 10 ly", ["fomex-8-10-ly"]),
  ],

  // brief.json content.newsCategories (slug = slugifyVi(tên), giữ ?chu-de= cũ). Mô tả: bản nháp seo_plan.
  categories: CATEGORIES,
};
