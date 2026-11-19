import "server-only";
import { attributionContext } from "./attribution";
import { type Delivery, type Env, FIELD_LABELS, type Lead } from "./lead";

/**
 * Đích `sanity_gmail` — phần lưu CMS (LD-07). Ghi đúng 1 mutation mỗi lead (Sanity gói Free).
 * `_id` = `lead.<requestId>`: ID có dấu chấm chỉ đọc được bằng token, kể cả dataset public;
 * `createIfNotExists` → gửi lại cùng request không tạo bản trùng.
 * Loại `lead` không có trong schema Studio (CM-10) — bật đích này thì thêm loại xem-chỉ-đọc.
 */

function endpoint(env: Env): { url: string; token: string } | null {
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const token = env.SANITY_API_WRITE_TOKEN?.trim();
  if (!projectId || !token) return null;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const version = env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2026-11-01";
  return { url: `https://${projectId}.api.sanity.io/v${version}/data/mutate/${dataset}`, token };
}

export const leadDocId = (requestId: string) => `lead.${requestId}`;

export function leadDocument(lead: Lead) {
  return {
    _id: leadDocId(lead.requestId),
    _type: "lead",
    kind: lead.kind,
    page: lead.page,
    pageUrl: lead.pageUrl,
    submittedAt: lead.submittedAt,
    fields: Object.entries(lead.fields).map(([name, value]) => ({
      _key: name,
      _type: "leadField",
      name,
      label: FIELD_LABELS[name] ?? name,
      value,
    })),
    attribution: attributionContext(lead.attribution),
  };
}

async function mutate(env: Env, mutations: unknown[], fetchImpl: typeof fetch): Promise<Delivery> {
  const ep = endpoint(env);
  if (!ep) return { ok: false, reason: "not_configured" };
  try {
    const res = await fetchImpl(ep.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${ep.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ mutations }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? { ok: true } : { ok: false, reason: `http_${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export const storeLeadInSanity = (lead: Lead, env: Env, fetchImpl: typeof fetch = fetch) =>
  mutate(env, [{ createIfNotExists: leadDocument(lead) }], fetchImpl);

/** Mail thông báo lỗi → đánh dấu trên bản ghi để người vận hành thấy trong Studio. */
export const markMailFailed = (requestId: string, env: Env, fetchImpl: typeof fetch = fetch) =>
  mutate(env, [{ patch: { id: leadDocId(requestId), set: { mailStatus: "failed" } } }], fetchImpl);
