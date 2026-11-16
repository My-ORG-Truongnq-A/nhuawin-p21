import { describe, expect, it, vi } from "vitest";
import { hasAdClickId, queueBootScript, tagScriptUrl, trackingConfig } from "./config";
import { classifyContactHref, trackEvent, trackLead } from "./events";

describe("trackingConfig (TR-01)", () => {
  it.each([
    [{ production: false, gtmId: "GTM-ABC123", gaId: "G-ABC123" }, null],
    [{ production: true }, null],
    [{ production: true, gtmId: "", gaId: " " }, null],
    [{ production: true, gtmId: "GTM-ABC123", gaId: "G-XYZ789" }, { mode: "gtm", id: "GTM-ABC123" }],
    [{ production: true, gaId: "g-xyz789" }, { mode: "gtag", id: "G-XYZ789" }],
    [{ production: true, gtmId: "GTM-1');alert(1)//" }, null],
    [{ production: true, gaId: "UA-123-1" }, null],
  ])("%o → %o", (o, out) => expect(trackingConfig(o)).toEqual(out));

  it("URL thư viện + hàng đợi theo chế độ", () => {
    expect(tagScriptUrl({ mode: "gtm", id: "GTM-ABC123" })).toBe("https://www.googletagmanager.com/gtm.js?id=GTM-ABC123");
    expect(tagScriptUrl({ mode: "gtag", id: "G-ABC123" })).toBe("https://www.googletagmanager.com/gtag/js?id=G-ABC123");
    expect(queueBootScript({ mode: "gtm", id: "GTM-ABC123" })).not.toContain("gtag");
    expect(queueBootScript({ mode: "gtag", id: "G-ABC123" })).toContain(`'config',"G-ABC123"`);
  });

  it.each([
    ["?gclid=1", true],
    ["?utm_source=x&fbclid=2", true],
    ["?utm_source=google", false],
    ["", false],
  ])("hasAdClickId(%s) = %s", (s, v) => expect(hasAdClickId(s)).toBe(v));
});

describe("trackLead (TR-02)", () => {
  it("đẩy generate_lead đúng 1 lần mỗi requestId, tham số không PII", () => {
    const w: { dataLayer?: unknown[] } = {};
    const sent = new Set<string>();
    const e = { requestId: "r1", formType: "quote", pagePath: "/bao-gia" };
    expect(trackLead(w, e, sent)).toBe(true);
    expect(trackLead(w, e, sent)).toBe(false);
    expect(w.dataLayer).toEqual([{ event: "generate_lead", form_name: "quote_form", form_type: "quote", page_path: "/bao-gia" }]);
  });

  it("không requestId (bot / chưa giao) → không đẩy", () => {
    const w: { dataLayer?: unknown[] } = {};
    expect(trackLead(w, { requestId: "", formType: "contact", pagePath: "/" }, new Set())).toBe(false);
    expect(w.dataLayer).toBeUndefined();
  });

  it("chế độ gtag → gọi gtag('event'), không đẩy object vào dataLayer", () => {
    const gtag = vi.fn();
    const w = { dataLayer: [] as unknown[], gtag };
    trackEvent(w, "click_phone", { link_location: "header", page_path: "/" });
    expect(gtag).toHaveBeenCalledWith("event", "click_phone", { link_location: "header", page_path: "/" });
    expect(w.dataLayer).toEqual([]);
  });
});

describe("classifyContactHref (TR-03)", () => {
  it.each([
    ["tel:+84900000001", "click_phone"],
    ["mailto:a@b.c", "click_email"],
    ["https://zalo.me/0900000001", "click_zalo"],
    ["https://m.me/page", "click_messenger"],
    ["https://www.facebook.com/page", "click_fanpage"],
    ["https://www.google.com/maps/dir/?api=1&destination=1,2", "click_directions"],
    ["https://maps.app.goo.gl/abc", "click_directions"],
    ["https://www.google.com/search?q=x", null],
    ["/bao-gia", null],
    ["https://evil.example/zalo.me", null],
  ])("%s → %s", (href, ev) => expect(classifyContactHref(href)).toBe(ev));
});
