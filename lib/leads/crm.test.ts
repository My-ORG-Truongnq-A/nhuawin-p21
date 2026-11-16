import { afterEach, describe, expect, it, vi } from "vitest";
import { sendToCrm } from "./crm";

const lead = { kind: "contact" as const, fields: { name: "An", phone: "+84900000001" }, page: "/lien-he" };

describe("sendToCrm (T5.2)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("chưa cấu hình → không gọi mạng, trả lỗi (không thành công giả)", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sendToCrm(lead, {})).toEqual({ ok: false, reason: "not_configured" });
    expect(f).not.toHaveBeenCalled();
  });

  it("CRM trả lỗi → ok=false; CRM nhận → ok=true, gửi khoá form trong header", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const env = { DGA_API_URL: "https://crm.example.test/leads", DGA_FORM_KEY: "k" };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    expect((await sendToCrm(lead, env)).ok).toBe(false);
    const ok = vi.fn(async (_u: string, _i: RequestInit) => new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", ok);
    expect((await sendToCrm(lead, env)).ok).toBe(true);
    expect(ok.mock.calls[0][1]).toMatchObject({ method: "POST", headers: { "X-Form-Key": "k" } });
  });
});
