import { describe, expect, it, vi } from "vitest";
import { type KvStore, clientIp, kvFromEnv, rateLimitKey, takeToken } from "./rate-limit";

const ENV = { KV_REST_API_URL: "https://kv.example.test/", KV_REST_API_TOKEN: "t" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("kvFromEnv (kho bền qua REST, không in-memory)", () => {
  it("thiếu URL / token → null", () => {
    expect(kvFromEnv({})).toBeNull();
    expect(kvFromEnv({ UPSTASH_REDIS_REST_URL: "https://x.test" })).toBeNull();
  });

  it("nhận cả tên biến Upstash", () => {
    expect(kvFromEnv({ UPSTASH_REDIS_REST_URL: "https://x.test", UPSTASH_REDIS_REST_TOKEN: "t" })).not.toBeNull();
  });

  it("incr: 1 pipeline SET NX EX + INCR, có Bearer token, trả số đếm", async () => {
    const f = vi.fn<typeof fetch>(async () => json([{ result: null }, { result: 3 }]));
    const kv = kvFromEnv(ENV, f)!;
    expect(await kv.incr("k", 600)).toBe(3);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("https://kv.example.test/pipeline");
    expect(init).toMatchObject({ method: "POST", headers: { Authorization: "Bearer t" } });
    expect(JSON.parse(String(init?.body))).toEqual([
      ["SET", "k", "0", "EX", "600", "NX"],
      ["INCR", "k"],
    ]);
  });

  it("HTTP lỗi / lệnh lỗi → ném lỗi (người gọi quyết định)", async () => {
    await expect(kvFromEnv(ENV, async () => json({}, 500))!.get("k")).rejects.toThrow(/kv_http_500/);
    await expect(kvFromEnv(ENV, async () => json([{ error: "WRONGTYPE" }]))!.get("k")).rejects.toThrow(/kv_error/);
  });
});

describe("takeToken (LD-04)", () => {
  const store = (n: number | Error): KvStore => ({
    incr: vi.fn(async () => {
      if (n instanceof Error) throw n;
      return n;
    }),
    get: vi.fn(),
    set: vi.fn(),
  });
  const opts = { limit: 5, windowSec: 600 };

  it.each([
    [1, true],
    [5, true],
    [6, false],
  ])("lượt thứ %i → allowed=%s", async (n, allowed) => {
    expect((await takeToken(store(n), "k", opts)).allowed).toBe(allowed);
  });

  it("không có kho / kho lỗi → cho qua (không mất lead), báo lý do", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await takeToken(null, "k", opts)).toEqual({ allowed: true, degraded: "no_store" });
    expect(await takeToken(store(new Error("x")), "k", opts)).toEqual({ allowed: true, degraded: "store_error" });
  });
});

describe("clientIp / rateLimitKey", () => {
  it.each([
    [{ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }, "203.0.113.5"],
    [{ "x-real-ip": "198.51.100.7" }, "198.51.100.7"],
    [{}, "unknown"],
  ])("%o → %s", (h, ip) => expect(clientIp(new Headers(h))).toBe(ip));

  it("khoá theo kind + băm IP (không lưu IP thô)", () => {
    const k = rateLimitKey("quote", "203.0.113.5");
    expect(k).toMatch(/^rl:lead:quote:[0-9a-f]{32}$/);
    expect(k).not.toContain("203");
    expect(rateLimitKey("contact", "203.0.113.5")).not.toBe(k);
  });
});
