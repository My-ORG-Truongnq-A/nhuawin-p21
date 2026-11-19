import { beforeEach, describe, expect, it, vi } from "vitest";
import { type LeadContext, RATE_LIMIT, handleLead } from "./handle";
import type { KvStore } from "./rate-limit";

const RID = "6f1c2b9e-0d1a-4c55-9a51-1f0f7e1b2c3d";
const VALID = { $kind: "contact", $page: "/lien-he", name: "An", phone: "0900000001", role: "Khác", need: "Báo giá" };
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

/** Kho giả có trạng thái (thay Redis) — chỉ dùng trong test. */
function memoryStore(): KvStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    incr: async (k) => {
      const n = Number(data.get(k) ?? 0) + 1;
      data.set(k, String(n));
      return n;
    },
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
  };
}

function ctx(over: Partial<LeadContext> = {}): LeadContext & { fetch: ReturnType<typeof vi.fn<typeof fetch>> } {
  return {
    options: { roleOptions: ["Khác"], needOptions: ["Báo giá"], productSlugs: [] },
    messages: { success: "OK", error: "Lỗi, gọi 0900", rateLimited: "Quá nhiều, gọi 0900" },
    ip: "203.0.113.5",
    attribution: { lt: { utm_source: "google", landing: "/", at: "t" } },
    siteUrl: "https://site.example",
    env: { DGA_API_URL: "https://crm.example.test", DGA_FORM_KEY: "k" },
    store: memoryStore(),
    now: new Date("2026-11-16T03:00:00Z"),
    newId: () => "11111111-2222-4333-8444-555555555555",
    fetch: vi.fn<typeof fetch>(async () => new Response(null, { status: 201 })),
    ...over,
  } as LeadContext & { fetch: ReturnType<typeof vi.fn<typeof fetch>> };
}

beforeEach(() => void vi.spyOn(console, "warn").mockImplementation(() => {}));

describe("handleLead (LD-01, LD-04)", () => {
  it("hợp lệ → giao CRM rồi mới thành công; trả requestId + formType; payload có page_url + UTM", async () => {
    const c = ctx();
    const r = await handleLead(fd({ ...VALID, $rid: RID }), c);
    expect(r).toEqual({ status: "success", message: "OK", requestId: RID, formType: "contact" });
    const body = JSON.parse(String(c.fetch.mock.calls[0][1]?.body));
    expect(body.context).toMatchObject({ page_url: "https://site.example/lien-he", utm_source: "google" });
  });

  it("requestId client không phải UUID → server tự sinh", async () => {
    expect((await handleLead(fd({ ...VALID, $rid: "x" }), ctx())).requestId).toBe("11111111-2222-4333-8444-555555555555");
  });

  it.each([
    ["honeypot", { website: "http://spam" }],
    ["điền dưới 2 s", { $elapsed: "0.4" }],
  ])("bot (%s) → thành công giả, không gửi, không requestId", async (_n, extra) => {
    const c = ctx();
    const r = await handleLead(fd({ ...VALID, ...extra }), c);
    expect(r).toEqual({ status: "success", message: "OK" });
    expect(c.fetch).not.toHaveBeenCalled();
  });

  it("thiếu trường → lỗi theo trường, giữ dữ liệu, không đếm rate limit", async () => {
    const c = ctx();
    const r = await handleLead(fd({ ...VALID, phone: "" }), c);
    expect(r.status).toBe("error");
    expect(r.errors).toHaveProperty("phone");
    expect(r.values).toMatchObject({ name: "An", role: "Khác" });
    expect(r.values).not.toHaveProperty("$kind");
    expect((c.store as ReturnType<typeof memoryStore>).data.size).toBe(0);
  });

  it(`lượt hợp lệ thứ ${RATE_LIMIT.limit + 1} cùng IP + loại form → chặn, kèm hotline, giữ dữ liệu`, async () => {
    const c = ctx({ newId: () => crypto.randomUUID() });
    for (let i = 0; i < RATE_LIMIT.limit; i++) expect((await handleLead(fd(VALID), c)).status).toBe("success");
    const r = await handleLead(fd(VALID), c);
    expect(r).toMatchObject({ status: "error", message: "Quá nhiều, gọi 0900", values: { name: "An" } });
    expect(c.fetch).toHaveBeenCalledTimes(RATE_LIMIT.limit);
    // Loại form khác vẫn gửi được.
    const quote = { $kind: "quote", name: "An", phone: "0900000001", role: "Khác", province: "Huế" };
    expect((await handleLead(fd(quote), c)).status).toBe("success");
  });

  it("gửi lại cùng requestId đã giao → thành công, không gửi lần hai", async () => {
    const c = ctx();
    await handleLead(fd({ ...VALID, $rid: RID }), c);
    expect((await handleLead(fd({ ...VALID, $rid: RID }), c)).status).toBe("success");
    expect(c.fetch).toHaveBeenCalledTimes(1);
  });

  it("dry-run → thành công kèm demo: true, không gọi CRM; tắt dry-run → không có demo", async () => {
    const c = ctx({ env: { LEADS_DRY_RUN: "1" } });
    vi.spyOn(console, "info").mockImplementation(() => {});
    const r = await handleLead(fd({ ...VALID, $rid: RID }), c);
    expect(r).toEqual({ status: "success", message: "OK", requestId: RID, formType: "contact", demo: true });
    expect(c.fetch).not.toHaveBeenCalled();
    // Gửi lại cùng requestId ở dry-run → vẫn báo demo.
    expect((await handleLead(fd({ ...VALID, $rid: RID }), c)).demo).toBe(true);
    expect((await handleLead(fd({ ...VALID, $rid: RID }), ctx())).demo).toBeUndefined();
  });

  it("2 request cùng requestId gửi đồng thời (nhấp đúp) → giao 1 lần, cả 2 thành công", async () => {
    for (const store of [memoryStore(), null]) {
      const c = ctx({ store });
      const [a, b] = await Promise.all([handleLead(fd({ ...VALID, $rid: RID }), c), handleLead(fd({ ...VALID, $rid: RID }), c)]);
      expect(a.status).toBe("success");
      expect(b).toEqual(a);
      expect(c.fetch).toHaveBeenCalledTimes(1);
    }
  });

  it.each([
    ["CRM 500", { fetch: vi.fn<typeof fetch>(async () => new Response(null, { status: 500 })) }],
    ["chưa cấu hình đích", { env: {} }],
  ])("%s → lỗi kèm hotline, giữ dữ liệu, không đánh dấu đã giao", async (_n, over) => {
    const c = ctx(over);
    const r = await handleLead(fd({ ...VALID, $rid: RID }), c);
    expect(r).toMatchObject({ status: "error", message: "Lỗi, gọi 0900", values: { name: "An" } });
    expect(r.requestId).toBeUndefined();
    expect(await c.store?.get(`lead:done:${RID}`)).toBeNull();
  });

  it("không có kho rate limit → vẫn giao (không mất lead)", async () => {
    expect((await handleLead(fd(VALID), ctx({ store: null }))).status).toBe("success");
  });

  it("$page lạ (URL ngoài) → page_url về trang chủ của site", async () => {
    const c = ctx();
    await handleLead(fd({ ...VALID, $page: "//evil.example/x" }), c);
    expect(JSON.parse(String(c.fetch.mock.calls[0][1]?.body)).context.page_url).toBe("https://site.example/");
  });

  it("$kind lạ → lỗi", async () => {
    expect((await handleLead(fd({ ...VALID, $kind: "admin" }), ctx())).status).toBe("error");
  });
});
