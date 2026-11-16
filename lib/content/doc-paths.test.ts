import { describe, expect, it } from "vitest";
import { SITE_ROUTES } from "@/content/routes";
import { groqPathOf, PAGE_PATHS, pathOf } from "./doc-paths";

describe("doc-paths", () => {
  it.each([
    ["homePage", undefined, "/"],
    ["contactPage", undefined, "/lien-he"],
    ["post", "tam-fomex-la-gi", "/tin-tuc/tam-fomex-la-gi"],
    ["category", "tin-win", "/tin-tuc?chu-de=tin-win"],
    ["productGroup", "fomex-3-ly", "/san-pham#fomex-3-ly"],
    ["application", "hashtag-check-in", "/san-pham#ung-dung-hashtag-check-in"],
    ["post", undefined, undefined],
    ["siteSettings", undefined, undefined],
  ])("%s %s → %s", (type, slug, path) => {
    expect(pathOf(type, slug)).toBe(path);
  });

  it("mọi route singleton trang có trong SITE_ROUTES (một bảng route)", () => {
    const routes = SITE_ROUTES.map((r) => r.path);
    for (const p of Object.values(PAGE_PATHS)) expect(routes).toContain(p);
  });

  it("GROQ select phủ đủ mọi loại có route", () => {
    const expr = groqPathOf("internal");
    expect(expr).toContain(`internal->_type == "post" => "/tin-tuc/" + internal->slug.current`);
    expect(expr).toContain(`internal->_type == "productsPage" => "/san-pham"`);
    expect(expr.match(/=>/g)).toHaveLength(12);
  });
});
