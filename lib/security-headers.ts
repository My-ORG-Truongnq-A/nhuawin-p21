/**
 * Header mặc định (BM-01) + lớp chặn index thứ hai bằng `X-Robots-Tag` (SEO-01).
 * Không import gì để `next.config.ts` dùng được. HSTS để Vercel tự thêm.
 */

type Header = { key: string; value: string };
type HeaderRule = {
  source: string;
  headers: Header[];
  missing?: { type: "host"; value: string }[];
};

export const SECURITY_HEADERS: Header[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const NOINDEX: Header = { key: "X-Robots-Tag", value: "noindex, nofollow" };

export function buildHeaders(opts: { indexable: boolean; canonicalHost: string }): HeaderRule[] {
  const rules: HeaderRule[] = [{ source: "/:path*", headers: SECURITY_HEADERS }];
  if (!opts.indexable) {
    rules.push({ source: "/:path*", headers: [NOINDEX] });
    return rules;
  }
  // Production được index: host phụ (alias *.vercel.app, apex/www còn lại) vẫn noindex.
  rules.push({ source: "/:path*", missing: [{ type: "host", value: opts.canonicalHost }], headers: [NOINDEX] });
  rules.push({ source: "/studio/:path*", headers: [NOINDEX] });
  return rules;
}
