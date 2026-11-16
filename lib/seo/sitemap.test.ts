import { describe, expect, it } from "vitest";
import type { PostSummary } from "@/lib/content/types";
import { buildSitemapIndex, buildUrlset, pageEntries, postEntries } from "./sitemap";

const siteUrl = "https://www.example.vn";

describe("sitemap (T2.4, REQ-22, SEO-06)", () => {
  it("urlset: URL tuyệt đối, lastmod khi có, escape & trong URL ảnh, encodeURI path tiếng Việt", () => {
    const xml = buildUrlset(
      [
        { path: "/", lastmod: "2026-11-01T00:00:00Z" },
        { path: "/tin-tuc/bài-mới", images: ["https://cdn.sanity.io/a.jpg?w=1200&fit=max"] },
      ],
      siteUrl,
    );
    expect(xml).toContain("<loc>https://www.example.vn</loc>");
    expect(xml).toContain("<lastmod>2026-11-01T00:00:00Z</lastmod>");
    expect(xml).toContain("<loc>https://www.example.vn/tin-tuc/b%C3%A0i-m%E1%BB%9Bi</loc>");
    expect(xml).toContain("<image:loc>https://cdn.sanity.io/a.jpg?w=1200&amp;fit=max</image:loc>");
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });

  it("bỏ URL có '?', /studio, /api/; gộp trùng path", () => {
    const xml = buildUrlset(
      [{ path: "/" }, { path: "/" }, { path: "/tin-tuc?trang=2" }, { path: "/studio" }, { path: "/api/revalidate" }],
      siteUrl,
    );
    expect(xml.match(/<url>/g)).toHaveLength(1);
  });

  it("index trỏ tệp con tuyệt đối", () => {
    const xml = buildSitemapIndex(["/sitemaps/pages.xml", "/sitemaps/posts.xml"], siteUrl);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<loc>https://www.example.vn/sitemaps/pages.xml</loc>");
    expect(xml).toContain("<loc>https://www.example.vn/sitemaps/posts.xml</loc>");
  });

  it("pageEntries: chỉ route đang bật và không noindex", () => {
    const entries = pageEntries([
      { path: "/", title: "Trang chủ", enabled: true },
      { path: "/san-pham", title: "Sản phẩm", enabled: false },
      { path: "/tim-kiem", title: "Tìm kiếm", enabled: true, noindex: true },
    ]);
    expect(entries.map((e) => e.path)).toEqual(["/"]);
  });

  it("postEntries: bỏ bài noindex, lastmod = updatedAt ?? publishedAt, ảnh tuyệt đối", () => {
    const posts: PostSummary[] = [
      { slug: "a", title: "A", updatedAt: "2026-10-01", noindex: false, image: { url: "/images/a.jpg", width: 1, height: 1, alt: "" } },
      { slug: "b", title: "B", publishedAt: "2026-09-01", noindex: false },
      { slug: "c", title: "C", noindex: true },
    ];
    expect(postEntries(posts, siteUrl)).toEqual([
      { path: "/tin-tuc/a", lastmod: "2026-10-01", images: ["https://www.example.vn/images/a.jpg"] },
      { path: "/tin-tuc/b", lastmod: "2026-09-01", images: [] },
    ]);
  });
});
