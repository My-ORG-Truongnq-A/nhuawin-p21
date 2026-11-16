import "server-only";
import type { LeadKind } from "./schema";

/**
 * Adapter digiagent_crm (LEAD_DESTINATION). ⚠ Endpoint chưa kiểm trên tài khoản thật (MI-18):
 * POST JSON tới DGA_API_URL kèm khoá form DGA_FORM_KEY. Chưa cấu hình → không gửi, trả lỗi để form
 * hiện số hotline (không báo thành công giả). Không ghi log nội dung lead.
 */
export type CrmLead = { kind: LeadKind; fields: Record<string, string>; page: string };

export async function sendToCrm(lead: CrmLead, env: Record<string, string | undefined> = process.env): Promise<{ ok: boolean; reason?: string }> {
  const url = env.DGA_API_URL?.trim();
  const key = env.DGA_FORM_KEY?.trim();
  if (!url || !key) {
    console.warn("[leads] Chưa cấu hình DGA_API_URL / DGA_FORM_KEY — lead không được gửi.");
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Form-Key": key },
      body: JSON.stringify({ form: lead.kind, fields: lead.fields, source: { page: lead.page } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.warn(`[leads] CRM trả ${res.status}.`);
    return res.ok ? { ok: true } : { ok: false, reason: `http_${res.status}` };
  } catch {
    console.warn("[leads] Không gọi được CRM.");
    return { ok: false, reason: "network" };
  }
}
