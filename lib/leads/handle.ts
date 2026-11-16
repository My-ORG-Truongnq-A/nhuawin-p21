import "server-only";
import type { Attribution } from "./attribution";
import { deliverLead } from "./deliver";
import type { Env, Lead } from "./lead";
import { type KvStore, doneKey, rateLimitKey, takeToken } from "./rate-limit";
import { type FieldErrors, LEAD_KINDS, type LeadKind, type LeadOptions, parseLead } from "./schema";

export type LeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Giữ dữ liệu đã nhập khi lỗi (form không JS). */
  values?: Record<string, string>;
  /** Chỉ có khi lead đã giao — client dùng để bắn `generate_lead` đúng 1 lần (TR-02). */
  requestId?: string;
  formType?: LeadKind;
};

export type LeadContext = {
  options: LeadOptions;
  messages: { success: string; error: string; rateLimited: string };
  ip: string;
  attribution: Attribution;
  siteUrl: string;
  env: Env;
  store: KvStore | null;
  now: Date;
  newId: () => string;
  fetch?: typeof fetch;
};

export const RATE_LIMIT = { limit: 5, windowSec: 10 * 60 };
const DONE_TTL = 24 * 60 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function alreadyDone(store: KvStore | null, id: string): Promise<boolean> {
  if (!store) return false;
  try {
    return (await store.get(doneKey(id))) !== null;
  } catch {
    return false;
  }
}

/**
 * Lõi server action (LD-01): honeypot / thời gian điền → zod → idempotent theo requestId →
 * rate limit (chỉ đếm lượt hợp lệ) → giao lead → trả thành công. Chưa giao được thì KHÔNG báo
 * thành công; lỗi luôn kèm hotline và giữ dữ liệu đã nhập.
 */
export async function handleLead(form: FormData, ctx: LeadContext): Promise<LeadState> {
  const kind = String(form.get("$kind") ?? "") as LeadKind;
  if (!LEAD_KINDS.includes(kind)) return { status: "error", message: ctx.messages.error };

  const values = Object.fromEntries(
    [...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$") && k !== "website"),
  ) as Record<string, string>;

  const parsed = parseLead(kind, form, ctx.options);
  // Bot: trả như thành công nhưng không giao, không requestId → không đếm chuyển đổi (LD-04).
  if (parsed.spam) return { status: "success", message: ctx.messages.success };
  if (!parsed.ok) return { status: "error", errors: parsed.errors, values, message: "Vui lòng kiểm tra các ô được đánh dấu." };

  const rid = String(form.get("$rid") ?? "");
  const requestId = UUID.test(rid) ? rid.toLowerCase() : ctx.newId();
  const success: LeadState = { status: "success", message: ctx.messages.success, requestId, formType: kind };

  // Gửi lại đúng request đã giao (mạng chập chờn, bấm 2 lần) → trả lại thành công, không gửi lần hai.
  if (await alreadyDone(ctx.store, requestId)) return success;

  const gate = await takeToken(ctx.store, rateLimitKey(kind, ctx.ip), RATE_LIMIT);
  if (!gate.allowed) return { status: "error", values, message: ctx.messages.rateLimited };

  const rawPage = String(form.get("$page") ?? "/");
  const page = rawPage.startsWith("/") && !rawPage.startsWith("//") ? rawPage.slice(0, 200) : "/";
  const lead: Lead = {
    requestId,
    kind,
    fields: parsed.data,
    page,
    pageUrl: new URL(page, ctx.siteUrl).toString(),
    attribution: ctx.attribution,
    submittedAt: ctx.now.toISOString(),
  };
  const sent = await deliverLead(lead, ctx.env, ctx.fetch);
  if (!sent.ok) return { status: "error", values, message: ctx.messages.error };

  try {
    await ctx.store?.set(doneKey(requestId), "1", DONE_TTL);
  } catch {
    // Lead đã giao; mất khoá idempotent chỉ làm lượt gửi lại (hiếm) bị gửi lần hai.
  }
  return success;
}
