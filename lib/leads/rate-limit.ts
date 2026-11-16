import "server-only";
import { createHash } from "node:crypto";

/**
 * Rate limit + khoá idempotent bằng kho BỀN (LD-04): Redis REST của Upstash / Vercel KV (Marketplace).
 * Gọi REST bằng fetch — không thêm thư viện. KHÔNG có bản in-memory (vô hiệu trên serverless).
 *
 * Biến: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel Marketplace) hoặc
 * `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
 * Kho chưa cấu hình / lỗi → cho qua và cảnh báo: chặn nhầm lead thật tệ hơn để lọt spam
 * (đã có honeypot + thời gian điền tối thiểu).
 */

type Env = Record<string, string | undefined>;

export type KvStore = {
  /** Tăng bộ đếm; khoá mới thì đặt TTL. Trả số đếm sau khi tăng. */
  incr(key: string, ttlSec: number): Promise<number>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
};

export function kvFromEnv(env: Env, fetchImpl: typeof fetch = fetch): KvStore | null {
  const url = (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL)?.trim().replace(/\/+$/, "");
  const token = (env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN)?.trim();
  if (!url || !token) return null;

  const pipeline = async (cmds: string[][]): Promise<unknown[]> => {
    const res = await fetchImpl(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) throw new Error(`kv_http_${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(out) || out.some((r) => r.error)) throw new Error("kv_error");
    return out.map((r) => r.result);
  };

  return {
    async incr(key, ttlSec) {
      const [, n] = await pipeline([
        ["SET", key, "0", "EX", String(ttlSec), "NX"],
        ["INCR", key],
      ]);
      return Number(n);
    },
    async get(key) {
      const [v] = await pipeline([["GET", key]]);
      return typeof v === "string" ? v : null;
    },
    async set(key, value, ttlSec) {
      await pipeline([["SET", key, value, "EX", String(ttlSec)]]);
    },
  };
}

export type TakeResult = { allowed: boolean; degraded?: "no_store" | "store_error" };

/** Cửa sổ cố định: lượt thứ `limit + 1` trong `windowSec` bị chặn. Chỉ gọi cho lượt gửi HỢP LỆ. */
export async function takeToken(store: KvStore | null, key: string, opts: { limit: number; windowSec: number }): Promise<TakeResult> {
  if (!store) {
    console.warn("[leads] Chưa cấu hình kho rate limit (KV_REST_API_URL / UPSTASH_REDIS_REST_URL).");
    return { allowed: true, degraded: "no_store" };
  }
  try {
    return { allowed: (await store.incr(key, opts.windowSec)) <= opts.limit };
  } catch {
    console.warn("[leads] Kho rate limit lỗi — cho qua.");
    return { allowed: true, degraded: "store_error" };
  }
}

export function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip")?.trim() || "unknown";
}

/** `ip:kind` theo LD-04; IP băm sha256 để kho không giữ IP thô. */
export function rateLimitKey(kind: string, ip: string): string {
  return `rl:lead:${kind}:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
}

export const doneKey = (requestId: string) => `lead:done:${requestId}`;
