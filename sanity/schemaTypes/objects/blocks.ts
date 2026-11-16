import { defineField, defineType } from "sanity";

/** Khối form tin nhắn trên trang: mặc định lấy câu chữ ở "Biểu mẫu (câu chữ)". */
export const messageFormBlock = defineType({
  name: "messageFormBlock",
  title: "Khối form tin nhắn",
  type: "object",
  fields: [
    defineField({ name: "useDefault", title: "Dùng câu chữ mặc định", type: "boolean", initialValue: true }),
    defineField({
      name: "heading",
      title: "Tiêu đề riêng",
      type: "string",
      hidden: ({ parent }) => (parent as { useDefault?: boolean } | undefined)?.useDefault !== false,
    }),
    defineField({
      name: "subheading",
      title: "Dòng nhỏ riêng",
      type: "string",
      hidden: ({ parent }) => (parent as { useDefault?: boolean } | undefined)?.useDefault !== false,
    }),
  ],
});

export const sectionHeading = defineType({
  name: "sectionHeading",
  title: "Tiêu đề khối",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Dòng nhỏ phía trên", type: "string" }),
    defineField({ name: "title", title: "Tiêu đề", type: "string" }),
    defineField({ name: "intro", title: "Đoạn mở", type: "text", rows: 3 }),
  ],
});

export const featureItem = defineType({
  name: "featureItem",
  title: "Ý nổi bật",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Mô tả", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Biểu tượng (tên icon trong bộ của site)", type: "string" }),
    defineField({ name: "image", title: "Ảnh", type: "figure" }),
    defineField({
      name: "verification",
      title: "Trạng thái xác minh",
      description: "Ý chờ khách xác nhận (số liệu, năng lực) không hiện trên site.",
      type: "string",
      initialValue: "confirmed",
      options: {
        list: [
          { title: "Đã xác nhận", value: "confirmed" },
          { title: "Chờ xác nhận — chưa hiện", value: "needs_confirmation" },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: { select: { title: "title", subtitle: "verification", media: "image" } },
});

export const processStep = defineType({
  name: "processStep",
  title: "Bước quy trình",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tên bước", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Mô tả", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Ảnh", type: "figure" }),
  ],
  preview: { select: { title: "title", media: "image" } },
});

/**
 * Một dòng bảng quy cách. Cột theo bản crawl — chờ chốt OQ-CM-01 trước khi seed.
 * Không có cột giá / chiết khấu / MOQ / chứng nhận (CM-09, REQ-14).
 */
export const specRow = defineType({
  name: "specRow",
  title: "Dòng quy cách",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Tên quy cách", type: "string", validation: (r) => r.required() }),
    defineField({ name: "nominal", title: "Độ dày danh nghĩa", type: "string" }),
    defineField({
      name: "grade",
      title: "Loại",
      type: "string",
      options: {
        list: [
          { title: "Thiếu", value: "thieu" },
          { title: "Đủ", value: "du" },
          { title: "Khác", value: "khac" },
        ],
      },
    }),
    defineField({
      name: "actualThicknessMm",
      title: "Độ dày thực tế (mm)",
      type: "number",
      validation: (r) =>
        r.positive().custom((v: number | undefined) =>
          v === undefined || Math.round(v * 10) === v * 10 ? true : "Tối đa 1 chữ số thập phân.",
        ),
    }),
    defineField({ name: "sizeMm", title: "Khổ (mm)", type: "string", initialValue: "1220 × 2440" }),
    defineField({ name: "sheetsPerBundle", title: "Số tấm / kẹp", type: "string" }),
    defineField({ name: "note", title: "Ghi chú", type: "string" }),
  ],
  preview: { select: { title: "label", subtitle: "actualThicknessMm" } },
});
