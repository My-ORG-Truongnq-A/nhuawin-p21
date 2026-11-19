import { describe, expect, it } from "vitest";
import { SEED } from "@/seed/content";
import { buildMetadata, formatTitle, type MetaContext } from "./metadata";

const ctx: MetaContext = {
  brandName: "Nhựa WIN Việt Nam",
  siteUrl: "https://www.example.vn",
  indexable: true,
  defaultOgImage: { url: "/images/brand/win-social-v2.png", width: 1200, height: 630, alt: "OG" },
};

describe("canonical trang lọc", () => {
  it("keepQuery giữ query đã chuẩn hoá; mặc định bỏ query", () => {
    const ctx = { brandName: "WIN", siteUrl: "https://a.vn", indexable: true };
    expect(buildMetadata({ path: "/tin-tuc?chu-de=tin-win&trang=2", keepQuery: true }, ctx).alternates?.canonical).toBe(
      "https://a.vn/tin-tuc?chu-de=tin-win&trang=2",
    );
    expect(buildMetadata({ path: "/bao-gia?loai=fomex-3-ly" }, ctx).alternates?.canonical).toBe("https://a.vn/bao-gia");
  });
});

describe("formatTitle", () => {
  it.each([
    [undefined, "Nhựa WIN Việt Nam"],
    ["Sản phẩm", "Sản phẩm | Nhựa WIN Việt Nam"],
    ["Nhựa WIN Việt Nam — Nhà sản xuất", "Nhựa WIN Việt Nam — Nhà sản xuất"],
  ])("%s → %s", (title, expected) => {
    expect(formatTitle(title, ctx.brandName)).toBe(expected);
  });
});

describe("canonical trang lọc", () => {
  it("keepQuery giữ query đã chuẩn hoá; mặc định bỏ query", () => {
    const ctx = { brandName: "WIN", siteUrl: "https://a.vn", indexable: true };
    expect(buildMetadata({ path: "/tin-tuc?chu-de=tin-win&trang=2", keepQuery: true }, ctx).alternates?.canonical).toBe(
      "https://a.vn/tin-tuc?chu-de=tin-win&trang=2",
    );
    expect(buildMetadata({ path: "/bao-gia?loai=fomex-3-ly" }, ctx).alternates?.canonical).toBe("https://a.vn/bao-gia");
  });
});

describe("buildMetadata (T2.1, REQ-13)", () => {
  it("canonical + og:url tuyệt đối từ SITE_URL, bỏ query", () => {
    const m = buildMetadata({ path: "/bao-gia?loai=5-ly", title: "Nhận báo giá" }, ctx);
    expect(m.alternates?.canonical).toBe("https://www.example.vn/bao-gia");
    expect(m.openGraph).toMatchObject({ url: "https://www.example.vn/bao-gia", locale: "vi_VN" });
  });

  it("trang chủ: canonical không có '/' cuối", () => {
    expect(buildMetadata({ path: "/" }, ctx).alternates?.canonical).toBe("https://www.example.vn");
  });

  it("og:image mặc định tuyệt đối 1200×630", () => {
    const m = buildMetadata({ path: "/" }, ctx);
    expect(m.openGraph?.images).toEqual([
      { url: "https://www.example.vn/images/brand/win-social-v2.png", width: 1200, height: 630, alt: "OG" },
    ]);
  });

  it("không xuất hreflang", () => {
    expect(buildMetadata({ path: "/" }, ctx).alternates?.languages).toBeUndefined();
  });

  it("không được index → noindex, nofollow trên MỌI trang, kể cả trang tự cho index", () => {
    const m = buildMetadata({ path: "/" }, { ...ctx, indexable: false });
    expect(m.robots).toEqual({ index: false, follow: false });
  });

  it("được index → theo trang: mặc định index; trang cờ noindex → noindex, follow", () => {
    expect(buildMetadata({ path: "/" }, ctx).robots).toEqual({ index: true, follow: true });
    expect(buildMetadata({ path: "/tin-tuc?trang=2", noindex: true }, ctx).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("title tuyệt đối (không bị template layout ghép lần nữa)", () => {
    expect(buildMetadata({ path: "/san-pham", title: "Sản phẩm" }, ctx).title).toEqual({
      absolute: "Sản phẩm | Nhựa WIN Việt Nam",
    });
  });
});

describe("canonical trang lọc", () => {
  it("keepQuery giữ query đã chuẩn hoá; mặc định bỏ query", () => {
    const ctx = { brandName: "WIN", siteUrl: "https://a.vn", indexable: true };
    expect(buildMetadata({ path: "/tin-tuc?chu-de=tin-win&trang=2", keepQuery: true }, ctx).alternates?.canonical).toBe(
      "https://a.vn/tin-tuc?chu-de=tin-win&trang=2",
    );
    expect(buildMetadata({ path: "/bao-gia?loai=fomex-3-ly" }, ctx).alternates?.canonical).toBe("https://a.vn/bao-gia");
  });
});

describe("dữ liệu SEO trong seed đạt độ dài (cảnh báo dữ liệu CMS)", () => {
  it("title trang chủ ≤ 60 ký tự, có tên thương hiệu; description 120–160", () => {
    const { title, description } = SEED.homePage.seo;
    const full = formatTitle(title, SEED.siteSettings.brandName);
    expect(full).toContain(SEED.siteSettings.brandName);
    expect(full.length).toBeLessThanOrEqual(60);
    expect(description!.length).toBeGreaterThanOrEqual(120);
    expect(description!.length).toBeLessThanOrEqual(160);
  });
});
