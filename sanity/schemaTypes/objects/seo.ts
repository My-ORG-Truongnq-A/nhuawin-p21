import { defineField, defineType } from "sanity";
import { checkRedirectFrom, checkRedirectTo, isAdministrator } from "../../lib/rules";
import { ogImageRule } from "./media";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Tiêu đề SEO (≤ 60 ký tự)",
      type: "string",
      validation: (r) => r.max(60).warning("Tiêu đề dài hơn 60 ký tự sẽ bị Google cắt."),
    }),
    defineField({
      name: "description",
      title: "Mô tả SEO (120–160 ký tự)",
      type: "text",
      rows: 3,
      validation: (r) => [r.min(120).warning("Mô tả nên từ 120 ký tự."), r.max(160).warning("Mô tả nên ≤ 160 ký tự.")],
    }),
    defineField({ name: "ogImage", title: "Ảnh chia sẻ (≥ 1200 × 630)", type: "figure", validation: ogImageRule }),
    defineField({ name: "noindex", title: "Không cho Google lập chỉ mục", type: "boolean", initialValue: false }),
    defineField({
      name: "canonicalOverride",
      title: "Canonical thay thế (để trống = tự trỏ)",
      type: "url",
      hidden: ({ currentUser }) => !isAdministrator(currentUser),
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
  ],
});

/** Truy vết bản ghi web cũ (REQ-01) — điền khi migrate, chỉ Administrator sửa. */
export const legacyId = defineType({
  name: "legacyId",
  title: "Truy vết web cũ",
  type: "object",
  options: { collapsible: true, collapsed: true },
  readOnly: ({ currentUser }) => !isAdministrator(currentUser),
  fields: [
    defineField({ name: "url", title: "URL gốc", type: "url" }),
    defineField({ name: "path", title: "Đường dẫn gốc", type: "string" }),
    defineField({ name: "sourceId", title: "ID gốc", type: "string" }),
    defineField({ name: "crawledAt", title: "Thời điểm crawl", type: "datetime" }),
    defineField({ name: "lastmod", title: "lastmod trong sitemap cũ", type: "date" }),
  ],
});

export const redirect = defineType({
  name: "redirect",
  title: "Chuyển hướng",
  type: "object",
  fields: [
    defineField({
      name: "from",
      title: "Đường dẫn cũ",
      type: "string",
      validation: (r) => r.custom((v: string | undefined) => checkRedirectFrom(v)),
    }),
    defineField({
      name: "to",
      title: "Chuyển tới",
      type: "string",
      validation: (r) =>
        r.custom((v: string | undefined, ctx) => checkRedirectTo(v, (ctx.parent as { from?: string } | undefined)?.from)),
    }),
    defineField({ name: "permanent", title: "Vĩnh viễn (301/308)", type: "boolean", initialValue: true }),
    defineField({ name: "note", title: "Ghi chú", type: "string" }),
  ],
  preview: {
    select: { from: "from", to: "to" },
    prepare: ({ from, to }) => ({ title: `${from ?? "?"} → ${to ?? "?"}` }),
  },
});
