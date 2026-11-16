import { describe, expect, it } from "vitest";
import { absoluteUrl, parseSiteUrl } from "./site-url";

describe("parseSiteUrl", () => {
  it("nhận origin https không có '/' cuối", () => {
    expect(parseSiteUrl("https://www.example.vn", { production: true })).toBe(
      "https://www.example.vn",
    );
  });

  it.each([
    ["có '/' cuối", "https://www.example.vn/"],
    ["có path", "https://www.example.vn/vi"],
    ["không phải http(s)", "ftp://example.vn"],
    ["không phải URL", "example.vn"],
    ["có query", "https://example.vn?x=1"],
  ])("lỗi rõ khi %s", (_, raw) => {
    expect(() => parseSiteUrl(raw, { production: false })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("thiếu ở production → lỗi (fail-closed, KT-11)", () => {
    expect(() => parseSiteUrl(undefined, { production: true })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() => parseSiteUrl("  ", { production: true })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("thiếu ngoài production → localhost cho dev", () => {
    expect(parseSiteUrl(undefined, { production: false })).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  const base = "https://www.example.vn";

  it.each([
    ["/", "https://www.example.vn"],
    ["", "https://www.example.vn"],
    ["/san-pham", "https://www.example.vn/san-pham"],
    ["san-pham/", "https://www.example.vn/san-pham"],
    ["/bao-gia?loai=5-ly", "https://www.example.vn/bao-gia?loai=5-ly"],
  ])("%s → %s", (path, expected) => {
    expect(absoluteUrl(path, base)).toBe(expected);
  });

  it("giữ nguyên URL tuyệt đối", () => {
    expect(absoluteUrl("https://cdn.sanity.io/a.png", base)).toBe("https://cdn.sanity.io/a.png");
  });
});
