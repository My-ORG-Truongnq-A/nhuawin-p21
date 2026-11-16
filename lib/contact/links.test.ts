import { describe, expect, it } from "vitest";
import { telHref, toE164 } from "./links";

describe("liên hệ (T1.5)", () => {
  it.each([
    ["0824 862 689", "tel:0824862689"],
    ["0824.862.689", "tel:0824862689"],
    ["+84 824 862 689", "tel:+84824862689"],
  ])("telHref(%s) = %s", (input, expected) => {
    expect(telHref(input)).toBe(expected);
  });

  it.each([
    ["0824 862 689", "+84824862689"],
    ["+84 979 072 186", "+84979072186"],
    ["84979072186", "+84979072186"],
  ])("toE164(%s) = %s", (input, expected) => {
    expect(toE164(input)).toBe(expected);
  });

  it("số không hợp lệ → undefined", () => {
    expect(toE164("abc")).toBeUndefined();
    expect(toE164("12")).toBeUndefined();
  });
});
