/**
 * Kiểm cục bộ (không gọi Sanity) trước khi ghi: các luật bắt buộc của schema mà API ghi KHÔNG tự chặn.
 * Lỗi → chặn --apply. Cảnh báo → ghi vào báo cáo.
 */
import { isValidSlug } from "../../../lib/slug/slugify-vi";
import type { AssetInfo } from "./assets";
import type { SanityDoc } from "./to-docs";

type Obj = Record<string, unknown>;
export type Issues = { errors: string[]; warnings: string[] };

function walk(v: unknown, fn: (o: Obj, path: string) => void, path = "") {
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, fn, `${path}[${i}]`));
  else if (v && typeof v === "object") {
    fn(v as Obj, path);
    for (const [k, x] of Object.entries(v as Obj)) walk(x, fn, `${path}.${k}`);
  }
}

export function validateDocs(docs: SanityDoc[], assets: AssetInfo[]): Issues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const assetIds = new Set(assets.map((a) => a.assetId));
  for (const d of docs) {
    if (ids.has(d._id)) errors.push(`${d._id}: trùng _id`);
    ids.add(d._id);
  }
  const need = (d: SanityDoc, fields: string[]) => {
    for (const f of fields) if (d[f] === undefined) errors.push(`${d._id}: thiếu trường bắt buộc "${f}"`);
  };
  for (const d of docs) {
    walk(d, (o, p) => {
      if (typeof o._ref === "string") {
        const r = o._ref;
        if (r.startsWith("image-") ? !assetIds.has(r) : !ids.has(r)) errors.push(`${d._id}${p}: tham chiếu gãy → ${r}`);
      }
      if (o._type === "figure") {
        const alt = typeof o.alt === "string" ? o.alt : "";
        if (alt.length < 5 || alt.length > 160) errors.push(`${d._id}${p}: alt phải 5–160 ký tự (đang ${alt.length})`);
      }
      if (typeof o._key === "string" && o._key.length === 0) errors.push(`${d._id}${p}: _key rỗng`);
    });
    // _key trùng trong cùng mảng
    walk(d, (o, p) => {
      for (const [k, arr] of Object.entries(o)) {
        if (!Array.isArray(arr)) continue;
        const keys = arr.map((x) => (x && typeof x === "object" ? (x as Obj)._key : undefined)).filter(Boolean);
        if (new Set(keys).size !== keys.length) errors.push(`${d._id}${p}.${k}: _key trùng trong mảng`);
      }
    });
    const slug = (d.slug as { current?: string } | undefined)?.current;
    if (d.slug !== undefined && (!slug || !isValidSlug(slug))) errors.push(`${d._id}: slug không hợp lệ (${slug})`);
    const seo = d.seo as { title?: string; description?: string } | undefined;
    if (seo?.title && seo.title.length > 60) warnings.push(`${d._id}: seo.title ${seo.title.length} ký tự (> 60)`);
    if (seo?.description && (seo.description.length < 120 || seo.description.length > 160))
      warnings.push(`${d._id}: seo.description ${seo.description.length} ký tự (khuyến nghị 120–160)`);

    switch (d._type) {
      case "siteSettings": {
        need(d, ["siteName", "legalName", "logoFull", "email", "phones"]);
        const primaries = ((d.phones as Obj[]) ?? []).filter((p) => p.isPrimary).length;
        if (primaries !== 1) errors.push(`siteSettings: cần đúng 1 số chính, đang ${primaries}`);
        break;
      }
      case "post": {
        need(d, ["title", "slug", "publishedAt", "category", "mainImage", "body"]);
        if (String(d.title).length > 110) errors.push(`${d._id}: title > 110 ký tự`);
        if (String(d.excerpt ?? "").length > 200) errors.push(`${d._id}: excerpt > 200 ký tự`);
        break;
      }
      case "category":
        need(d, ["title", "slug", "order"]);
        break;
      case "productGroup":
        need(d, ["title", "slug", "order", "nominalLabel", "image", "specs"]);
        if (!((d.specs as unknown[]) ?? []).length) errors.push(`${d._id}: specs rỗng`);
        break;
      case "application":
        need(d, ["title", "slug", "order", "thicknessHint", "cardImage"]);
        if (!((d.album as unknown[]) ?? []).length) warnings.push(`${d._id}: chưa có album ảnh`);
        break;
      case "leadForms":
        need(d, ["messageFormDefault", "contact", "quote", "partnership", "successMessage", "errorMessage"]);
        warnings.push("leadForms.privacyNote chưa có link tới Chính sách bảo mật (trang chưa có nội dung — MI-15): Studio sẽ báo lỗi validate cho tới khi có.");
        break;
      default:
    }
  }
  return { errors, warnings: [...new Set(warnings)] };
}
