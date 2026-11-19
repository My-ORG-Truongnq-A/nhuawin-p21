// Rào Sanity gói Free (bất biến 10): test không được gọi API Sanity.
// Mọi request tới *.sanity.io → lỗi ngay. Chặn ở fetch toàn cục VÀ ở net/tls.connect
// (@sanity/client → get-it → undici với dispatcher riêng nên không đi qua globalThis.fetch).
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import tls from "node:tls";
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
    if (input && typeof input === "object") {
      const o = input as { url?: unknown; hostname?: unknown; host?: unknown };
      if (typeof o.url === "string") return new URL(o.url).hostname;
      if (typeof o.hostname === "string") return o.hostname;
      if (typeof o.host === "string") return o.host.split(":")[0];
    }
  } catch {
    return null;
  }
  return null;
}

function assertAllowed(input: unknown) {
  const host = hostOf(input);
  if (host && SANITY_HOST.test(host)) {
    throw new SanityNetworkBlockedError(host);
  }
}

const originalFetch = globalThis.fetch;
const guardedFetch = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  assertAllowed(input);
  return originalFetch(input, init);
}) as typeof fetch;

function connectTarget(args: unknown[]): unknown {
  const [first] = args;
  if (first && typeof first === "object") {
    const o = first as { servername?: unknown; host?: unknown };
    return { hostname: typeof o.servername === "string" ? o.servername : o.host };
  }
  // net.connect(port, host)
  return typeof args[1] === "string" ? { hostname: args[1] } : null;
}

function guardConnect<T extends (...args: never[]) => unknown>(fn: T): T {
  return ((...args: Parameters<T>) => {
    assertAllowed(connectTarget(args));
    return fn(...args);
  }) as T;
}

net.connect = guardConnect(net.connect);
net.createConnection = guardConnect(net.createConnection);
tls.connect = guardConnect(tls.connect);
syncBuiltinESMExports();
globalThis.fetch = guardedFetch;

// Test có thể vô tình mock lại fetch; luôn đặt lại rào trước mỗi test.
beforeEach(() => {
  globalThis.fetch = guardedFetch;
});
