// Rào Sanity gói Free (bất biến 10): test không được gọi API Sanity.
// Mọi fetch tới *.sanity.io / *.apicdn.sanity.io trong Vitest → lỗi ngay.
import { beforeEach } from "vitest";

const SANITY_HOST = /(^|\.)sanity\.io$/i;

export class SanityNetworkBlockedError extends Error {
  constructor(url: string) {
    super(`[no-network] Test gọi Sanity thật: ${url}. Dùng seed (SANITY_SOURCE=seed).`);
    this.name = "SanityNetworkBlockedError";
  }
}

function hostOf(input: unknown): string | null {
  try {
    if (typeof input === "string") return new URL(input).hostname;
    if (input instanceof URL) return input.hostname;
    if (input && typeof input === "object" && "url" in input) {
      return new URL(String((input as { url: string }).url)).hostname;
    }
  } catch {
    return null;
  }
  return null;
}

export function installNoNetworkGuard(target: typeof globalThis = globalThis) {
  const original = target.fetch;
  const guarded = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const host = hostOf(input);
    if (host && SANITY_HOST.test(host)) {
      throw new SanityNetworkBlockedError(String(input instanceof Request ? input.url : input));
    }
    return original(input, init);
  }) as typeof fetch;
  target.fetch = guarded;
  return guarded;
}

const guard = installNoNetworkGuard();
// Test có thể vô tình mock lại fetch; luôn đặt lại rào trước mỗi test.
beforeEach(() => {
  globalThis.fetch = guard;
});
