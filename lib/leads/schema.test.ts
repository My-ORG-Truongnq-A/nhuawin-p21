import { describe, expect, it } from "vitest";
import { normalizeVnPhone, parseLead } from "./schema";

const OPTS = { roleOptions: ["Đại lý vật liệu", "Khác"], needOptions: ["Báo giá"], productSlugs: ["fomex-3-ly", "fomex-5-ly"] };
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("normalizeVnPhone", () => {
  it.each([
    ["0900 000 001", "+84900000001"],
    ["+84 900.000.001", "+84900000001"],
    ["84900000001", "+84900000001"],
  ])("%s → %s", (a, b) => expect(normalizeVnPhone(a)).toBe(b));

  it.each(["12345", "0200000000", "09000000011", "abc"])("%s không hợp lệ", (v) => expect(normalizeVnPhone(v)).toBeUndefined());
});

describe("parseLead (T5.1, REQ-04)", () => {
  it("contact hợp lệ: chuẩn hoá SĐT, bỏ trường rỗng", () => {
    const r = parseLead("contact", fd({ name: " An ", phone: "0900000001", role: "Khác", need: "Báo giá", note: "" }), OPTS);
    expect(r).toEqual({ ok: true, spam: false, data: { name: "An", phone: "+84900000001", role: "Khác", need: "Báo giá" } });
  });

  it("thiếu / sai → lỗi tiếng Việt theo từng trường", () => {
    const r = parseLead("contact", fd({ name: "", phone: "123", role: "Lạ", need: "" }), OPTS);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["name", "need", "phone", "role"]);
  });

  it("quote: loại tấm phải là slug productGroup; bỏ trống được; tỉnh bắt buộc", () => {
    const base = { name: "An", phone: "0900000001", role: "Khác", province: "Hà Nội" };
    expect(parseLead("quote", fd({ ...base, product: "fomex-5-ly" }), OPTS).ok).toBe(true);
    expect(parseLead("quote", fd({ ...base, product: "" }), OPTS).ok).toBe(true);
    const bad = parseLead("quote", fd({ ...base, product: "fomex-99-ly", province: "" }), OPTS);
    expect(!bad.ok && bad.errors).toMatchObject({ product: expect.any(String), province: expect.any(String) });
  });

  it("partnership: loại hình + tỉnh bắt buộc; không có trường chiết khấu / MOQ", () => {
    const r = parseLead("partnership", fd({ name: "An", phone: "0900000001", role: "Đại lý vật liệu", province: "Huế", moq: "1000" }), OPTS);
    expect(r.ok && r.data).toEqual({ name: "An", phone: "+84900000001", role: "Đại lý vật liệu", province: "Huế" });
  });

  it("honeypot có giá trị → spam, không kiểm tiếp", () => {
    expect(parseLead("contact", fd({ website: "x" }), OPTS)).toEqual({ ok: false, errors: {}, spam: true });
  });

  const valid = { name: "An", phone: "0900000001", role: "Khác", need: "Báo giá" };
  it.each([
    ["0.5", true],
    ["1.99", true],
    ["2", false],
    ["40", false],
    ["", false], // không có JS → không đo được, không coi là bot
    ["abc", false],
  ])("thời gian điền $elapsed=%s → spam=%s (LD-04: ≥ 2 s)", (elapsed, spam) => {
    expect(parseLead("contact", fd({ ...valid, $elapsed: elapsed }), OPTS).spam).toBe(spam);
  });

  it("điền nhanh nhưng sai → vẫn trả lỗi theo trường (không nuốt im lặng)", () => {
    const r = parseLead("contact", fd({ ...valid, phone: "123", $elapsed: "0.5" }), OPTS);
    expect(r.spam).toBe(false);
    expect(!r.ok && r.errors).toHaveProperty("phone");
  });
});
