import { describe, expect, it } from "vitest";
import { AI_CRAWLERS } from "./ai-crawlers";
import { buildRobots } from "./robots";

const siteUrl = "https://www.example.vn";

describe("buildRobots (T2.3, REQ-24, GEO-01)", () => {
  it("không được index → đúng một nhóm '*' Disallow: /, không có Sitemap", () => {
    expect(buildRobots({ indexable: false, siteUrl })).toEqual({
      rules: [{ userAgent: "*", disallow: "/" }],
    });
  });

  it("được index → nhóm '*' + mỗi nhóm crawler AI lặp lại disallow /studio, /api/", () => {
    const r = buildRobots({ indexable: true, siteUrl });
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules[0]).toEqual({ userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] });
    for (const rule of rules.slice(1)) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toEqual(["/studio", "/api/"]);
    }
    expect(r.sitemap).toBe("https://www.example.vn/sitemap.xml");
  });

  it("đủ bot tìm kiếm, bot người dùng hỏi, bot huấn luyện; không token cũ", () => {
    const r = buildRobots({ indexable: true, siteUrl });
    const agents = (Array.isArray(r.rules) ? r.rules : [r.rules]).flatMap((x) => x.userAgent ?? []);
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "ChatGPT-User", "Claude-User", "GPTBot", "ClaudeBot"]) {
      expect(agents).toContain(bot);
    }
    expect(agents).not.toContain("Claude-Web");
    expect(agents).not.toContain("anthropic-ai");
  });

  it("nhóm bị đặt chặn (OQ-SEO-04) → Disallow: / cho nhóm đó, không sửa logic", () => {
    const crawlers = AI_CRAWLERS.map((g) => (g.purpose === "training" ? { ...g, allow: false } : g));
    const r = buildRobots({ indexable: true, siteUrl, crawlers });
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const training = rules.find((x) => [x.userAgent].flat().includes("GPTBot"));
    expect(training).toEqual({ userAgent: expect.any(Array), disallow: "/" });
  });
});
