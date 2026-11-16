import { describe, expect, it, vi } from "vitest";
import { SEED } from "@/seed/content";
import { loadContent } from "./load";
import { NORMALIZERS } from "./normalize";

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
});

describe("SEED khớp kiểu chung", () => {
  it.each(Object.keys(SEED) as (keyof typeof SEED)[])("%s qua bộ chuẩn hoá không đổi", (key) => {
    expect(NORMALIZERS[key](SEED[key])).toEqual(SEED[key]);
  });
});
