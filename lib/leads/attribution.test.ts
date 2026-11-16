import { describe, expect, it } from "vitest";
import { attributionContext, nextAttribution, parseTouch, serializeTouch, touchFromVisit } from "./attribution";

const NOW = new Date("2026-11-16T03:00:00Z");
const SITE = "https://site.example";

describe("touchFromVisit (LD-05)", () => {
  it("UTM + click ID → non-direct, landing chỉ lấy path (không query)", () => {
    const v = touchFromVisit(`${SITE}/bao-gia?utm_source=google&utm_medium=cpc&utm_campaign=fomex&gclid=abc&ten=An`, "", NOW);
    expect(v.nonDirect).toBe(true);
    expect(v.touch).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "fomex",
      gclid: "abc",
      landing: "/bao-gia",
      at: NOW.toISOString(),
    });
  });

  it("referrer ngoài site → non-direct, chỉ giữ origin (không path / query)", () => {
    const v = touchFromVisit(`${SITE}/`, "https://www.google.com/search?q=fomex", NOW);
    expect(v).toMatchObject({ nonDirect: true, touch: { referrer: "https://www.google.com", landing: "/" } });
  });

  it.each([
    ["không referrer", ""],
    ["referrer cùng site", `${SITE}/san-pham`],
    ["referrer hỏng", "khong-phai-url"],
  ])("%s, không UTM → direct", (_n, ref) => {
    const v = touchFromVisit(`${SITE}/lien-he`, ref, NOW);
    expect(v.nonDirect).toBe(false);
    expect(v.touch.referrer).toBeUndefined();
  });

  it("giá trị rỗng bị bỏ, giá trị dài bị cắt 200 ký tự", () => {
    const v = touchFromVisit(`${SITE}/?utm_source=&utm_campaign=${"x".repeat(300)}`, "", NOW);
    expect(v.touch.utm_source).toBeUndefined();
    expect(v.touch.utm_campaign).toHaveLength(200);
  });
});

describe("nextAttribution: first-touch giữ nguyên, last non-direct ghi đè toàn bộ", () => {
  const google = touchFromVisit(`${SITE}/?utm_source=google&utm_campaign=a&utm_term=fomex`, "", NOW);
  const fb = touchFromVisit(`${SITE}/?utm_source=facebook`, "", NOW);
  const direct = touchFromVisit(`${SITE}/lien-he`, "", NOW);

  it("lần đầu (kể cả direct) → ghi first-touch", () => {
    expect(nextAttribution({}, direct)).toEqual({ ft: direct.touch, lt: undefined, write: ["ft"] });
    expect(nextAttribution({}, google)).toEqual({ ft: google.touch, lt: google.touch, write: ["ft", "lt"] });
  });

  it("lượt sau có UTM mới → first-touch không đổi, last-touch thay cả bộ (không giữ utm_term cũ)", () => {
    const r = nextAttribution({ ft: google.touch, lt: google.touch }, fb);
    expect(r.ft).toBe(google.touch);
    expect(r.lt).toEqual(fb.touch);
    expect(r.lt?.utm_term).toBeUndefined();
    expect(r.write).toEqual(["lt"]);
  });

  it("lượt sau direct → không ghi gì", () => {
    expect(nextAttribution({ ft: google.touch, lt: google.touch }, direct).write).toEqual([]);
  });
});

describe("cookie: serialize / parse", () => {
  it("vòng tròn giữ nguyên", () => {
    const t = touchFromVisit(`${SITE}/?utm_source=zalo&fbclid=1`, "https://l.facebook.com/x", NOW).touch;
    expect(parseTouch(serializeTouch(t))).toEqual(t);
  });

  it.each([undefined, "", "%7Bhong", encodeURIComponent("[1]"), encodeURIComponent('{"utm_source":"a"}')])(
    "%s → undefined (thiếu landing / hỏng)",
    (raw) => expect(parseTouch(raw)).toBeUndefined(),
  );

  it("bỏ khoá lạ, bỏ giá trị không phải chuỗi", () => {
    const raw = encodeURIComponent(JSON.stringify({ landing: "/", at: "x", utm_source: 1, email: "a@b.c", utm_medium: "cpc" }));
    expect(parseTouch(raw)).toEqual({ landing: "/", at: "x", utm_medium: "cpc" });
  });
});

describe("attributionContext", () => {
  it("UTM lấy từ last non-direct, thiếu thì từ first-touch; kèm first_* và landing", () => {
    const ft = touchFromVisit(`${SITE}/tin-tuc?utm_source=google`, "", NOW).touch;
    const lt = touchFromVisit(`${SITE}/bao-gia?utm_source=facebook&utm_medium=social`, "", NOW).touch;
    expect(attributionContext({ ft, lt })).toEqual({
      utm_source: "facebook",
      utm_medium: "social",
      landing_page: "/bao-gia",
      first_utm_source: "google",
      first_landing_page: "/tin-tuc",
      first_touch_at: NOW.toISOString(),
    });
    expect(attributionContext({ ft })).toMatchObject({ utm_source: "google", landing_page: "/tin-tuc" });
    expect(attributionContext({})).toEqual({});
  });
});
