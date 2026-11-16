import { describe, expect, it } from "vitest";
import {
  checkEmbedUrl,
  checkHotlineToken,
  checkMinImageSize,
  checkPrimaryPhone,
  checkRedirectFrom,
  checkRedirectRules,
  checkRedirectTo,
  checkSlug,
  checkTaxId,
  checkTitleTemplate,
  hasPrivacyLink,
  imageSizeFromRef,
  isSlugLocked,
} from "./rules";

const admin = { roles: [{ name: "administrator" }] };
const editor = { roles: [{ name: "editor" }] };

describe("isSlugLocked (CM-04)", () => {
  it.each([
    ["legacy + editor → khoá", "legacy", { legacy: { path: "/tin-tuc/a" }, slug: { current: "a" } }, editor, true],
    ["legacy + admin → mở", "legacy", { legacy: { path: "/tin-tuc/a" }, slug: { current: "a" } }, admin, false],
    ["không legacy + editor → mở", "legacy", { slug: { current: "a" } }, editor, false],
    ["onceSet đã có slug + editor → khoá", "onceSet", { slug: { current: "fomex-3-ly" } }, editor, true],
    ["onceSet chưa có slug → mở", "onceSet", { slug: {} }, editor, false],
    ["onceSet + admin → mở", "onceSet", { slug: { current: "x" } }, admin, false],
    ["không có user → coi như không phải admin", "legacy", { legacy: { path: "/x" } }, undefined, true],
  ] as const)("%s", (_, mode, doc, user, locked) => {
    expect(isSlugLocked(mode, doc, user)).toBe(locked);
  });
});

describe("checkSlug", () => {
  it.each([
    [undefined, {}, true],
    [{ current: "fomex-3-ly" }, {}, true],
    [{ current: "Fomex 3" }, {}, "lỗi"],
    [{ current: "ung-dung-backdrop" }, { forbidPrefix: "ung-dung-" }, "lỗi"],
    [{ current: "backdrop-su-kien" }, { forbidPrefix: "ung-dung-" }, true],
  ] as const)("%j %j", (slug, opts, expected) => {
    const r = checkSlug(slug, opts);
    expect(r === true ? true : "lỗi").toBe(expected);
  });
});

describe("ảnh tối thiểu (CM-03)", () => {
  it("đọc kích thước từ _ref", () => {
    expect(imageSizeFromRef("image-abc123-1376x768-jpg")).toEqual({ width: 1376, height: 768 });
    expect(imageSizeFromRef("file-abc-pdf")).toBeNull();
  });

  it.each([
    ["OG đủ", "image-a-1200x630-png", { width: 1200, height: 630 }, true],
    ["OG thiếu cao", "image-a-1200x600-png", { width: 1200, height: 630 }, false],
    ["hero rộng 1376", "image-a-1376x900-jpg", { width: 1200 }, true],
    ["hero hẹp", "image-a-1024x900-jpg", { width: 1200 }, false],
    ["chưa chọn ảnh", undefined, { width: 1200 }, true],
  ])("%s", (_, ref, min, ok) => {
    expect(checkMinImageSize(ref ? { asset: { _ref: ref } } : undefined, min) === true).toBe(ok);
  });
});

describe("chuyển hướng (CM-05)", () => {
  it.each([
    ["/tin-tuc?chu-de=tin-win", true],
    ["/san-pham-cu", true],
    ["https://x.vn/a", false],
    ["//x.vn/a", false],
    ["san-pham", false],
    [undefined, false],
  ])("from %s", (from, ok) => {
    expect(checkRedirectFrom(from) === true).toBe(ok);
  });

  it.each([
    ["/san-pham", "/cu", true],
    ["https://shopee.vn/x", "/cu", true],
    ["http://x.vn", "/cu", false],
    ["/cu/", "/cu", false],
    [undefined, "/cu", false],
  ])("to %s (from %s)", (to, from, ok) => {
    expect(checkRedirectTo(to, from) === true).toBe(ok);
  });

  const live = ["/", "/san-pham", "/tin-tuc"];

  it("danh sách hợp lệ → không lỗi", () => {
    expect(checkRedirectRules([{ from: "/a", to: "/san-pham" }, { from: "/b", to: "/tin-tuc" }], live)).toEqual([]);
  });

  it("trùng from → lỗi", () => {
    expect(checkRedirectRules([{ from: "/a", to: "/san-pham" }, { from: "/a/", to: "/tin-tuc" }], live)).toHaveLength(1);
  });

  it("chuỗi hai bước → lỗi", () => {
    const errs = checkRedirectRules([{ from: "/a", to: "/b" }, { from: "/b", to: "/san-pham" }], live);
    expect(errs.some((e) => e.includes("Chuỗi"))).toBe(true);
  });

  it("from che trang thật → lỗi", () => {
    expect(checkRedirectRules([{ from: "/san-pham", to: "/tin-tuc" }], live)[0]).toContain("che trang thật");
  });
});

describe("luật nhỏ", () => {
  it.each([
    ["https://www.youtube.com/embed/abc", true],
    ["https://youtu.be/abc", true],
    ["https://www.google.com/maps/embed?pb=x", true],
    ["https://vimeo.com/1", false],
    ["http://youtube.com/x", false],
    ["không phải url", false],
  ])("embed %s", (url, ok) => {
    expect(checkEmbedUrl(url) === true).toBe(ok);
  });

  it("errorMessage phải có {hotline}", () => {
    expect(checkHotlineToken("Gọi {hotline} nhé")).toBe(true);
    expect(checkHotlineToken("Gọi cho chúng tôi")).not.toBe(true);
  });

  it("titleTemplate phải có %s", () => {
    expect(checkTitleTemplate("%s | WIN")).toBe(true);
    expect(checkTitleTemplate("WIN")).not.toBe(true);
  });

  it.each([
    ["0123456789", true],
    ["0123456789-001", true],
    ["012345678", false],
    ["0123456789001", false],
  ])("MST %s", (v, ok) => {
    expect(checkTaxId(v) === true).toBe(ok);
  });

  it("đúng một số chính", () => {
    expect(checkPrimaryPhone([{ isPrimary: true }, {}])).toBe(true);
    expect(checkPrimaryPhone([{}, {}])).not.toBe(true);
    expect(checkPrimaryPhone([{ isPrimary: true }, { isPrimary: true }])).not.toBe(true);
  });

  it("ghi chú form phải có link tới privacyPage", () => {
    const withLink = [{ _type: "block", markDefs: [{ _type: "link", internal: { _ref: "privacyPage" } }] }];
    expect(hasPrivacyLink(withLink)).toBe(true);
    expect(hasPrivacyLink([{ _type: "block", markDefs: [] }])).toBe(false);
    expect(hasPrivacyLink(undefined)).toBe(false);
  });
});
