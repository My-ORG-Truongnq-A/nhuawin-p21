import { describe, expect, it } from "vitest";
import { isCurrent, resolveLink } from "./resolve-link";

describe("resolveLink (T1.3)", () => {
  it.each([
    [{ kind: "internal", path: "/san-pham" } as const, { href: "/san-pham", external: false }],
    [{ kind: "internal", path: "/san-pham", anchor: "bang-quy-cach" } as const, { href: "/san-pham#bang-quy-cach", external: false }],
    [{ kind: "internal", path: "/ve-win", anchor: "#nha-may" } as const, { href: "/ve-win#nha-may", external: false }],
    [{ kind: "external", url: "https://zalo.me/x" } as const, { href: "https://zalo.me/x", external: true }],
  ])("%j", (link, expected) => {
    expect(resolveLink(link)).toEqual(expected);
  });
});

describe("isCurrent", () => {
  it("đúng trang hoặc trang con; trang chủ chỉ khớp chính nó; bỏ qua anchor", () => {
    expect(isCurrent("/san-pham", { kind: "internal", path: "/san-pham" })).toBe(true);
    expect(isCurrent("/tin-tuc/bai-a", { kind: "internal", path: "/tin-tuc" })).toBe(true);
    expect(isCurrent("/san-pham", { kind: "internal", path: "/" })).toBe(false);
    expect(isCurrent("/san-pham", { kind: "internal", path: "/san-pham", anchor: "ung-dung" })).toBe(false);
    expect(isCurrent("/", { kind: "external", url: "https://a.vn" })).toBe(false);
  });
});
