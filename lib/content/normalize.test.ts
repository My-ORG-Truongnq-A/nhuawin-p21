import { describe, expect, it } from "vitest";
import { DEFAULT_POSTS_PER_PAGE, NORMALIZERS, feature, richText, safeHref } from "./normalize";

describe("chuẩn hoá tại cửa nội dung (KT-01)", () => {
  it("siteSettings: null / chuỗi rỗng → bỏ; mảng null → []; social mặc định chưa xác nhận", () => {
    const s = NORMALIZERS.siteSettings({
      brandName: "  Thương hiệu A ",
      legalName: "",
      phones: [{ number: "0900 000 000" }, null, { number: "" }],
      socials: [{ platform: "facebook", url: "https://facebook.com/a", label: "Fanpage" }],
      openingHours: null,
      logo: { url: "https://cdn.sanity.io/a.png", width: 600, height: 300, alt: null },
      address: { street: "Số 1", country: null },
    });
    expect(s).not.toBeNull();
    expect(s!.brandName).toBe("Thương hiệu A");
    expect(s!.legalName).toBeUndefined();
    expect(s!.phones).toEqual([{ number: "0900 000 000" }]);
    expect(s!.socials[0].confirmed).toBe(false);
    expect(s!.openingHours).toEqual([]);
    expect(s!.logo?.alt).toBe("Thương hiệu A");
    expect(s!.address?.country).toBe("VN");
    expect(s!.schemaType).toBe("Organization");
  });

  it("siteSettings thiếu tên thương hiệu → null (cửa sẽ rơi về seed)", () => {
    expect(NORMALIZERS.siteSettings({ brandName: null })).toBeNull();
    expect(NORMALIZERS.siteSettings(null)).toBeNull();
  });

  it("ảnh thiếu url / kích thước → bỏ", () => {
    const s = NORMALIZERS.siteSettings({ brandName: "A", logo: { url: "x.png" } });
    expect(s!.logo).toBeUndefined();
  });

  it("header: bỏ mục thiếu nhãn hoặc link, giữ thứ tự, children mặc định []", () => {
    const h = NORMALIZERS.header({
      items: [
        { label: "Sản phẩm", link: { kind: "internal", path: "/san-pham" }, children: null },
        { label: "", link: { kind: "internal", path: "/x" } },
        { label: "Tin tức", link: null },
        { label: "Ngoài", link: { kind: "external", url: "https://a.vn" } },
      ],
      cta: { label: "Nhận báo giá", link: { kind: "internal", path: "/bao-gia" } },
    });
    expect(h!.items.map((i) => i.label)).toEqual(["Sản phẩm", "Ngoài"]);
    expect(h!.items[0].children).toEqual([]);
    expect(h!.cta?.label).toBe("Nhận báo giá");
  });

  it("link nội bộ không bắt đầu bằng '/' hoặc external không phải http(s) → bỏ", () => {
    const h = NORMALIZERS.header({
      items: [
        { label: "A", link: { kind: "internal", path: "san-pham" } },
        { label: "B", link: { kind: "external", url: "javascript:alert(1)" } },
      ],
    });
    expect(h!.items).toEqual([]);
  });

  it("posts: null → [], bỏ bài thiếu slug / tiêu đề, noindex mặc định false", () => {
    expect(NORMALIZERS.posts(null)).toEqual([]);
    const p = NORMALIZERS.posts([{ slug: "a", title: "Bài A" }, { slug: null, title: "B" }]);
    expect(p).toEqual([{ slug: "a", title: "Bài A", noindex: false }]);
  });

  it("homePage: thiếu tiêu đề hero → null", () => {
    expect(NORMALIZERS.homePage({ hero: { titleLines: [] } })).toBeNull();
    const h = NORMALIZERS.homePage({ hero: { titleLines: ["Dòng 1", null, "Dòng 2"] }, seo: null });
    expect(h!.hero.titleLines).toEqual(["Dòng 1", "Dòng 2"]);
    expect(h!.seo.noindex).toBe(false);
  });
});

describe("chuẩn hoá khối trang (P4)", () => {
  it("newsPage: postsPerPage ngoài 6–24 hoặc không nguyên → mặc định", () => {
    for (const v of [3, 30, 7.5, null]) expect(NORMALIZERS.newsPage({ title: "Tin", postsPerPage: v })!.postsPerPage).toBe(DEFAULT_POSTS_PER_PAGE);
    expect(NORMALIZERS.newsPage({ title: "Tin", postsPerPage: 12 })!.postsPerPage).toBe(12);
  });

  it("feature chờ xác nhận không bao giờ ra trang (REQ-14)", () => {
    expect(feature({ title: "Sản lượng", verification: "needs_confirmation" })).toBeUndefined();
    expect(feature({ title: "Đo kiểm", verification: "confirmed" })).toEqual({ title: "Đo kiểm" });
  });

  it("leadForms thiếu câu bắt buộc → null (cửa rơi về seed)", () => {
    expect(NORMALIZERS.leadForms({ successMessage: "x" })).toBeNull();
  });

  it("safeHref chỉ nhận path nội bộ, http(s), mailto:, tel:", () => {
    expect(["/san-pham#a", "https://a.vn", "mailto:a@b.vn", "tel:+84900000000"].map(safeHref)).not.toContain(undefined);
    expect(["javascript:alert(1)", "//evil.com", "", null].map(safeHref)).toEqual([undefined, undefined, undefined, undefined]);
  });

  it("richText: bỏ phần tử thiếu _key; figure thiếu ảnh bị bỏ", () => {
    expect(richText([{ _type: "block" }, { _type: "figure", _key: "f" }, { _type: "table", _key: "t", rows: [] }])).toEqual([
      { _type: "table", _key: "t", rows: [] },
    ]);
  });
});
