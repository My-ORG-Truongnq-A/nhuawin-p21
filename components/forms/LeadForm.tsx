"use client";

import { type ReactNode, useActionState, useEffect, useId } from "react";
import { type LeadState, submitLead } from "@/lib/leads/actions";
import type { LeadKind } from "@/lib/leads/schema";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type ProductOption = { slug: string; title: string; hint?: string };

type Props = {
  kind: LeadKind;
  page: string;
  submitLabel: string;
  roleOptions: string[];
  needOptions?: string[];
  notePlaceholder?: string;
  products?: ProductOption[];
  /** Slug productGroup chọn sẵn (/bao-gia?loai=). */
  defaultProduct?: string;
  /** Ghi chú chính sách (render ở server từ leadForms.privacyNote). */
  privacyNote?: ReactNode;
  tone?: "light" | "dark";
};

const INITIAL: LeadState = { status: "idle" };

/**
 * Form lead (T5.3, REQ-04): lỗi cạnh trường, giữ dữ liệu khi lỗi, thông báo thành công tại chỗ,
 * honeypot `website`. Gửi thành công → dataLayer `generate_lead` (chỉ khi GTM đã gắn).
 */
export function LeadForm(p: Props) {
  const [state, action, pending] = useActionState(submitLead, INITIAL);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const v = state.values ?? {};
  const err = state.errors ?? {};
  const dark = p.tone === "dark";

  useEffect(() => {
    if (state.status === "success") window.dataLayer?.push({ event: "generate_lead", form: p.kind });
  }, [state, p.kind]);

  if (state.status === "success")
    return (
      <p role="status" className={`rounded-card p-6 text-base font-semibold ${dark ? "bg-surface/10 text-surface" : "bg-brand-100 text-ink"}`}>
        {state.message}
      </p>
    );

  const label = `mb-1.5 block text-sm font-semibold ${dark ? "text-surface" : "text-ink"}`;
  const input =
    "block min-h-12 w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-subtle aria-[invalid=true]:border-danger";
  const errCls = `mt-1 text-sm font-semibold ${dark ? "text-cyan-200" : "text-danger"}`;

  const field = (name: string, title: string, el: ReactNode) => (
    <div>
      <label htmlFor={id(name)} className={label}>
        {title}
      </label>
      {el}
      {err[name] && (
        <p id={id(`${name}-err`)} className={errCls}>
          {err[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: string, required = false) => ({
    id: id(name),
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? id(`${name}-err`) : undefined,
    required,
  });
  const select = (name: string, options: string[], placeholder: string) => (
    <select {...aria(name, true)} defaultValue={v[name] ?? ""} className={input}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );

  return (
    <form action={action} noValidate className="grid gap-5" aria-busy={pending}>
      <input type="hidden" name="$kind" value={p.kind} />
      <input type="hidden" name="$page" value={p.page} />
      {/* Honeypot: người thật không thấy, không tab tới. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {p.kind === "quote" && p.products && (
        <fieldset id="chon-quy-cach" className="grid gap-3">
          <legend className={`${label} mb-3`}>Loại tấm</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.products.map((o) => (
              <label
                key={o.slug}
                className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-surface p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-100"
              >
                <input
                  type="radio"
                  name="product"
                  value={o.slug}
                  defaultChecked={(v.product ?? p.defaultProduct) === o.slug}
                  className="mt-1 size-4 accent-brand"
                />
                <span>
                  <span className="block font-semibold text-ink">{o.title}</span>
                  {o.hint && <span className="block text-sm text-muted">{o.hint}</span>}
                </span>
              </label>
            ))}
          </div>
          {err.product && <p className={errCls}>{err.product}</p>}
        </fieldset>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Họ và tên *", <input {...aria("name", true)} autoComplete="name" defaultValue={v.name} className={input} />)}
        {field(
          "phone",
          p.kind === "contact" ? "Số điện thoại *" : "Số điện thoại / Zalo *",
          <input {...aria("phone", true)} type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} className={input} />,
        )}
        {p.kind === "partnership" &&
          field("company", "Tên công ty / cửa hàng", <input {...aria("company")} autoComplete="organization" defaultValue={v.company} className={input} />)}
        {p.kind !== "contact" &&
          field(
            "province",
            p.kind === "quote" ? "Tỉnh / thành giao hàng *" : "Tỉnh / thành *",
            <input {...aria("province", true)} autoComplete="address-level1" defaultValue={v.province} className={input} />,
          )}
        {field("role", p.kind === "partnership" ? "Loại hình *" : "Bạn là *", select("role", p.roleOptions, "Chọn…"))}
        {p.kind === "contact" && p.needOptions && field("need", "Bạn cần *", select("need", p.needOptions, "Chọn…"))}
        {p.kind === "quote" &&
          field("quantity", "Số lượng dự kiến (tấm / kẹp)", <input {...aria("quantity")} defaultValue={v.quantity} className={input} />)}
      </div>

      {field(
        "note",
        p.kind === "partnership" ? "Sản lượng dự kiến / tháng, ghi chú" : (p.notePlaceholder ?? "Ghi chú"),
        <textarea {...aria("note")} rows={4} defaultValue={v.note} className={input} />,
      )}

      {state.status === "error" && state.message && (
        <p role="alert" className={errCls}>
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center rounded-pill bg-brand px-6 text-base font-semibold text-surface transition-colors hover:bg-brand-700 disabled:opacity-70"
        >
          {pending ? "Đang gửi…" : p.submitLabel}
        </button>
        {p.privacyNote && <div className={`text-sm ${dark ? "text-surface/80" : "text-muted"}`}>{p.privacyNote}</div>}
      </div>
    </form>
  );
}
