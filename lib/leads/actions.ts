"use server";

import { getLeadForms, getProductGroups, getSiteSettings } from "@/lib/content";
import { sendToCrm } from "./crm";
import { type FieldErrors, LEAD_KINDS, type LeadKind, parseLead } from "./schema";

export type LeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Giữ dữ liệu đã nhập khi lỗi (không bắt nhập lại). */
  values?: Record<string, string>;
};

/**
 * Server action 3 form (T5.2, REQ-04). Kiểm lại ở server; lead đi thẳng CRM (digiagent_crm),
 * KHÔNG lưu Sanity, KHÔNG báo thành công khi CRM chưa nhận. Không log dữ liệu người gửi.
 */
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  const kind = String(form.get("$kind") ?? "") as LeadKind;
  if (!LEAD_KINDS.includes(kind)) return { status: "error", message: "Biểu mẫu không hợp lệ." };

  const [forms, groups, settings] = await Promise.all([getLeadForms(), getProductGroups(), getSiteSettings()]);
  const values = Object.fromEntries(
    [...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$") && k !== "website"),
  ) as Record<string, string>;

  const parsed = parseLead(kind, form, {
    roleOptions: forms.contact.roleOptions,
    needOptions: forms.contact.needOptions,
    productSlugs: groups.map((g) => g.slug),
  });
  if (parsed.spam) return { status: "success", message: forms.successMessage };
  if (!parsed.ok) return { status: "error", errors: parsed.errors, values, message: "Vui lòng kiểm tra các ô được đánh dấu." };

  const page = String(form.get("$page") ?? "");
  const sent = await sendToCrm({ kind, fields: parsed.data, page });
  if (!sent.ok) {
    const hotline = settings.phones[0]?.number ?? "";
    return { status: "error", values, message: forms.errorMessage.replace("{hotline}", hotline) };
  }
  return { status: "success", message: forms.successMessage };
}
