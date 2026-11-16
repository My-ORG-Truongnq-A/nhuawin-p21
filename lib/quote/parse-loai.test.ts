import { describe, expect, it } from "vitest";
import { parseLoai } from "./parse-loai";

const SLUGS = ["fomex-3-ly", "fomex-5-ly", "fomex-8-10-ly", "fomex-15-18-ly"];

describe("parseLoai (REQ-19)", () => {
  it.each(SLUGS)("%s hợp lệ → chọn sẵn", (s) => {
    expect(parseLoai(s, SLUGS)).toBe(s);
  });

  it("chuẩn hoá hoa/thường, khoảng trắng; mảng lấy giá trị đầu", () => {
    expect(parseLoai(" FOMEX-5-LY ", SLUGS)).toBe("fomex-5-ly");
    expect(parseLoai(["fomex-3-ly", "fomex-5-ly"], SLUGS)).toBe("fomex-3-ly");
  });

  it.each([undefined, "", "fomex-99-ly", "<script>", "fomex-3-ly#x"])("%s lạ → không chọn sẵn", (v) => {
    expect(parseLoai(v, SLUGS)).toBeUndefined();
  });

  it("danh sách lấy từ CMS: thêm nhóm mới không sửa code", () => {
    expect(parseLoai("fomex-20-ly", [...SLUGS, "fomex-20-ly"])).toBe("fomex-20-ly");
  });
});
