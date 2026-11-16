/**
 * Cấu hình đo lường (TR-01, HN-05). Không import gì: dùng được ở server và client.
 * - Chỉ production thật (VERCEL_ENV=production) và có ID hợp lệ trong env mới nhúng.
 * - Một đường nạp: có GTM → GTM-only (GA4 cấu hình trong container); chỉ có GA → gtag trực tiếp.
 * - Không fallback ID thật trong code.
 */

export type TrackingConfig = { mode: "gtm"; id: string } | { mode: "gtag"; id: string } | null;

const GTM_ID = /^GTM-[A-Z0-9]{4,12}$/;
const GA_ID = /^G-[A-Z0-9]{4,16}$/;

export function trackingConfig(o: { production: boolean; gtmId?: string; gaId?: string }): TrackingConfig {
  if (!o.production) return null;
  const gtm = o.gtmId?.trim().toUpperCase();
  if (gtm && GTM_ID.test(gtm)) return { mode: "gtm", id: gtm };
  const ga = o.gaId?.trim().toUpperCase();
  if (ga && GA_ID.test(ga)) return { mode: "gtag", id: ga };
  return null;
}

export function tagScriptUrl(cfg: NonNullable<TrackingConfig>): string {
  return cfg.mode === "gtm"
    ? `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(cfg.id)}`
    : `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.id)}`;
}

/** Script inline dựng hàng đợi ngay (sự kiện trước khi thư viện tải xong không bị mất). */
export function queueBootScript(cfg: NonNullable<TrackingConfig>): string {
  const id = JSON.stringify(cfg.id);
  return cfg.mode === "gtm"
    ? "window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});"
    : `window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',${id});`;
}

/** URL có click ID quảng cáo → nạp thư viện ngay (HN-05 ngoại lệ). */
export function hasAdClickId(search: string): boolean {
  const q = new URLSearchParams(search);
  return ["gclid", "gbraid", "wbraid", "fbclid"].some((k) => q.has(k));
}
