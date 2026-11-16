import { describe, expect, it } from "vitest";
import { addressLine, telHref, toE164 } from "./links";

describe("liên hệ (T1.5)", () => {
  it.each([
    ["0900 123 456", "tel:0900123456"],
    ["0900.123.456", "tel:0900123456"],
    ["+84 900 123 456", "tel:+84900123456"],
  ])("telHref(%s) = %s", (input, expected) => {
    expect(telHref(input)).toBe(expected);
  });

  it.each([
    ["0900 123 456", "+84900123456"],
    ["+84 911 222 333", "+84911222333"],
    ["84911222333", "+84911222333"],
  ])("toE164(%s) = %s", (input, expected) => {
    expect(toE164(input)).toBe(expected);
  });

  it("số không hợp lệ → undefined", () => {
    expect(toE164("abc")).toBeUndefined();
    expect(toE164("12")).toBeUndefined();
  });
});

describe("addressLine", () => {
  it.each([
    [{ display: "KCN A, Hà Nội", street: "KCN A", locality: "Hà Nội" }, "KCN A, Hà Nội"],
    [{ street: "Số 1", locality: "Hà Nội" }, "Số 1, Hà Nội"],
    [{ locality: "Hà Nội" }, "Hà Nội"],
    [undefined, ""],
  ])("%j → %s", (a, expected) => {
    expect(addressLine(a)).toBe(expected);
  });
});
