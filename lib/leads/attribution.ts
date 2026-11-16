/**
 * Nguồn lead (LD-05). Dùng chung client (ghi cookie) và server (đọc cookie khi gửi lead).
 * KHÔNG import zod / server-only: module này vào bundle client.
 *
 * Hai cookie first-party 30 ngày:
 *  - `lead_ft`: first-touch — lượt vào đầu tiên (kể cả direct), không bao giờ ghi đè;
 *  - `lead_lt`: last non-direct — lượt có UTM / click ID / referrer ngoài site; gặp lượt mới thì thay CẢ BỘ.
 * Không lưu query đầy đủ hay path của referrer (có thể chứa dữ liệu cá nhân).
 */

export const FIRST_TOUCH_COOKIE = "lead_ft";
export const LAST_TOUCH_COOKIE = "lead_lt";
export const ATTRIBUTION_MAX_AGE = 30 * 24 * 60 * 60;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;
const PARAM_KEYS = [...UTM_KEYS, ...CLICK_IDS] as const;
const MAX_LEN = 200;

type ParamKey = (typeof PARAM_KEYS)[number];
export type Touch = Partial<Record<ParamKey, string>> & { landing: string; referrer?: string; at: string };
export type Attribution = { ft?: Touch; lt?: Touch };
export type Visit = { touch: Touch; nonDirect: boolean };

const clip = (v: string) => v.trim().slice(0, MAX_LEN);

/** Một lượt vào trang: tách UTM / click ID; referrer ngoài site chỉ giữ origin. */
export function touchFromVisit(href: string, referrer: string, now: Date): Visit {
  const url = new URL(href);
  const touch: Touch = { landing: clip(url.pathname), at: now.toISOString() };
  let nonDirect = false;
  for (const k of PARAM_KEYS) {
    const v = clip(url.searchParams.get(k) ?? "");
    if (v) {
      touch[k] = v;
      nonDirect = true;
    }
  }
  try {
    const ref = new URL(referrer);
    if (/^https?:$/.test(ref.protocol) && ref.host !== url.host) {
      touch.referrer = ref.origin;
      nonDirect = true;
    }
  } catch {
    // Không có referrer / referrer hỏng → direct.
  }
  return { touch, nonDirect };
}

export function nextAttribution(cur: Attribution, visit: Visit): Attribution & { write: ("ft" | "lt")[] } {
  const write: ("ft" | "lt")[] = [];
  if (!cur.ft) write.push("ft");
  if (visit.nonDirect) write.push("lt");
  return { ft: cur.ft ?? visit.touch, lt: visit.nonDirect ? visit.touch : cur.lt, write };
}

export const serializeTouch = (t: Touch) => encodeURIComponent(JSON.stringify(t));

/** Đọc cookie (giá trị do trình duyệt gửi — không tin): chỉ nhận khoá biết trước, giá trị chuỗi. */
export function parseTouch(raw: string | undefined): Touch | undefined {
  if (!raw) return undefined;
  let o: unknown;
  try {
    o = JSON.parse(decodeURIComponent(raw));
  } catch {
    return undefined;
  }
  if (!o || typeof o !== "object" || Array.isArray(o)) return undefined;
  const src = o as Record<string, unknown>;
  if (typeof src.landing !== "string" || typeof src.at !== "string") return undefined;
  const t: Touch = { landing: clip(src.landing), at: clip(src.at) };
  for (const k of [...PARAM_KEYS, "referrer"] as const) {
    const v = src[k];
    if (typeof v === "string" && v.trim()) t[k] = clip(v);
  }
  return t;
}

/** Ngữ cảnh gửi kèm lead (CRM `context` / mail): UTM theo last non-direct, thiếu thì first-touch. */
export function attributionContext({ ft, lt }: Attribution): Record<string, string> {
  const main = lt ?? ft;
  if (!main) return {};
  const out: Record<string, string> = {};
  for (const k of PARAM_KEYS) if (main[k]) out[k] = main[k];
  if (main.referrer) out.referrer = main.referrer;
  out.landing_page = main.landing;
  if (ft && ft !== main) {
    for (const k of UTM_KEYS) if (ft[k]) out[`first_${k}`] = ft[k];
    if (ft.referrer) out.first_referrer = ft.referrer;
    out.first_landing_page = ft.landing;
  }
  if (ft) out.first_touch_at = ft.at;
  return out;
}
