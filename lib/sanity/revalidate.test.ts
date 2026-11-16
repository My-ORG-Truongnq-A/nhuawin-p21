import { describe, expect, it } from "vitest";
import { CONTENT_TYPES } from "@/lib/content/tags";
import { allDocumentTypes } from "@/sanity/schemaTypes";
import { planRevalidation } from "./revalidate";

describe("planRevalidation (T3.7, KT-02)", () => {
  it("siteSettings → tag siteSettings (mọi trang đọc tag này)", () => {
    expect(planRevalidation({ _type: "siteSettings", _id: "siteSettings" })).toEqual({
      tags: ["siteSettings"],
      paths: [],
    });
  });

  it("post → tag post + /, /tin-tuc, /tin-tuc/{slug}", () => {
    expect(planRevalidation({ _type: "post", _id: "abc", slug: { current: "bai-a" } })).toEqual({
      tags: ["post"],
      paths: ["/", "/tin-tuc", "/tin-tuc/bai-a"],
    });
  });

  it("homePage → tag homePage + /", () => {
    expect(planRevalidation({ _type: "homePage", _id: "homePage" })).toEqual({ tags: ["homePage"], paths: ["/"] });
  });

  it.each([
    ["draft", { _type: "post", _id: "drafts.abc" }],
    ["lead", { _type: "lead", _id: "x" }],
    ["asset", { _type: "sanity.imageAsset", _id: "image-x" }],
    ["loại lạ", { _type: "khong-co", _id: "x" }],
    ["thiếu _type", { _id: "x" }],
  ])("bỏ qua %s", (_, body) => {
    expect(planRevalidation(body)).toBeNull();
  });

  it.each([
    ["productGroup", ["/", "/san-pham", "/bao-gia"]],
    ["application", ["/", "/san-pham"]],
    ["category", ["/tin-tuc"]],
    ["productsPage", ["/san-pham"]],
    ["privacyPage", ["/chinh-sach-bao-mat"]],
    ["footer", []],
    ["leadForms", []],
    ["redirectSettings", []],
  ])("%s → tag cùng tên + %j", (type, paths) => {
    expect(planRevalidation({ _type: type, _id: type })).toEqual({ tags: [type], paths });
  });

  it("CONTENT_TYPES khớp đúng 18 loại tài liệu trong schema", () => {
    expect([...CONTENT_TYPES].sort()).toEqual(allDocumentTypes.map((t) => t.name).sort());
  });
});
