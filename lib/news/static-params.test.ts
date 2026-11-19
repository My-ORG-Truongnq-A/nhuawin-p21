import { describe, expect, it } from "vitest";
import { isPlaceholderPostSlug, PLACEHOLDER_POST_SLUG, postStaticParams } from "./static-params";

describe("postStaticParams (BUILD-EMPTY-CMS)", () => {
  it("CMS trống → đúng một slug giữ chỗ (cacheComponents đòi ≥ 1 param)", () => {
    expect(postStaticParams([])).toEqual([{ slug: PLACEHOLDER_POST_SLUG }]);
  });

  it("có bài → đúng slug các bài, không kèm slug giữ chỗ", () => {
    expect(postStaticParams([{ slug: "a" }, { slug: "b" }])).toEqual([{ slug: "a" }, { slug: "b" }]);
  });

  it("bài trùng slug giữ chỗ bị bỏ; còn lại rỗng thì vẫn trả slug giữ chỗ", () => {
    expect(postStaticParams([{ slug: PLACEHOLDER_POST_SLUG }, { slug: "a" }])).toEqual([{ slug: "a" }]);
    expect(postStaticParams([{ slug: PLACEHOLDER_POST_SLUG }])).toEqual([{ slug: PLACEHOLDER_POST_SLUG }]);
  });

  it("nhận diện slug giữ chỗ", () => {
    expect(isPlaceholderPostSlug(PLACEHOLDER_POST_SLUG)).toBe(true);
    expect(isPlaceholderPostSlug("a")).toBe(false);
  });
});
