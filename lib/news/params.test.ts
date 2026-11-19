import { describe, expect, it } from "vitest";
import { newsHref, paginate, parseNewsParams } from "./params";

const TOPICS = ["kien-thuc-vat-lieu", "tin-win", "chon-gia-cong", "danh-cho-dai-ly"];

describe("parseNewsParams (T4.6, REQ-11)", () => {
  it("không tham số → index, canonical /tin-tuc", () => {
    expect(parseNewsParams({}, TOPICS)).toEqual({ topic: undefined, page: 1, canonicalPath: "/tin-tuc", noindex: false });
  });

  it.each(TOPICS)("?chu-de=%s (URL cũ) → noindex, follow; canonical tự trỏ", (t) => {
    expect(parseNewsParams({ "chu-de": t }, TOPICS)).toMatchObject({ topic: t, noindex: true, canonicalPath: `/tin-tuc?chu-de=${t}` });
  });

  it("chỉ giữ chu-de rồi trang; bỏ utm_* và tham số lạ; trang=1 bỏ", () => {
    const q = parseNewsParams({ trang: "2", utm_source: "fb", x: "1", "chu-de": "tin-win" }, TOPICS);
    expect(q).toMatchObject({ canonicalPath: "/tin-tuc?chu-de=tin-win&trang=2" });
    expect(parseNewsParams({ trang: "1", utm_medium: "a" }, TOPICS)).toMatchObject({ canonicalPath: "/tin-tuc", noindex: false });
  });

  it("chủ đề lạ → bỏ qua (hiện tất cả)", () => {
    expect(parseNewsParams({ "chu-de": "khong-co" }, TOPICS)).toMatchObject({ topic: undefined, canonicalPath: "/tin-tuc" });
  });

  it.each(["0", "-1", "abc", "2.5"])("?trang=%s → 404", (t) => {
    expect(parseNewsParams({ trang: t }, TOPICS)).toBe("not-found");
  });
});

describe("paginate", () => {
  const posts = Array.from({ length: 100 }, (_, i) => i);
  it("100 bài / 9 mỗi trang → 12 trang; trang cuối 1 bài; vượt → 404", () => {
    expect(paginate(posts, 1, 9)).toMatchObject({ totalPages: 12, items: posts.slice(0, 9) });
    expect(paginate(posts, 12, 9)).toMatchObject({ items: [99] });
    expect(paginate(posts, 13, 9)).toBe("not-found");
  });

  it("danh sách rỗng vẫn có trang 1", () => {
    expect(paginate([], 1, 9)).toEqual({ items: [], totalPages: 1 });
  });
});

describe("newsHref", () => {
  it("thứ tự chu-de rồi trang", () => expect(newsHref("tin-win", 3)).toBe("/tin-tuc?chu-de=tin-win&trang=3"));
});
