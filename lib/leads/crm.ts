import "server-only";
import { attributionContext } from "./attribution";
import type { Delivery, Env, Lead } from "./lead";

/**
 * Đích `digiagent_crm` (mặc định, LD-02): server-to-server
 * `POST {DGA_API_URL}/api/v1/public/forms/{DGA_FORM_KEY}/submit`.
 * ⚠ Endpoint chưa kiểm trên tài khoản thật (MI-18). Domain site phải nằm trong `allowed_domains`
 * của form CRM, nếu không CRM vẫn trả "thành công" nhưng không tạo lead (G6 cần người xác nhận).
 *
 * Chưa cấu hình → trả lỗi (form hiện hotline), KHÔNG báo thành công giả. Log chỉ ghi kind + requestId.
 */

const RESERVED = ["name", "phone", "email"] as const;

export function crmPayload(lead: Lead) {
  const custom: Record<string, string> = { form_type: lead.kind };
  for (const [k, v] of Object.entries(lead.fields)) if (!(RESERVED as readonly string[]).includes(k)) custom[k] = v;
  const reserved = Object.fromEntries(RESERVED.filter((k) => lead.fields[k]).map((k) => [k, lead.fields[k]]));
  return {
    ...reserved,
    custom_fields: custom,
    context: { page_url: lead.pageUrl, ...attributionContext(lead.attribution) },
    request_id: lead.requestId,
  };
}

export async function sendToCrm(lead: Lead, env: Env, fetchImpl: typeof fetch = fetch): Promise<Delivery> {
  const base = env.DGA_API_URL?.trim().replace(/\/+$/, "");
  const key = env.DGA_FORM_KEY?.trim();
  if (!base || !key) {
    console.warn(`[leads] Chưa cấu hình DGA_API_URL / DGA_FORM_KEY — lead ${lead.requestId} (${lead.kind}) không được gửi.`);
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetchImpl(`${base}/api/v1/public/forms/${encodeURIComponent(key)}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": lead.requestId },
      body: JSON.stringify(crmPayload(lead)),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[leads] CRM trả ${res.status} cho lead ${lead.requestId} (${lead.kind}).`);
      return { ok: false, reason: `http_${res.status}` };
    }
    return { ok: true };
  } catch {
    console.warn(`[leads] Không gọi được CRM cho lead ${lead.requestId} (${lead.kind}).`);
    return { ok: false, reason: "network" };
  }
}
