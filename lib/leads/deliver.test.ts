import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliverLead, isDryRun } from "./deliver";
import { leadEmail, mimeMessage } from "./gmail";
import type { Lead } from "./lead";
import { leadDocument } from "./sanity-store";

const lead: Lead = {
  requestId: "6f1c2b9e-0d1a-4c55-9a51-1f0f7e1b2c3d",
  kind: "contact",
  fields: { name: "An <script>", phone: "+84900000001", note: "a & b\nc" },
  page: "/lien-he",
  pageUrl: "https://site.example/lien-he",
  attribution: { ft: { landing: "/", at: "t0" }, lt: { utm_source: "zalo", utm_campaign: "thu-11", landing: "/lien-he", at: "t1" } },
  submittedAt: "2026-11-16T03:01:00.000Z",
};

const CRM = { DGA_API_URL: "https://crm.example.test", DGA_FORM_KEY: "k" };
const SG = {
  LEAD_DESTINATION: "sanity_gmail",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "proj1",
  SANITY_API_WRITE_TOKEN: "w",
  GMAIL_CLIENT_ID: "c",
  GMAIL_CLIENT_SECRET: "s",
  GMAIL_REFRESH_TOKEN: "r",
  LEAD_TO_EMAIL: "sales@site.example",
};

/** Fetch giả theo host: trả mã HTTP cấu hình được, ghi lại lời gọi. Không gọi mạng thật. */
function fakeFetch(status: { sanity?: number; oauth?: number; gmail?: number; crm?: number }) {
  return vi.fn<typeof fetch>(async (input) => {
    const host = new URL(String(input)).host;
    const code = host.endsWith("api.sanity.io")
      ? (status.sanity ?? 200)
      : host === "oauth2.googleapis.com"
        ? (status.oauth ?? 200)
        : host === "gmail.googleapis.com"
          ? (status.gmail ?? 200)
          : (status.crm ?? 200);
    return new Response(JSON.stringify({ access_token: "at" }), { status: code });
  });
}
const hosts = (f: ReturnType<typeof fakeFetch>) => f.mock.calls.map(([u]) => new URL(String(u)).host);

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("isDryRun", () => {
  it.each([
    [{ LEADS_DRY_RUN: "1" }, true],
    [{ LEADS_DRY_RUN: "true", VERCEL_ENV: "preview" }, true],
    [{ LEADS_DRY_RUN: "0" }, false],
    [{}, false],
    [{ LEADS_DRY_RUN: "1", VERCEL_ENV: "production" }, false],
  ])("%o → %s", (env, v) => expect(isDryRun(env)).toBe(v));
});

describe("deliverLead (LD-01)", () => {
  it("dry run → thành công, 0 request", async () => {
    const f = fakeFetch({});
    expect(await deliverLead(lead, { ...CRM, LEADS_DRY_RUN: "1" }, f)).toEqual({ ok: true, dryRun: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("mặc định digiagent_crm", async () => {
    const f = fakeFetch({});
    expect(await deliverLead(lead, CRM, f)).toEqual({ ok: true });
    expect(hosts(f)).toEqual(["crm.example.test"]);
  });

  it("thiếu env đích → lỗi, không giả thành công", async () => {
    expect(await deliverLead(lead, {}, fakeFetch({}))).toEqual({ ok: false, reason: "not_configured" });
    expect(await deliverLead(lead, { LEAD_DESTINATION: "sanity_gmail" }, fakeFetch({}))).toEqual({ ok: false, reason: "all_failed" });
  });

  it("LEAD_DESTINATION lạ → lỗi", async () => {
    expect(await deliverLead(lead, { LEAD_DESTINATION: "mailchimp" }, fakeFetch({}))).toEqual({ ok: false, reason: "bad_destination" });
  });

  it.each([
    ["CMS + mail OK", {}, true, 0],
    ["CMS OK, mail lỗi → vẫn đã giao, đánh dấu mailStatus", { gmail: 500 }, true, 1],
    ["CMS lỗi, mail OK → đã giao", { sanity: 500 }, true, 0],
    ["cả hai lỗi → lỗi", { sanity: 500, oauth: 401 }, false, 0],
  ])("sanity_gmail: %s", async (_n, status, ok, patches) => {
    const f = fakeFetch(status);
    expect((await deliverLead(lead, SG, f)).ok).toBe(ok);
    const bodies = f.mock.calls.filter(([u]) => String(u).includes("api.sanity.io")).map(([, i]) => String(i?.body));
    expect(bodies.filter((b) => b.includes('"mailStatus":"failed"'))).toHaveLength(patches);
    expect(String(f.mock.calls[0][0])).toBe("https://proj1.api.sanity.io/v2026-11-01/data/mutate/production");
  });
});

describe("lưu Sanity / mail (LD-07, LD-05)", () => {
  it("_id lead.<requestId> (chỉ đọc bằng token), không chứa PII", () => {
    const doc = leadDocument(lead);
    expect(doc._id).toBe(`lead.${lead.requestId}`);
    expect(doc.fields.map((f) => f.label)).toEqual(["Họ và tên", "Số điện thoại", "Ghi chú"]);
    expect(doc.attribution).toMatchObject({ utm_source: "zalo", first_landing_page: "/" });
  });

  it("mail escape giá trị người nhập; có Nguồn / Chiến dịch / Trang gửi form", () => {
    const { html, subject } = leadEmail(lead);
    expect(html).toContain("An &lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("a &amp; b<br>c");
    expect(html).toMatch(/Nguồn[^]*zalo[^]*Chiến dịch[^]*thu-11[^]*Trang gửi form[^]*https:\/\/site\.example\/lien-he/);
    expect(subject).toBe("[Lead] Liên hệ — An <script>");
  });

  it("MIME: subject encoded-word (không chèn header được), body base64", () => {
    const raw = mimeMessage({ to: "a@b.c", subject: "x\r\nBcc: evil@x.y", html: "<p>Ê</p>" });
    const msg = Buffer.from(raw, "base64url").toString("utf8");
    const [head, body] = msg.split("\r\n\r\n");
    expect(head).not.toMatch(/^Bcc:/m);
    expect(head).toMatch(/^Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/m);
    expect(Buffer.from(body.replace(/\r\n/g, ""), "base64").toString("utf8")).toBe("<p>Ê</p>");
  });
});
