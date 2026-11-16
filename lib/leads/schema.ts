import { z } from "zod";

/**
 * Bộ trường + kiểm tra 3 form (T5.1, REQ-04). Lỗi tiếng Việt, hiển thị cạnh trường.
 * Câu chữ / lựa chọn hiển thị đọc từ leadForms (CMS); lựa chọn hợp lệ truyền vào khi kiểm.
 */

export const LEAD_KINDS = ["contact", "quote", "partnership"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

/** Số Việt Nam: 0xxxxxxxxx (10 số) hoặc +84 / 84; cho phép dấu cách, chấm, gạch. */
export function normalizeVnPhone(raw: string): string | undefined {
  const d = raw.replace(/[\s.\-()]/g, "");
  const m = d.match(/^(?:\+?84|0)([35789]\d{8})$/);
  return m ? `+84${m[1]}` : undefined;
}

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự.`);
const required = (msg: string, max = 120) => text(max).min(1, msg);
const phone = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .transform((v, ctx) => {
    const n = normalizeVnPhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Số điện thoại chưa đúng (vd 09xx xxx xxx)." });
      return z.NEVER;
    }
    return n;
  });

const oneOf = (options: readonly string[], msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => options.includes(v), msg);

export type LeadOptions = {
  roleOptions: readonly string[];
  needOptions: readonly string[];
  productSlugs: readonly string[];
};

export function leadSchema(kind: LeadKind, o: LeadOptions) {
  const base = { name: required("Vui lòng nhập họ và tên.", 80), phone };
  if (kind === "contact")
    return z.object({
      ...base,
      role: oneOf(o.roleOptions, "Vui lòng chọn bạn là ai."),
      need: oneOf(o.needOptions, "Vui lòng chọn nhu cầu."),
      note: text(1000).optional(),
    });
  if (kind === "quote")
    return z.object({
      ...base,
      role: oneOf(o.roleOptions, "Vui lòng chọn bạn là ai."),
      // Chưa chắc độ dày → bỏ trống, ghi hạng mục ở ghi chú (giữ như web cũ).
      product: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || o.productSlugs.includes(v), "Loại tấm không hợp lệ."),
      quantity: text(120).optional(),
      province: required("Vui lòng nhập tỉnh / thành giao hàng.", 80),
      note: text(1000).optional(),
    });
  return z.object({
    ...base,
    company: text(120).optional(),
    province: required("Vui lòng nhập tỉnh / thành.", 80),
    role: oneOf(o.roleOptions, "Vui lòng chọn loại hình."),
    note: text(1000).optional(),
  });
}

export type FieldErrors = Record<string, string>;

export type ParseResult =
  | { ok: true; data: Record<string, string>; spam: false }
  | { ok: false; errors: FieldErrors; spam: false }
  | { ok: false; errors: FieldErrors; spam: true };

/** Đọc FormData: honeypot `website` có giá trị → spam (trả như thành công, không gửi CRM). */
export function parseLead(kind: LeadKind, form: FormData, o: LeadOptions): ParseResult {
  if (String(form.get("website") ?? "").trim() !== "") return { ok: false, errors: {}, spam: true };
  const raw = Object.fromEntries(
    [...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$") && k !== "website"),
  ) as Record<string, string>;
  const r = leadSchema(kind, o).safeParse(raw);
  if (r.success) {
    const data = Object.fromEntries(Object.entries(r.data).filter(([, v]) => v !== undefined && v !== "")) as Record<string, string>;
    return { ok: true, data, spam: false };
  }
  const errors: FieldErrors = {};
  for (const i of r.error.issues) {
    const k = String(i.path[0] ?? "form");
    errors[k] ??= i.message;
  }
  return { ok: false, errors, spam: false };
}
