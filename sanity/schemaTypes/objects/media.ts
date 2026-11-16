import { defineField, defineType, type Rule } from "sanity";
import { checkEmbedUrl, checkMinImageSize } from "../../lib/rules";

/** Ảnh có alt bắt buộc 5–160 ký tự (CM-03); ghi nguồn ảnh (MI-10). */
export const figure = defineType({
  name: "figure",
  title: "Ảnh",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Mô tả ảnh (alt)",
      description: "Tả đúng nội dung ảnh cho người dùng trình đọc màn hình và Google (5–160 ký tự).",
      type: "string",
      validation: (r) => r.required().min(5).max(160),
    }),
    defineField({ name: "caption", title: "Chú thích", type: "string" }),
    defineField({
      name: "source",
      title: "Nguồn ảnh",
      type: "string",
      initialValue: "client_provided",
      options: {
        list: [
          { title: "Khách cung cấp", value: "client_provided" },
          { title: "Lấy từ web cũ (chờ xác nhận quyền dùng)", value: "legacy_site" },
        ],
        layout: "radio",
      },
    }),
  ],
});

type ImageValue = { asset?: { _ref?: string } } | undefined;

/** Validation dùng lại cho ảnh hero (rộng ≥ 1200) và ảnh OG (≥ 1200 × 630). Ghép sau `r.required()` khi bắt buộc. */
export const heroImageRule = (r: Rule) => r.custom((v) => checkMinImageSize(v as ImageValue, { width: 1200 }));
export const ogImageRule = (r: Rule) => r.custom((v) => checkMinImageSize(v as ImageValue, { width: 1200, height: 630 }));

/** Nhúng iframe — chỉ YouTube / Google Maps; title bắt buộc cho thuộc tính title của iframe. */
export const embed = defineType({
  name: "embed",
  title: "Nhúng video / bản đồ",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL (YouTube hoặc Google Maps)",
      type: "url",
      validation: (r) => r.required().custom((v: string | undefined) => checkEmbedUrl(v)),
    }),
    defineField({ name: "title", title: "Tiêu đề khung nhúng", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "title", subtitle: "url" } },
});
