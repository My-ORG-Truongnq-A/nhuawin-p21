import { createClient } from "next-sanity";
import { describe, expect, it } from "vitest";

/** Gộp message của lỗi và mọi `cause` (client HTTP hay bọc lỗi gốc). */
function messages(err: unknown): string {
  const out: string[] = [];
  for (let e = err as { message?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    out.push(String(e.message ?? e));
    if (out.length > 10) break;
  }
  return out.join(" ← ");
}

describe("no-network guard (Sanity gói Free)", () => {
  it("fetch tới *.sanity.io → lỗi ngay", () => {
    expect(() => fetch("https://abc123.apicdn.sanity.io/v1/data/query/production?query=*")).toThrow(
      /no-network/,
    );
  });

  it("client Sanity thật trong test → lỗi, không ra mạng", async () => {
    const client = createClient({
      projectId: "abc123",
      dataset: "production",
      apiVersion: "2026-11-01",
      useCdn: true,
    });
    const err = await client.fetch("*[_type == 'siteSettings'][0]").then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).not.toBeNull();
    expect(messages(err)).toMatch(/no-network/);
  });
});
