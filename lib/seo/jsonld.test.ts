import { describe, expect, it } from "vitest";
import type { SiteSettings } from "@/lib/content/types";
import { SEED } from "@/seed/content";
import { buildGraph, serializeJsonLd } from "./jsonld";

const siteUrl = "https://www.example.vn";
type Node = Record<string, unknown>;
const nodes = (g: ReturnType<typeof buildGraph>) => g["@graph"] as Node[];
const byType = (g: ReturnType<typeof buildGraph>, t: string) => nodes(g).find((n) => n["@type"] === t);

describe("buildGraph (T2.5, REQ-26, GEO-02)", () => {
  const graph = buildGraph({
    settings: SEED.siteSettings,
    siteUrl,
    page: { path: "/san-pham", name: "Sản phẩm", breadcrumbs: [{ name: "Sản phẩm", path: "/san-pham" }] },
  });

  it("một @graph nối bằng @id: tổ chức, WebSite, WebPage, BreadcrumbList", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    const org = byType(graph, "LocalBusiness")!;
    expect(org["@id"]).toBe("https://www.example.vn/#organization");
    expect(byType(graph, "WebSite")).toMatchObject({ publisher: { "@id": org["@id"] }, inLanguage: "vi" });
    expect(byType(graph, "WebPage")).toMatchObject({
      "@id": "https://www.example.vn/san-pham#webpage",
      isPartOf: { "@id": "https://www.example.vn/#website" },
      breadcrumb: { "@id": "https://www.example.vn/san-pham#breadcrumb" },
    });
    const crumbs = byType(graph, "BreadcrumbList")!.itemListElement as Node[];
    expect(crumbs.map((c) => c.item)).toEqual(["https://www.example.vn", "https://www.example.vn/san-pham"]);
  });

  it("mọi URL tuyệt đối", () => {
    const urls = JSON.stringify(graph).match(/"(url|item|logo|image|@id|hasMap)":"[^"]*"/g) ?? [];
    for (const u of urls) expect(u).toMatch(/":"https:\/\//);
  });

  it("sameAs không chứa Facebook khi chưa xác nhận (MI-16)", () => {
    expect(byType(graph, "LocalBusiness")!.sameAs).toBeUndefined();
    const confirmed: SiteSettings = {
      ...SEED.siteSettings,
      socials: SEED.siteSettings.socials.map((s) => ({ ...s, confirmed: true })),
    };
    const g = buildGraph({ settings: confirmed, siteUrl, page: { path: "/", name: "Trang chủ" } });
    expect(byType(g, "LocalBusiness")!.sameAs).toEqual([SEED.siteSettings.socials[0].url]);
  });

  it("trường chưa có dữ kiện bị bỏ, không để chuỗi rỗng", () => {
    const minimal: SiteSettings = {
      brandName: "A",
      schemaType: "Organization",
      phones: [],
      socials: [],
      openingHours: [],
      floatingContact: { enabled: true, showCall: true, showZalo: true, showFacebook: true },
    };
    const org = byType(buildGraph({ settings: minimal, siteUrl, page: { path: "/", name: "A" } }), "Organization")!;
    expect(Object.keys(org).sort()).toEqual(["@id", "@type", "name", "url"]);
    expect(JSON.stringify(org)).not.toContain('""');
  });

  it("đổi SĐT trong siteSettings → telephone đổi theo (E.164)", () => {
    const s: SiteSettings = { ...SEED.siteSettings, phones: [{ number: "0900 111 222" }] };
    const org = byType(buildGraph({ settings: s, siteUrl, page: { path: "/", name: "A" } }), "LocalBusiness")!;
    expect(org.telephone).toBe("+84900111222");
  });

  it("trang chủ không có BreadcrumbList", () => {
    const g = buildGraph({ settings: SEED.siteSettings, siteUrl, page: { path: "/", name: "Trang chủ" } });
    expect(byType(g, "BreadcrumbList")).toBeUndefined();
  });
});

describe("serializeJsonLd", () => {
  it("escape '<' để không thoát khỏi thẻ script", () => {
    expect(serializeJsonLd({ a: "</script><script>x" })).not.toContain("</script>");
  });
});
