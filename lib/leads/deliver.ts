import "server-only";
import { sendToCrm } from "./crm";
import { sendLeadMail } from "./gmail";
import type { Delivery, Env, Lead } from "./lead";
import { markMailFailed, storeLeadInSanity } from "./sanity-store";

/**
 * Giao lead theo `LEAD_DESTINATION` (LD-01): `digiagent_crm` (mặc định) | `sanity_gmail`.
 * Đổi đích chỉ cần đổi env. `LEADS_DRY_RUN=1` (preview / test) → không gửi thật;
 * production (VERCEL_ENV=production) bỏ qua cờ này để không bao giờ mất lead thật.
 */

const TRUTHY = new Set(["1", "true"]);

export function isDryRun(env: Env): boolean {
  if (!TRUTHY.has((env.LEADS_DRY_RUN ?? "").trim().toLowerCase())) return false;
  if (env.VERCEL_ENV === "production") {
    console.warn("[leads] LEADS_DRY_RUN bị bỏ qua ở production.");
    return false;
  }
  return true;
}

export async function deliverLead(lead: Lead, env: Env, fetchImpl: typeof fetch = fetch): Promise<Delivery> {
  if (isDryRun(env)) {
    console.info(`[leads] DRY_RUN — không gửi lead ${lead.requestId} (${lead.kind}).`);
    return { ok: true, dryRun: true };
  }

  const dest = env.LEAD_DESTINATION?.trim() || "digiagent_crm";
  if (dest === "digiagent_crm") return sendToCrm(lead, env, fetchImpl);
  if (dest !== "sanity_gmail") {
    console.warn(`[leads] LEAD_DESTINATION không hợp lệ — lead ${lead.requestId} không được gửi.`);
    return { ok: false, reason: "bad_destination" };
  }

  // Lưu CMS và gửi mail song song; "đã giao" khi ít nhất một bên thành công.
  const [stored, mailed] = await Promise.all([storeLeadInSanity(lead, env, fetchImpl), sendLeadMail(lead, env, fetchImpl)]);
  if (stored.ok && !mailed.ok) {
    console.warn(`[leads] Mail lỗi (${mailed.reason}) cho lead ${lead.requestId} — đánh dấu trong Studio.`);
    await markMailFailed(lead.requestId, env, fetchImpl);
  }
  if (stored.ok || mailed.ok) return { ok: true };
  console.warn(`[leads] Không giao được lead ${lead.requestId} (sanity: ${stored.reason}, mail: ${mailed.reason}).`);
  return { ok: false, reason: "all_failed" };
}
