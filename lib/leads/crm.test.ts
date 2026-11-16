import { beforeEach, describe, expect, it, vi } from "vitest";
import { crmPayload, sendToCrm } from "./crm";
import type { Lead } from "./lead";

const lead: Lead = {
  requestId: "6f1c2b9e-0d1a-4c55-9a51-1f0f7e1b2c3d",
  kind: "quote",
  fields: { name: "An", phone: "+84900000001", product: "fomex-5-ly", province: "Huế" },
  page: "/bao-gia",
  pageUrl: "https://site.example/bao-gia",
  attribution: { lt: { utm_source: "google", landing: "/bao-gia", at: "2026-11-16T03:00:00.000Z" } },
  submittedAt: "2026-11-16T03:01:00.000Z",
};
const ENV = { DGA_API_URL: "https://crm.example.test/", DGA_FORM_KEY: "form-key" };

describe("crmPayload (LD-02)", () => {
  it("name / phone là khoá riêng; còn lại vào custom_fields kèm form_type; context có page_url + UTM", () => {
    expect(crmPayload(lead)).toEqual({
      name: "An",
      phone: "+84900000001",
      custom_fields: { form_type: "quote", product: "fomex-5-ly", province: "Huế" },
      context: { page_url: "https://site.example/bao-gia", utm_source: "google", landing_page: "/bao-gia" },
      request_id: lead.requestId,
    });
  });
});

describe("sendToCrm (T5.2)", () => {
  beforeEach(() => void vi.spyOn(console, "warn").mockImplementation(() => {}));

  it("chưa cấu hình → không gọi mạng, trả lỗi (không thành công giả)", async () => {
    const f = vi.fn<typeof fetch>();
    expect(await sendToCrm(lead, {}, f)).toEqual({ ok: false, reason: "not_configured" });
    expect(f).not.toHaveBeenCalled();
  });

  it("gọi đúng endpoint chuẩn, khoá form trong path, Idempotency-Key = requestId", async () => {
    const f = vi.fn<typeof fetch>(async () => new Response(null, { status: 201 }));
    expect(await sendToCrm(lead, ENV, f)).toEqual({ ok: true });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("https://crm.example.test/api/v1/public/forms/form-key/submit");
    expect(init).toMatchObject({ method: "POST", headers: { "Idempotency-Key": lead.requestId } });
  });

  it.each([
    ["HTTP 500", async () => new Response(null, { status: 500 }), "http_500"],
    ["timeout / mạng", async () => Promise.reject(new DOMException("timeout", "TimeoutError")), "network"],
  ])("%s → ok=false", async (_n, impl, reason) => {
    expect(await sendToCrm(lead, ENV, vi.fn<typeof fetch>(impl))).toEqual({ ok: false, reason });
  });

  it("log không chứa dữ liệu người gửi", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await sendToCrm(lead, ENV, vi.fn<typeof fetch>(async () => new Response(null, { status: 500 })));
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/An|0900000001|Huế/);
  });
});
