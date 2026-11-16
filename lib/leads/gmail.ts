import "server-only";
import { attributionContext } from "./attribution";
import { type Delivery, type Env, FIELD_LABELS, KIND_LABELS, type Lead } from "./lead";

/**
 * Đích `sanity_gmail` — phần mail thông báo tới `LEAD_TO_EMAIL` qua Gmail API (OAuth refresh token),
 * gọi bằng fetch (không thêm thư viện SMTP). Mọi giá trị người dùng nhập được escape (LD-07);
 * mail hiện Nguồn / Chiến dịch / Trang gửi form (LD-05).
 *
 * Biến: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, LEAD_TO_EMAIL; GMAIL_SENDER (tuỳ chọn).
 */

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

export function leadEmail(lead: Lead): { subject: string; html: string } {
  const ctx = attributionContext(lead.attribution);
  const source = [ctx.utm_source, ctx.utm_medium].filter(Boolean).join(" / ") || ctx.referrer || "Trực tiếp";
  const rows: [string, string][] = [
    ...Object.entries(lead.fields).map(([k, v]): [string, string] => [FIELD_LABELS[k] ?? k, v]),
    ["Nguồn", source],
    ["Chiến dịch", ctx.utm_campaign ?? "—"],
    ["Trang gửi form", lead.pageUrl],
    ["Trang vào đầu tiên", ctx.first_landing_page ?? ctx.landing_page ?? "—"],
    ["Mã yêu cầu", lead.requestId],
  ];
  const body = rows
    .map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${escapeHtml(k)}</th><td style="padding:4px 0">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  return {
    subject: `[Lead] ${KIND_LABELS[lead.kind]} — ${lead.fields.name ?? ""}`.replace(/[\r\n]+/g, " ").trim(),
    html: `<!doctype html><html><body><h2>${escapeHtml(KIND_LABELS[lead.kind])}</h2><table>${body}</table></body></html>`,
  };
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

/** RFC 5322, base64url cho Gmail API. Subject dạng encoded-word → không chèn được header. */
export function mimeMessage(m: { from?: string; to: string; subject: string; html: string }): string {
  const headers = [
    ...(m.from ? [`From: ${m.from}`] : []),
    `To: ${m.to}`,
    `Subject: =?UTF-8?B?${b64(m.subject)}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  const body = b64(m.html).replace(/.{76}(?=.)/g, "$&\r\n");
  return Buffer.from(`${headers.join("\r\n")}\r\n\r\n${body}`, "utf8").toString("base64url");
}

export async function sendLeadMail(lead: Lead, env: Env, fetchImpl: typeof fetch = fetch): Promise<Delivery> {
  const [id, secret, refresh, to] = [env.GMAIL_CLIENT_ID, env.GMAIL_CLIENT_SECRET, env.GMAIL_REFRESH_TOKEN, env.LEAD_TO_EMAIL].map((v) => v?.trim());
  if (!id || !secret || !refresh || !to) return { ok: false, reason: "not_configured" };
  try {
    const tokenRes = await fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: "refresh_token" }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!tokenRes.ok) return { ok: false, reason: `oauth_${tokenRes.status}` };
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return { ok: false, reason: "oauth_no_token" };

    const raw = mimeMessage({ from: env.GMAIL_SENDER?.trim() || undefined, to, ...leadEmail(lead) });
    const res = await fetchImpl("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? { ok: true } : { ok: false, reason: `gmail_${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}
