import { describe, expect, it } from "vitest";
import { buildHeaders, SECURITY_HEADERS } from "./security-headers";

const value = (key: string) => SECURITY_HEADERS.find((h) => h.key === key)?.value;

describe("SECURITY_HEADERS (BM-01)", () => {
  it("đủ header bắt buộc", () => {
    expect(value("X-Content-Type-Options")).toBe("nosniff");
    expect(value("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(value("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(value("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    expect(value("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    );
  });
});

describe("buildHeaders — X-Robots-Tag hai lớp (SEO-01)", () => {
  const noindex = (rules: ReturnType<typeof buildHeaders>) =>
    rules.filter((r) => r.headers.some((h) => h.key === "X-Robots-Tag"));

  it("không được index → noindex cho MỌI route, không điều kiện", () => {
    const rules = noindex(buildHeaders({ indexable: false, canonicalHost: "www.example.vn" }));
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/:path*");
    expect(rules[0].missing).toBeUndefined();
    expect(rules[0].headers[0].value).toBe("noindex, nofollow");
  });

  it("được index → noindex khi host khác host chuẩn, và luôn noindex /studio", () => {
    const rules = noindex(buildHeaders({ indexable: true, canonicalHost: "www.example.vn" }));
    const byHost = rules.find((r) => r.source === "/:path*");
    expect(byHost?.missing).toEqual([{ type: "host", value: "www.example.vn" }]);
    expect(rules.some((r) => r.source === "/studio/:path*")).toBe(true);
  });

  it("header bảo mật áp mọi route", () => {
    const all = buildHeaders({ indexable: true, canonicalHost: "www.example.vn" });
    expect(all[0]).toMatchObject({ source: "/:path*", headers: SECURITY_HEADERS });
  });
});
