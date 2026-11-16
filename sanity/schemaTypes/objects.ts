import { defineArrayMember, defineField, defineType } from "sanity";

/** Ảnh có alt bắt buộc (ND-03). */
export const figure = defineType({
  name: "figure",
  title: "Ảnh",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Mô tả ảnh (alt)",
      type: "string",
      validation: (r) => r.required().error("Cần mô tả ảnh cho người dùng trình đọc màn hình và SEO."),
    }),
  ],
});

export const link = defineType({
  name: "link",
  title: "Liên kết",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Loại",
      type: "string",
      initialValue: "internal",
      options: { list: [{ title: "Trang trong site", value: "internal" }, { title: "Trang ngoài", value: "external" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "path",
      title: "Đường dẫn (vd /san-pham)",
      type: "string",
      hidden: ({ parent }) => parent?.kind !== "internal",
      validation: (r) => r.regex(/^\/[a-z0-9\-/]*$/, { name: "path" }).error("Bắt đầu bằng '/', chữ thường không dấu."),
    }),
    defineField({ name: "anchor", title: "Neo trong trang (vd bang-quy-cach)", type: "string", hidden: ({ parent }) => parent?.kind !== "internal" }),
    defineField({
      name: "url",
      title: "URL ngoài",
      type: "url",
      hidden: ({ parent }) => parent?.kind !== "external",
      validation: (r) => r.uri({ scheme: ["https", "http"] }),
    }),
  ],
});

const navItemFields = [
  defineField({ name: "label", title: "Nhãn", type: "string", validation: (r) => r.required() }),
  defineField({ name: "link", title: "Liên kết", type: "link", validation: (r) => r.required() }),
];

export const navItem = defineType({
  name: "navItem",
  title: "Mục menu",
  type: "object",
  fields: [
    ...navItemFields,
    defineField({
      name: "children",
      title: "Menu con",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "navChild", title: "Mục con", fields: navItemFields })],
    }),
  ],
  preview: { select: { title: "label", subtitle: "link.path" } },
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề SEO (≤ 60 ký tự, gồm tên thương hiệu)", type: "string", validation: (r) => r.max(60).warning() }),
    defineField({ name: "description", title: "Mô tả SEO (120–160 ký tự)", type: "text", rows: 3, validation: (r) => r.min(120).max(160).warning() }),
    defineField({ name: "ogImage", title: "Ảnh chia sẻ 1200×630", type: "figure" }),
    defineField({ name: "noindex", title: "Không cho Google lập chỉ mục", type: "boolean", initialValue: false }),
  ],
});

export const objectTypes = [figure, link, navItem, seo];
