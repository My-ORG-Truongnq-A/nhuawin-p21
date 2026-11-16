/**
 * Luật validate / phân quyền dùng trong schema Studio — viết thuần để test bằng Vitest
 * (không phụ thuộc runtime Studio, không gọi Sanity).
 */
import { isValidSlug } from "../../lib/slug/slugify-vi";

export type UserLike = { roles?: { name: string }[] } | null | undefined;
export type DocLike = { legacy?: { path?: string } | null; slug?: { current?: string } | null } | undefined;

export const isAdministrator = (user: UserLike): boolean =>
  Boolean(user?.roles?.some((r) => r.name === "administrator"));

/**
 * Slug chỉ đọc với người không phải Administrator (CM-04, REQ-01, REQ-18, REQ-19):
 * - "legacy": khi bản ghi có `legacy.path` (URL cũ đang được Google lập chỉ mục).
 * - "onceSet": khi slug đã có giá trị (slug là anchor / query ?loai= — đổi là gãy liên kết).
 */
export function isSlugLocked(mode: "legacy" | "onceSet", doc: DocLike, user: UserLike): boolean {
  if (isAdministrator(user)) return false;
  if (doc?.legacy?.path) return true;
  return mode === "onceSet" && Boolean(doc?.slug?.current);
}

/** Thông điệp validate slug; `true` = hợp lệ. */
export function checkSlug(slug: { current?: string } | undefined, opts: { forbidPrefix?: string } = {}): true | string {
  const s = slug?.current;
  if (!s) return true; // required() lo trường hợp rỗng
  if (!isValidSlug(s)) return "Slug chỉ gồm chữ thường không dấu, số và dấu '-' (vd fomex-3-ly).";
  if (opts.forbidPrefix && s.startsWith(opts.forbidPrefix)) return `Slug không gồm tiền tố '${opts.forbidPrefix}'.`;
  return true;
}

/** Kích thước ảnh lấy từ `_ref` asset Sanity: `image-<hash>-<w>x<h>-<ext>`. */
export function imageSizeFromRef(ref: string | undefined): { width: number; height: number } | null {
  const m = ref?.match(/^image-[a-zA-Z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

/** Ảnh hero / OG đủ lớn (CM-03). Chưa chọn ảnh → hợp lệ (required() xử lý riêng). */
export function checkMinImageSize(
  value: { asset?: { _ref?: string } } | undefined,
  min: { width: number; height?: number },
): true | string {
  const size = imageSizeFromRef(value?.asset?._ref);
  if (!size) return true;
  const needH = min.height ?? 0;
  if (size.width < min.width || size.height < needH) {
    const want = min.height ? `${min.width} × ${min.height}` : `rộng ${min.width}`;
    return `Ảnh ${size.width} × ${size.height} px quá nhỏ — cần tối thiểu ${want} px.`;
  }
  return true;
}

// ---------- Chuyển hướng (redirectSettings, CM-05) ----------

export type RedirectRule = { from?: string; to?: string; permanent?: boolean };

/** `from`: đường dẫn nội bộ bắt đầu '/', không tên miền; cho phép query. */
export function checkRedirectFrom(from: string | undefined): true | string {
  if (!from) return "Nhập đường dẫn cũ.";
  if (!from.startsWith("/") || from.startsWith("//")) return "Bắt đầu bằng '/', không có tên miền (vd /tin-tuc?chu-de=tin-win).";
  if (/\s/.test(from)) return "Không được có khoảng trắng.";
  return true;
}

/** `to`: đường dẫn nội bộ '/' hoặc URL https; khác `from`. */
export function checkRedirectTo(to: string | undefined, from: string | undefined): true | string {
  if (!to) return "Nhập đích chuyển hướng.";
  const internal = to.startsWith("/") && !to.startsWith("//");
  if (!internal && !/^https:\/\/[^\s]+$/.test(to)) return "Đích là đường dẫn bắt đầu '/' hoặc URL https.";
  if (from && normalizePath(to) === normalizePath(from)) return "Đích phải khác đường dẫn cũ.";
  return true;
}

const normalizePath = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/**
 * Luật trên cả danh sách: không trùng `from`; không chuỗi (to của luật này là from của luật khác);
 * `from` không che route đang có nội dung. Trả danh sách lỗi (rỗng = hợp lệ).
 */
export function checkRedirectRules(rules: RedirectRule[] | undefined, liveRoutes: readonly string[]): string[] {
  const list = (rules ?? []).filter((r) => r.from);
  const errors: string[] = [];
  const froms = new Map<string, number>();
  for (const r of list) {
    const f = normalizePath(r.from!);
    froms.set(f, (froms.get(f) ?? 0) + 1);
  }
  for (const [f, n] of froms) if (n > 1) errors.push(`Trùng đường dẫn cũ ${f} (${n} luật).`);
  for (const r of list) {
    if (r.to && froms.has(normalizePath(r.to))) {
      errors.push(`Chuỗi chuyển hướng: ${r.from} → ${r.to} → … — trỏ thẳng tới đích cuối.`);
    }
    if (liveRoutes.includes(normalizePath(r.from!))) {
      errors.push(`${r.from} đang là trang có nội dung — chuyển hướng sẽ che trang thật.`);
    }
  }
  return errors;
}

// ---------- Nhúng (embed) ----------

/** Chỉ cho nhúng YouTube hoặc Google Maps (CSP + quyền riêng tư). */
export function checkEmbedUrl(url: string | undefined): true | string {
  if (!url) return true;
  let host: string;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return "Chỉ nhận URL https.";
    host = u.hostname.replace(/^www\./, "");
  } catch {
    return "URL không hợp lệ.";
  }
  const ok =
    ["youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host) ||
    (host === "google.com" && new URL(url).pathname.startsWith("/maps")) ||
    host === "maps.google.com";
  return ok ? true : "Chỉ nhúng YouTube hoặc Google Maps.";
}

/** Câu lỗi form CRM phải chứa token {hotline} để thay bằng số chính. */
export const checkHotlineToken = (v: string | undefined): true | string =>
  !v || v.includes("{hotline}") ? true : "Phải chứa {hotline} — site thay bằng số chính trong Thông tin doanh nghiệp.";

/** Mẫu tiêu đề SEO phải chứa %s. */
export const checkTitleTemplate = (v: string | undefined): true | string =>
  !v || v.includes("%s") ? true : "Mẫu tiêu đề phải chứa %s (vị trí tiêu đề trang).";

/** Mã số thuế: 10 chữ số hoặc 10 chữ số + '-' + 3 chữ số. */
export const checkTaxId = (v: string | undefined): true | string =>
  !v || /^\d{10}(-\d{3})?$/.test(v) ? true : "Mã số thuế gồm 10 chữ số, chi nhánh dạng 0123456789-001.";

/** Đúng một số điện thoại là số chính. */
export function checkPrimaryPhone(phones: { isPrimary?: boolean }[] | undefined): true | string {
  const n = (phones ?? []).filter((p) => p.isPrimary).length;
  return n === 1 ? true : "Chọn đúng một số là số chính (hotline).";
}

/** Có ít nhất một liên kết tới trang Chính sách bảo mật trong Portable Text. */
export function hasPrivacyLink(blocks: unknown): boolean {
  if (!Array.isArray(blocks)) return false;
  return blocks.some((b) =>
    Array.isArray((b as { markDefs?: unknown[] })?.markDefs)
      ? (b as { markDefs: { internal?: { _ref?: string } }[] }).markDefs.some((d) => d?.internal?._ref === "privacyPage")
      : false,
  );
}
