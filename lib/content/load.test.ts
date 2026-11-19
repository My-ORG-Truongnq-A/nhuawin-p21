import { describe, expect, it, vi } from "vitest";
import { SEED, SEED_POSTS } from "@/seed/content";
import { loadContent, loadPost } from "./load";
import { NORMALIZERS, postDetail } from "./normalize";

const silent = { warn: vi.fn() };

describe("loadContent — một cửa, có seed dự phòng (KT-01)", () => {
  it("source=seed → trả seed, KHÔNG gọi Sanity", async () => {
    const fetchSanity = vi.fn();
    const r = await loadContent("siteSettings", { source: "seed", fetchSanity, log: silent });
    expect(r).toEqual({ data: SEED.siteSettings, fromSeed: true });
    expect(fetchSanity).not.toHaveBeenCalled();
  });

  it("source=sanity → chuẩn hoá dữ liệu Sanity", async () => {
    const fetchSanity = vi.fn().mockResolvedValue({ brandName: "Tên trong CMS", phones: null });
    const r = await loadContent("siteSettings", { source: "sanity", fetchSanity, log: silent });
    expect(fetchSanity).toHaveBeenCalledWith("siteSettings");
    expect(r.fromSeed).toBe(false);
    expect(r.data.brandName).toBe("Tên trong CMS");
    expect(r.data.phones).toEqual([]);
  });

  it("Sanity lỗi → seed + ghi log, không sập", async () => {
    const log = { warn: vi.fn() };
    const fetchSanity = vi.fn().mockRejectedValue(new Error("402 Payment Required"));
    const r = await loadContent("header", { source: "sanity", fetchSanity, log });
    expect(r).toEqual({ data: SEED.header, fromSeed: true });
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("Sanity trả tài liệu thiếu trường bắt buộc → seed + log", async () => {
    const log = { warn: vi.fn() };
    const r = await loadContent("siteSettings", { source: "sanity", fetchSanity: async () => null, log });
    expect(r.fromSeed).toBe(true);
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("danh sách rỗng từ Sanity là dữ liệu hợp lệ, không rơi về seed", async () => {
    const r = await loadContent("posts", { source: "sanity", fetchSanity: async () => [], log: silent });
    expect(r).toEqual({ data: [], fromSeed: false });
  });

  // BUILD-EMPTY-CMS: dataset trống — GROQ trả null cho singleton (`*[_id == …][0]`) và [] cho danh sách.
  it.each(Object.keys(SEED) as (keyof typeof SEED)[])("dataset trống: %s không sập (singleton → seed, danh sách → [])", async (key) => {
    const isList = Array.isArray(SEED[key]);
    const r = await loadContent(key, { source: "sanity", fetchSanity: async () => (isList ? [] : null), log: silent });
    expect(r).toEqual(isList ? { data: [], fromSeed: false } : { data: SEED[key], fromSeed: true });
  });
});

describe("SEED khớp kiểu chung", () => {
  it.each(Object.keys(SEED) as (keyof typeof SEED)[])("%s qua bộ chuẩn hoá không đổi", (key) => {
    expect(NORMALIZERS[key](SEED[key])).toEqual(SEED[key]);
  });
});

describe("loadPost — bài theo slug", () => {
  it("seed: có bài cũ, slug lạ → null", async () => {
    const fetchPost = vi.fn();
    expect((await loadPost("tam-fomex-la-gi", { source: "seed", fetchPost }))?.body.length).toBeGreaterThan(0);
    expect(await loadPost("khong-ton-tai", { source: "seed", fetchPost })).toBeNull();
    expect(fetchPost).not.toHaveBeenCalled();
  });

  it("Sanity trả null (bài đã gỡ) → null, KHÔNG sống lại từ seed", async () => {
    expect(await loadPost("tam-fomex-la-gi", { source: "sanity", fetchPost: async () => null, log: silent })).toBeNull();
  });

  it("Sanity lỗi mạng → seed + log", async () => {
    const log = { warn: vi.fn() };
    const p = await loadPost("tam-fomex-la-gi", { source: "sanity", fetchPost: async () => { throw new Error("x"); }, log });
    expect(p?.slug).toBe("tam-fomex-la-gi");
    expect(log.warn).toHaveBeenCalledOnce();
  });
});

describe("SEED_POSTS khớp kiểu bài đầy đủ", () => {
  it.each(SEED_POSTS.map((p) => p.slug))("%s qua postDetail không đổi", (slug) => {
    const p = SEED_POSTS.find((x) => x.slug === slug)!;
    expect(postDetail(p)).toEqual(p);
  });
});
