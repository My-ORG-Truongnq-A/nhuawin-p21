import { describe, expect, it } from "vitest";
import { isValidSlug, SLUG_PATTERN, slugifyVi } from "./slugify-vi";

describe("slugifyVi (CM-02, REQ-01)", () => {
  it.each([
    ["đ / Đ → d", "Đại lý đồ gỗ", "dai-ly-do-go"],
    ["bỏ dấu NFD", "Kiến thức vật liệu", "kien-thuc-vat-lieu"],
    ["ký tự khác chữ số → '-' và gộp", "Chọn & gia công", "chon-gia-cong"],
    ["cắt '-' hai đầu", "  — Tin WIN! — ", "tin-win"],
    ["chữ số giữ nguyên", "Fomex 8–10 ly", "fomex-8-10-ly"],
    ["dấu hỏi và chấm", "Tấm Fomex là gì? Cấu tạo, đặc tính", "tam-fomex-la-gi-cau-tao-dac-tinh"],
    ["chuỗi rỗng", "", ""],
    ["chỉ ký tự đặc biệt", "!!!", ""],
  ])("%s", (_, input, expected) => {
    expect(slugifyVi(input)).toBe(expected);
  });

  it("kết quả luôn khớp SLUG_PATTERN khi không rỗng", () => {
    for (const s of ["Hashtag check-in", "Backdrop sự kiện", "Ữ ỹ ợ ộ ậ"]) {
      expect(slugifyVi(s)).toMatch(SLUG_PATTERN);
    }
  });
});

describe("isValidSlug", () => {
  it.each([
    ["fomex-3-ly", true],
    ["tin-win", true],
    ["Fomex-3-ly", false],
    ["fomex--3", false],
    ["-fomex", false],
    ["fomex-", false],
    ["đồ-gỗ", false],
    ["", false],
  ])("%s → %s", (slug, ok) => {
    expect(isValidSlug(slug)).toBe(ok);
  });
});
