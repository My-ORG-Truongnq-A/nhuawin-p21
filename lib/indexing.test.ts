import { describe, expect, it } from "vitest";
import { indexingAllowed } from "./indexing";

const prod = {
  VERCEL_ENV: "production",
  ALLOW_INDEXING: "1",
  NEXT_PUBLIC_SITE_URL: "https://www.example.vn",
};

describe("indexingAllowed (SEO-01, REQ-12)", () => {
  it.each(["1", "true"])("production + cờ %s + host riêng → cho index", (flag) => {
    expect(indexingAllowed({ ...prod, ALLOW_INDEXING: flag })).toBe(true);
    expect(indexingAllowed({ ...prod, ALLOW_INDEXING: flag }, "www.example.vn")).toBe(true);
  });

  it.each([
    ["preview luôn false", { ...prod, VERCEL_ENV: "preview" }],
    ["development", { ...prod, VERCEL_ENV: "development" }],
    ["thiếu VERCEL_ENV", { ...prod, VERCEL_ENV: undefined }],
    ["thiếu cờ", { ...prod, ALLOW_INDEXING: undefined }],
    ["cờ 0", { ...prod, ALLOW_INDEXING: "0" }],
    ["cờ lạ", { ...prod, ALLOW_INDEXING: "yes" }],
    ["host chính là *.vercel.app (Q-25)", { ...prod, NEXT_PUBLIC_SITE_URL: "https://nhuawin-p21.vercel.app" }],
    ["thiếu SITE_URL", { ...prod, NEXT_PUBLIC_SITE_URL: undefined }],
    ["SITE_URL hỏng", { ...prod, NEXT_PUBLIC_SITE_URL: "khong-phai-url" }],
  ])("%s → không index", (_, env) => {
    expect(indexingAllowed(env)).toBe(false);
  });

  it("request tới host khác host chuẩn (alias vercel.app, apex) → không index", () => {
    expect(indexingAllowed(prod, "nhuawin-p21.vercel.app")).toBe(false);
    expect(indexingAllowed(prod, "example.vn")).toBe(false);
  });
});
