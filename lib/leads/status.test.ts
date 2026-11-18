import { describe, expect, it, vi } from "vitest";
import { LEAD_KINDS } from "./schema";
import { leadsStatus, leadsStatusResponse } from "./status";

describe("leadsStatus (LD-01)", () => {
  it.each([
    [{ LEADS_DRY_RUN: "1" }, true],
    [{ LEADS_DRY_RUN: "true", VERCEL_ENV: "preview" }, true],
    [{ LEADS_DRY_RUN: "0" }, false],
    [{}, false],
    [{ VERCEL_ENV: "production" }, false],
  ])("%o → dryRun %s", (env, dryRun) => {
    expect(leadsStatus(env).dryRun).toBe(dryRun);
  });

  it("production bỏ qua cờ LEADS_DRY_RUN như nhánh giao lead", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(leadsStatus({ LEADS_DRY_RUN: "1", VERCEL_ENV: "production" }).dryRun).toBe(false);
    warn.mockRestore();
  });

  it("kinds khớp danh sách form lead đi qua deliverLead", () => {
    expect(leadsStatus({}).kinds).toEqual([...LEAD_KINDS]);
  });
});

describe("leadsStatusResponse", () => {
  it("200, no-store, body chỉ có dryRun + kinds", async () => {
    const res = leadsStatusResponse({ LEADS_DRY_RUN: "1", DGA_API_URL: "https://crm.example.test", DGA_FORM_KEY: "secret" });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["dryRun", "kinds"]);
    expect(body).toEqual({ dryRun: true, kinds: [...LEAD_KINDS] });
    expect(JSON.stringify(body)).not.toMatch(/crm\.example|secret/);
  });
});
