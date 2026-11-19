import { describe, expect, it } from "vitest";
import { scanText, type Rules } from "./check-hardcode";

const rules: Rules = {
  sourceOnly: [
    { value: "0824 862 689", kind: "phone", reason: "SĐT" },
    { value: "Quất Động", kind: "text", reason: "Địa chỉ" },
  ],
  everywhere: [{ value: "2 triệu", kind: "text", reason: "Claim" }],
  sourceExempt: ["seed/", "tests/fixtures/", "docs/"],
};

describe("check:hardcode (T0.4)", () => {
  it("bắt SĐT trong mã nguồn, mọi kiểu viết, báo đúng dòng", () => {
    const text = 'const a = 1;\n<a href="tel:0824862689">Gọi 0824.862.689</a>\n';
    const hits = scanText("components/layout/Footer.tsx", text, rules);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ file: "components/layout/Footer.tsx", line: 2 });
  });

  it("bắt địa chỉ (không phân biệt hoa thường)", () => {
    expect(scanText("lib/x.ts", "// QUẤT ĐỘNG", rules)).toHaveLength(1);
  });

  it("seed / tests/fixtures / docs được chứa NAP", () => {
    expect(scanText("seed/content.ts", "0824 862 689 Quất Động", rules)).toEqual([]);
    expect(scanText("tests/fixtures/a.ndjson", "0824 862 689", rules)).toEqual([]);
  });

  it("claim chưa xác minh bị cấm cả trong seed", () => {
    const hits = scanText("seed/content.ts", "Công suất 2 triệu tấm", rules);
    expect(hits).toHaveLength(1);
    expect(hits[0].reason).toBe("Claim");
  });

  it("không báo nhầm số khác", () => {
    expect(scanText("lib/x.ts", "08248626890 / 1824 862 689", rules)).toEqual([]);
  });
});
