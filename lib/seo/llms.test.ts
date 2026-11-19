import { describe, expect, it } from "vitest";
import { SEED } from "@/seed/content";
import { buildLlmsTxt } from "./llms";

const siteUrl = "https://www.example.vn";
const routes = [
  { path: "/", title: "Trang chủ", enabled: true },
  { path: "/san-pham", title: "Sản phẩm", enabled: true },
  { path: "/hop-tac", title: "Hợp tác", enabled: false },
];

describe("buildLlmsTxt (T2.6, REQ-25, GEO-05)", () => {
  const txt = buildLlmsTxt({ settings: SEED.siteSettings, siteUrl, routes, posts: [] });

  it("có tên, mô tả một đoạn, khối thông tin nhanh từ siteSettings", () => {
    expect(txt.startsWith(`# ${SEED.siteSettings.brandName}\n`)).toBe(true);
    expect(txt).toContain(`> ${SEED.siteSettings.description}`);
    expect(txt).toContain(SEED.siteSettings.email!);
    expect(txt).toContain(SEED.siteSettings.phones[0].number);
    expect(txt).toContain(SEED.siteSettings.openingHours[0].label);
  });

  it("chỉ liệt kê route đang bật, URL tuyệt đối", () => {
    expect(txt).toContain("- [Sản phẩm](https://www.example.vn/san-pham)");
    expect(txt).not.toContain("/hop-tac");
  });

  it("đổi SĐT trong siteSettings → nội dung đổi theo", () => {
    const t = buildLlmsTxt({
      settings: { ...SEED.siteSettings, phones: [{ number: "0900 111 222" }] },
      siteUrl,
      routes,
      posts: [],
    });
    expect(t).toContain("0900 111 222");
    expect(t).not.toContain(SEED.siteSettings.phones[0].number);
  });

  it("liệt kê bài đã publish, bỏ bài noindex", () => {
    const t = buildLlmsTxt({
      settings: SEED.siteSettings,
      siteUrl,
      routes,
      posts: [
        { slug: "a", title: "Bài A", excerpt: "Tóm tắt A", noindex: false },
        { slug: "b", title: "Bài B", noindex: true },
      ],
    });
    expect(t).toContain("- [Bài A](https://www.example.vn/tin-tuc/a): Tóm tắt A");
    expect(t).not.toContain("Bài B");
  });
});
