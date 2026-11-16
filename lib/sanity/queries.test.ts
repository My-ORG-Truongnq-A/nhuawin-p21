import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";
import { NORMALIZERS } from "@/lib/content/normalize";
import type { ContentKey, ContentMap } from "@/lib/content/types";
import { postDetail } from "@/lib/content/normalize";
import { POST_QUERY, QUERIES } from "./queries";

/**
 * Chạy GROQ thật bằng groq-js trên dataset dựng tay theo schema (T3.6) — 0 request tới Sanity.
 * Kiểm projection chiếu schema content_model về đúng kiểu chung sau chuẩn hoá.
 */

const asset = (id: string, w: number, h: number) => ({
  _id: id,
  _type: "sanity.imageAsset",
  url: `https://cdn.sanity.io/images/p/d/${id}.png`,
  metadata: { dimensions: { width: w, height: h } },
});
const fig = (ref: string, alt: string) => ({ _type: "figure", asset: { _type: "reference", _ref: ref }, alt });
const ref = (id: string) => ({ _type: "reference", _ref: id });
const link = (label: string, extra: Record<string, unknown>) => ({ _type: "link", label, ...extra });

const dataset = [
  asset("image-logo-1440x701-png", 1440, 701),
  asset("image-og-1200x630-png", 1200, 630),
  asset("image-g3-1376x768-jpg", 1376, 768),
  asset("image-p1-1200x800-jpg", 1200, 800),
  {
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Thương hiệu A",
    legalName: "Công ty TNHH A",
    tagline: "Khẩu hiệu A",
    areaServed: "Việt Nam",
    logoFull: fig("image-logo-1440x701-png", "Logo thương hiệu A"),
    phones: [
      { _key: "p2", display: "0900 000 002", e164: "+84900000002", isPrimary: false },
      { _key: "p1", display: "0900 000 001", e164: "+84900000001", label: "Kinh doanh", isPrimary: true },
    ],
    email: "a@example.com",
    address: { display: "KCN A, xã B, Hà Nội", streetAddress: "KCN A", ward: "xã B", city: "Hà Nội", country: "VN" },
    googleMapsUrl: "https://maps.app.goo.gl/x",
    geo: { _type: "geopoint", lat: 20.8, lng: 105.8 },
    openingHours: [
      { _key: "h1", days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "08:00", closes: "18:00" },
      { _key: "h2", days: ["Su"], opens: "09:00", closes: "17:00" },
    ],
    socialLinks: [
      { _key: "s1", platform: "zalo", url: "https://zalo.me/0900000001" },
      { _key: "s2", platform: "facebook", url: "https://facebook.com/a", label: "Fanpage A", confirmed: true },
    ],
    floatingContact: { enabled: true, showCall: true, showZalo: false, showFacebook: true },
    legal: { taxId: "0123456789", foundedYear: 2020 },
    seoDefaults: {
      titleTemplate: "%s | A",
      defaultDescription: "Mô tả mặc định",
      defaultOgImage: fig("image-og-1200x630-png", "Ảnh chia sẻ A"),
    },
    gtmId: "GTM-ABC123",
  },
  { _id: "productsPage", _type: "productsPage", title: "Sản phẩm" },
  { _id: "quotePage", _type: "quotePage", title: "Báo giá" },
  { _id: "privacyPage", _type: "privacyPage", title: "Chính sách" },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    title: "Về A",
    storyHeading: { title: "Giới thiệu" },
    story: [
      {
        _type: "block",
        _key: "b1",
        style: "normal",
        markDefs: [
          { _type: "link", _key: "m1", kind: "internal", internal: ref("productsPage") },
          { _type: "link", _key: "m2", kind: "external", href: "javascript:alert(1)" },
        ],
        children: [{ _type: "span", _key: "s1", text: "Xem sản phẩm", marks: ["m1"] }],
      },
    ],
    capability: {
      heading: { title: "Năng lực" },
      items: [
        { _key: "f1", title: "Đã xác nhận", verification: "confirmed" },
        { _key: "f2", title: "Sản lượng chưa xác minh", verification: "needs_confirmation" },
        { _key: "f3", title: "Mặc định" },
      ],
    },
    factory: { heading: { title: "Nhà máy" }, processSteps: [{ _key: "p1", title: "Đùn ép" }], gallery: [fig("image-g3-1376x768-jpg", "Xưởng")] },
    messageForm: { useDefault: false, heading: "Tiêu đề riêng" },
  },
  {
    _id: "leadForms",
    _type: "leadForms",
    messageFormDefault: { heading: "Bạn cần nguồn hàng", subheading: "Để lại thông tin" },
    contact: { roleOptions: ["Đại lý"], needOptions: ["Báo giá"], submitLabel: "Gửi" },
    quote: { submitLabel: "Gửi báo giá" },
    partnership: { submitLabel: "Gửi đăng ký" },
    successMessage: "Cảm ơn",
    errorMessage: "Gọi {hotline}",
    privacyNote: [
      {
        _type: "block",
        _key: "n1",
        style: "normal",
        markDefs: [{ _type: "link", _key: "m1", kind: "internal", internal: ref("privacyPage") }],
        children: [{ _type: "span", _key: "s1", text: "Chính sách", marks: ["m1"] }],
      },
    ],
  },
  { _id: "cat-1", _type: "category", title: "Tin WIN", slug: { current: "tin-win" }, order: 2 },
  { _id: "cat-2", _type: "category", title: "Kiến thức vật liệu", slug: { current: "kien-thuc-vat-lieu" }, order: 1 },
  {
    _id: "pg-2",
    _type: "productGroup",
    title: "Fomex 5 ly",
    slug: { current: "fomex-5-ly" },
    order: 2,
    nominalLabel: "5 ly",
  },
  {
    _id: "pg-1",
    _type: "productGroup",
    title: "Fomex 3 ly",
    slug: { current: "fomex-3-ly" },
    order: 1,
    nominalLabel: "3 ly",
    actualRangeMm: { min: 2.4, max: 2.7 },
    image: fig("image-g3-1376x768-jpg", "Tấm Fomex 3 ly"),
    specs: [{ _key: "r1", label: "3 ly thiếu", grade: "thieu", actualThicknessMm: 2.4, price: 999 }],
  },
  {
    _id: "app-1",
    _type: "application",
    title: "Backdrop sự kiện",
    slug: { current: "backdrop-su-kien" },
    order: 1,
    thicknessHint: "3–10 ly",
    recommendedGroups: [{ _key: "a", ...ref("pg-1") }, { _key: "b", ...ref("pg-2") }],
    album: [{ _key: "x", ...fig("image-p1-1200x800-jpg", "Backdrop sự kiện A") }],
  },
  {
    _id: "post-old",
    _type: "post",
    title: "Bài cũ",
    slug: { current: "bai-cu" },
    publishedAt: "2026-07-01T00:00:00Z",
    _updatedAt: "2026-07-02T00:00:00Z",
    category: ref("cat-1"),
  },
  {
    _id: "post-new",
    _type: "post",
    title: "Bài mới",
    slug: { current: "bai-moi" },
    publishedAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-05T00:00:00Z",
    category: ref("cat-2"),
    mainImage: fig("image-p1-1200x800-jpg", "Ảnh bài mới"),
    seo: { noindex: true, title: "SEO bài mới", description: "Mô tả bài mới" },
    relatedPosts: [{ _key: "r", ...ref("post-old") }],
    body: [
      { _type: "block", _key: "b1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "s", text: "Mục 1", marks: [] }] },
      { _key: "f1", ...fig("image-p1-1200x800-jpg", "Ảnh trong bài"), caption: "Chú thích" },
    ],
  },
  {
    _id: "header",
    _type: "header",
    items: [
      {
        _key: "i1",
        link: link("Sản phẩm", { kind: "internal", internal: ref("productsPage") }),
        children: [
          { _key: "c1", ...link("Fomex 3 ly", { kind: "internal", internal: ref("pg-1") }) },
          { _key: "c2", ...link("Bảng quy cách", { kind: "internal", internal: ref("productsPage"), anchor: "bang-quy-cach" }) },
          { _key: "c3", ...link("Backdrop", { kind: "internal", internal: ref("app-1") }) },
        ],
      },
      { _key: "i2", link: link("Tin WIN", { kind: "internal", internal: ref("cat-1") }) },
      { _key: "i3", link: link("Bài mới", { kind: "internal", internal: ref("post-new") }) },
      { _key: "i4", link: link("Zalo", { kind: "zalo" }) },
      { _key: "i5", link: link("Ngoài", { kind: "external", external: "https://shopee.vn/a" }) },
    ],
    cta: link("Gọi ngay", { kind: "phone" }),
  },
  {
    _id: "footer",
    _type: "footer",
    intro: "Giới thiệu",
    showContact: false,
    columns: [{ _key: "f1", title: "Khám phá", links: [{ _key: "l1", ...link("Báo giá", { kind: "internal", internal: ref("quotePage") }) }] }],
    legalLinks: [{ _key: "l2", ...link("Chính sách bảo mật", { kind: "internal", internal: ref("privacyPage") }) }],
    copyright: "© {year} {legalName}",
  },
  {
    _id: "homePage",
    _type: "homePage",
    seo: { title: "Trang chủ A" },
    hero: {
      headlineLines: ["Dòng 1", "Dòng 2"],
      subheadline: "Đoạn mở",
      image: fig("image-g3-1376x768-jpg", "Ảnh hero A"),
      primaryCta: link("Nhận báo giá", { kind: "internal", internal: ref("quotePage") }),
      secondaryCta: link("Facebook", { kind: "facebook" }),
    },
  },
  {
    _id: "notFoundPage",
    _type: "notFoundPage",
    title: "Không tìm thấy",
    text: "Mời xem",
    links: [{ _key: "n1", ...link("Sản phẩm", { kind: "internal", internal: ref("productsPage") }) }],
  },
];

