/**
 * Sự kiện đo lường (TR-02, TR-03; bảng ở docs/tracking.md). Không import gì: chạy ở client.
 * Không gửi PII (tên, SĐT, nội dung người gõ).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type TrackTarget = { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

/** gtag trực tiếp (chế độ chỉ GA4) → gtag('event'); còn lại → dataLayer cho GTM. */
export function trackEvent(w: TrackTarget, name: string, params: Record<string, string>): void {
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params);
    return;
  }
  (w.dataLayer ??= []).push({ event: name, ...params });
}

const sentLeads = new Set<string>();

/**
 * `generate_lead` — chỉ gọi khi server xác nhận đã giao lead (có requestId).
 * Chống đếm đúp theo requestId: remount / effect chạy lại không bắn lần hai.
 */
export function trackLead(
  w: TrackTarget,
  e: { requestId: string; formType: string; pagePath: string },
  sent: Set<string> = sentLeads,
): boolean {
  if (!e.requestId || sent.has(e.requestId)) return false;
  sent.add(e.requestId);
  trackEvent(w, "generate_lead", { form_name: `${e.formType}_form`, form_type: e.formType, page_path: e.pagePath });
  return true;
}

export type ContactEvent = "click_phone" | "click_zalo" | "click_messenger" | "click_fanpage" | "click_email" | "click_directions";

/** Phân loại link liên hệ theo href (một listener ở document đo mọi nút đúng định dạng). */
export function classifyContactHref(href: string): ContactEvent | null {
  const h = href.trim().toLowerCase();
  if (h.startsWith("tel:")) return "click_phone";
  if (h.startsWith("mailto:")) return "click_email";
  let url: URL;
  try {
    url = new URL(h);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "zalo.me" || host.endsWith(".zalo.me")) return "click_zalo";
  if (host === "m.me" || host === "messenger.com") return "click_messenger";
  if (host === "facebook.com" || host === "fb.com" || host === "m.facebook.com") return "click_fanpage";
  if (
    host === "maps.app.goo.gl" ||
    host === "maps.google.com" ||
    (host === "goo.gl" && url.pathname.startsWith("/maps")) ||
    (/^google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps"))
  )
    return "click_directions";
  return null;
}
