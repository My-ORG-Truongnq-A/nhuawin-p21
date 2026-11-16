import { defineArrayMember, defineField, defineType, type SlugRule } from "sanity";
import { slugifyVi } from "../../../lib/slug/slugify-vi";
import { checkSlug, isSlugLocked, type DocLike } from "../../lib/rules";

/**
 * 4 document có nhiều bản ghi (content_model documents). Không có lead / author / page tự do (excludedTypes).
 * Reference mặc định là mạnh → Sanity chặn xoá category / productGroup khi còn bài / ứng dụng trỏ tới.
 */

const slugField = (mode: "legacy" | "onceSet", opts: { title: string; forbidPrefix?: string }) =>
  defineField({
    name: "slug",
    title: opts.title,
    type: "slug",
    description:
      mode === "legacy"
        ? "Chữ thường không dấu. Bản ghi từ web cũ chỉ Administrator đổi được — đổi thì thêm luật chuyển hướng."
        : "Chữ thường không dấu. Đã đặt thì chỉ Administrator đổi được (dùng làm anchor / tham số URL).",
    options: { source: "title", slugify: slugifyVi, maxLength: 96 },
    readOnly: ({ document, currentUser }) => isSlugLocked(mode, document as DocLike, currentUser),
    validation: (r: SlugRule) =>
      r.required().custom((v: { current?: string } | undefined) => checkSlug(v, { forbidPrefix: opts.forbidPrefix })),
  });

const orderField = defineField({
  name: "order",
  title: "Thứ tự",
  type: "number",
  validation: (r) => r.required().integer().min(0),
});

const byOrder = [{ title: "Thứ tự", name: "orderAsc", by: [{ field: "order", direction: "asc" as const }] }];

export const productGroup = defineType({
  name: "productGroup",
  title: "Nhóm sản phẩm",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên nhóm", type: "string", validation: (r) => r.required() }),
    slugField("onceSet", { title: "Mã nhóm (anchor /san-pham#… và /bao-gia?loai=…)" }),
    orderField,
    defineField({ name: "nominalLabel", title: "Độ dày danh nghĩa", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "actualRangeMm",
      title: "Độ dày thực tế (mm)",
      type: "object",
      options: { columns: 2 },
      fields: [
        defineField({ name: "min", title: "Từ", type: "number", validation: (r) => r.required().positive() }),
        defineField({
          name: "max",
          title: "Đến",
          type: "number",
          validation: (r) =>
            r.required().custom((v: number | undefined, ctx) => {
              const min = (ctx.parent as { min?: number } | undefined)?.min;
              return v === undefined || min === undefined || v >= min ? true : "Phải ≥ giá trị 'Từ'.";
            }),
        }),
      ],
    }),
    defineField({ name: "sheetsPerBundle", title: "Số tấm / kẹp", type: "string" }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 3 }),
    defineField({ name: "badge", title: "Nhãn nhỏ trên thẻ (vd Phổ biến)", type: "string" }),
    defineField({ name: "image", title: "Ảnh nhóm", type: "figure", validation: (r) => r.required() }),
    defineField({
      name: "specs",
      title: "Quy cách thuộc nhóm",
      type: "array",
      of: [defineArrayMember({ type: "specRow" })],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "quoteCtaLabel", title: "Nhãn nút báo giá", type: "string" }),
  ],
  orderings: byOrder,
  preview: { select: { title: "title", subtitle: "nominalLabel", media: "image" } },
});

export const application = defineType({
  name: "application",
  title: "Ứng dụng",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên ứng dụng", type: "string", validation: (r) => r.required() }),
    slugField("onceSet", { title: "Mã ứng dụng (không gồm 'ung-dung-')", forbidPrefix: "ung-dung-" }),
    orderField,
    defineField({ name: "thicknessHint", title: "Độ dày gợi ý", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "recommendedGroups",
      title: "Nhóm sản phẩm phù hợp",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "productGroup" }] })],
      validation: (r) => r.unique(),
    }),
    defineField({ name: "summary", title: "Mô tả ngắn", type: "text", rows: 3 }),
    defineField({ name: "cardImage", title: "Ảnh thẻ", type: "figure", validation: (r) => r.required() }),
    defineField({
      name: "album",
      title: "Album ảnh",
      type: "array",
      of: [defineArrayMember({ type: "figure" })],
      options: { layout: "grid" },
      validation: (r) => r.min(1).warning("Chưa có ảnh album — thẻ vẫn hiện nhưng không mở được album."),
    }),
  ],
  orderings: byOrder,
  preview: {
    select: { title: "title", hint: "thicknessHint", album: "album", media: "cardImage" },
    prepare: ({ title, hint, album, media }) => ({
      title,
      subtitle: `${hint ?? ""} · ${(album ?? []).length} ảnh`,
      media,
    }),
  },
});

export const category = defineType({
  name: "category",
  title: "Chủ đề tin tức",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên chủ đề", type: "string", validation: (r) => r.required() }),
    slugField("legacy", { title: "Mã chủ đề (/tin-tuc?chu-de=…)" }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 2 }),
    orderField,
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "legacy", title: "Truy vết web cũ", type: "legacyId" }),
  ],
  orderings: byOrder,
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const post = defineType({
  name: "post",
  title: "Bài viết",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required().max(110) }),
    slugField("legacy", { title: "Đường dẫn (/tin-tuc/…)" }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime", validation: (r) => r.required() }),
    defineField({
      name: "updatedAt",
      title: "Ngày cập nhật",
      type: "datetime",
      validation: (r) =>
        r.custom((v: string | undefined, ctx) => {
          const pub = (ctx.document as { publishedAt?: string } | undefined)?.publishedAt;
          return !v || !pub || v >= pub ? true : "Ngày cập nhật phải sau ngày đăng.";
        }),
    }),
    defineField({
      name: "category",
      title: "Chủ đề",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", title: "Tóm tắt", type: "text", rows: 3, validation: (r) => r.max(200) }),
    defineField({ name: "mainImage", title: "Ảnh đại diện", type: "figure", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Nội dung", type: "blockContent", validation: (r) => r.required() }),
    defineField({
      name: "relatedPosts",
      title: "Bài liên quan (tuỳ chọn)",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "post" }],
          options: { filter: ({ document }) => ({ filter: "_id != $id", params: { id: document._id.replace(/^drafts\./, "") } }) },
        }),
      ],
      validation: (r) =>
        r
          .max(3)
          .unique()
          .custom((v: { _ref?: string }[] | undefined, ctx) => {
            const id = ctx.document?._id.replace(/^drafts\./, "");
            return (v ?? []).some((x) => x._ref === id) ? "Không chọn chính bài này." : true;
          }),
    }),
    defineField({ name: "author", title: "Tác giả", type: "string" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "legacy", title: "Truy vết web cũ", type: "legacyId" }),
  ],
  orderings: [{ title: "Mới nhất", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "publishedAt", cat: "category.title", media: "mainImage" },
    prepare: ({ title, date, cat, media }) => ({
      title,
      subtitle: [date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa đặt ngày", cat].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const documentTypes = [productGroup, application, category, post];