async function run<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  const value = await evaluate(parse(QUERIES[key]), { dataset });
  const out = NORMALIZERS[key](await value.get());
  if (out === null) throw new Error(`${key}: chuẩn hoá trả null`);
  return out;
}

describe("GROQ → kiểu chung (T3.6)", () => {
  it.each(Object.keys(QUERIES))("%s: cú pháp GROQ hợp lệ", (key) => {
    expect(() => parse(QUERIES[key as ContentKey])).not.toThrow();
  });

  it("siteSettings: map tên trường mới, số chính lên đầu, Zalo tách khỏi mạng xã hội, ngày → schema.org", async () => {
    const s = await run("siteSettings");
    expect(s.brandName).toBe("Thương hiệu A");
    expect(s.slogan).toBe("Khẩu hiệu A");
    expect(s.description).toBe("Mô tả mặc định");
    expect(s.phones).toEqual([
      { number: "0900 000 001", e164: "+84900000001", label: "Kinh doanh" },
      { number: "0900 000 002", e164: "+84900000002" },
    ]);
    expect(s.zalo).toEqual({ url: "https://zalo.me/0900000001", label: "Zalo" });
    expect(s.socials).toEqual([{ platform: "facebook", url: "https://facebook.com/a", label: "Fanpage A", confirmed: true }]);
    expect(s.openingHours[0]).toEqual({
      label: "Thứ 2 – Thứ 7",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    });
    expect(s.openingHours[1].label).toBe("Chủ nhật");
    expect(s.address).toEqual({
      display: "KCN A, xã B, Hà Nội",
      street: "KCN A, xã B",
      locality: "Hà Nội",
      region: "Hà Nội",
      country: "VN",
      mapUrl: "https://maps.app.goo.gl/x",
      geo: { lat: 20.8, lng: 105.8 },
    });
    expect(s.logo).toEqual({ url: "https://cdn.sanity.io/images/p/d/image-logo-1440x701-png.png", width: 1440, height: 701, alt: "Logo thương hiệu A" });
    expect(s.defaultOgImage?.width).toBe(1200);
    expect(s.titleTemplate).toBe("%s | A");
    expect(s.floatingContact).toEqual({ enabled: true, showCall: true, showZalo: false, showFacebook: true });
    expect(s).toMatchObject({ taxId: "0123456789", foundingYear: 2020, gtmId: "GTM-ABC123", areaServed: "Việt Nam" });
  });

  it("header: reference → đường dẫn theo loại, anchor tách riêng; Gọi / Zalo lấy từ siteSettings", async () => {
    const h = await run("header");
    const [products, cat, post, zalo, ext] = h.items;
    expect(products.link).toEqual({ kind: "internal", path: "/san-pham" });
    expect(products.children.map((c) => c.link)).toEqual([
      { kind: "internal", path: "/san-pham", anchor: "fomex-3-ly" },
      { kind: "internal", path: "/san-pham", anchor: "bang-quy-cach" },
      { kind: "internal", path: "/san-pham", anchor: "ung-dung-backdrop-su-kien" },
    ]);
    expect(cat.link).toEqual({ kind: "internal", path: "/tin-tuc?chu-de=tin-win" });
    expect(post.link).toEqual({ kind: "internal", path: "/tin-tuc/bai-moi" });
    expect(zalo.link).toEqual({ kind: "external", url: "https://zalo.me/0900000001" });
    expect(ext.link).toEqual({ kind: "external", url: "https://shopee.vn/a" });
    expect(h.cta).toEqual({ label: "Gọi ngay", link: { kind: "external", url: "tel:+84900000001" }, children: [] });
  });

  it("footer: cột, liên kết pháp lý, cờ khối liên hệ", async () => {
    const f = await run("footer");
    expect(f.columns).toEqual([{ title: "Khám phá", items: [{ label: "Báo giá", link: { kind: "internal", path: "/bao-gia" }, children: [] }] }]);
    expect(f.legalLinks.map((l) => l.link)).toEqual([{ kind: "internal", path: "/chinh-sach-bao-mat" }]);
    expect(f).toMatchObject({ intro: "Giới thiệu", showContact: false, copyright: "© {year} {legalName}" });
  });

  it("homePage + notFoundPage", async () => {
    const h = await run("homePage");
    expect(h.hero.titleLines).toEqual(["Dòng 1", "Dòng 2"]);
    expect(h.hero.lead).toBe("Đoạn mở");
    expect(h.hero.cta?.link).toEqual({ kind: "internal", path: "/bao-gia" });
    expect(h.hero.secondaryCta?.link).toEqual({ kind: "external", url: "https://facebook.com/a" });
    expect(h.hero.image?.alt).toBe("Ảnh hero A");
    expect(h.seo).toEqual({ title: "Trang chủ A", noindex: false });

    const n = await run("notFoundPage");
    expect(n).toEqual({ title: "Không tìm thấy", body: "Mời xem", links: [{ label: "Sản phẩm", link: { kind: "internal", path: "/san-pham" }, children: [] }] });
  });

  it("posts: mới nhất trước, kèm chủ đề, updatedAt rơi về _updatedAt", async () => {
    const p = await run("posts");
    expect(p.map((x) => x.slug)).toEqual(["bai-moi", "bai-cu"]);
    expect(p[0]).toMatchObject({ category: { slug: "kien-thuc-vat-lieu", title: "Kiến thức vật liệu" }, noindex: true, updatedAt: "2026-09-05T00:00:00Z" });
    expect(p[0].image?.alt).toBe("Ảnh bài mới");
    expect(p[1].updatedAt).toBe("2026-07-02T00:00:00Z");
  });

  it("productGroups / applications / categories: theo order, không lọt trường ngoài schema (giá)", async () => {
    const g = await run("productGroups");
    expect(g.map((x) => x.slug)).toEqual(["fomex-3-ly", "fomex-5-ly"]);
    expect(g[0].actualRangeMm).toEqual({ min: 2.4, max: 2.7 });
    expect(g[0].specs).toEqual([{ label: "3 ly thiếu", grade: "thieu", actualThicknessMm: 2.4 }]);
    expect(g[1].specs).toEqual([]);

    const a = await run("applications");
    expect(a[0]).toMatchObject({ slug: "backdrop-su-kien", recommendedGroups: ["fomex-3-ly", "fomex-5-ly"] });
    expect(a[0].album).toHaveLength(1);

    const c = await run("categories");
    expect(c.map((x) => x.slug)).toEqual(["kien-thuc-vat-lieu", "tin-win"]);
  });

  it("aboutPage: ý chờ xác nhận bị lọc; link nội bộ trong Portable Text → href; link không an toàn bị bỏ", async () => {
    const a = await run("aboutPage");
    expect(a.capability?.items.map((i) => i.title)).toEqual(["Đã xác nhận", "Mặc định"]);
    expect(a.story?.heading).toEqual({ title: "Giới thiệu" });
    const markDefs = (a.story?.body[0] as unknown as { markDefs: { _key: string; href?: string }[] }).markDefs;
    expect(markDefs).toEqual([expect.objectContaining({ _key: "m1", href: "/san-pham" })]);
    expect(a.factory?.processSteps).toEqual([{ title: "Đùn ép" }]);
    expect(a.factory?.gallery[0].alt).toBe("Xưởng");
    expect(a.messageForm).toEqual({ heading: "Tiêu đề riêng" });
  });

  it("privacyPage chưa có thân bài / ngày → null (route 404, không vào sitemap)", async () => {
    const value = await evaluate(parse(QUERIES.privacyPage), { dataset });
    expect(NORMALIZERS.privacyPage(await value.get())).toBeNull();
  });

  it("leadForms: câu chữ + ghi chú có link chính sách", async () => {
    const l = await run("leadForms");
    expect(l.contact.roleOptions).toEqual(["Đại lý"]);
    const md = (l.privacyNote?.[0] as unknown as { markDefs: { href?: string }[] }).markDefs;
    expect(md[0].href).toBe("/chinh-sach-bao-mat");
  });

  it("POST_QUERY: một bài theo slug, có thân bài, ảnh trong bài, bài liên quan, SEO riêng", async () => {
    const value = await evaluate(parse(POST_QUERY), { dataset, params: { slug: "bai-moi" } });
    const p = postDetail(await value.get());
    expect(p).toMatchObject({ slug: "bai-moi", seoTitle: "SEO bài mới", seoDescription: "Mô tả bài mới", relatedSlugs: ["bai-cu"] });
    expect(p?.body[1]).toMatchObject({ _type: "figure", alt: "Ảnh trong bài", caption: "Chú thích", width: 1200 });
    const none = await evaluate(parse(POST_QUERY), { dataset, params: { slug: "khong-co" } });
    expect(await none.get()).toBeNull();
  });
});
