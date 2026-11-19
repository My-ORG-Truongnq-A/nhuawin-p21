import { defineField, defineType } from "sanity";
import { LINKABLE_TYPES } from "../../../lib/content/doc-paths";

/** Anchor được phép (sitemap.json — REQ-18). Thêm anchor mới phải thêm id tương ứng ở template. */
export const LINK_ANCHORS = [
  "top",
  "fomex-3-ly",
  "fomex-5-ly",
  "fomex-8-10-ly",
  "fomex-15-18-ly",
  "bang-quy-cach",
  "ung-dung",
  "ung-dung-bang-quang-cao-in-uv",
  "ung-dung-chu-noi-logo-khoi",
  "ung-dung-noi-that-vach-trang-tri",
  "ung-dung-backdrop-sinh-nhat",
  "ung-dung-backdrop-su-kien",
  "ung-dung-cat-dan-decal",
  "ung-dung-hashtag-check-in",
  "nang-luc",
  "nha-may",
  "doi-tuong",
  "dang-ky",
  "lien-he",
  "danh-sach",
  "chon-quy-cach",
] as const;

type LinkParent = { kind?: string } | undefined;

/**
 * Liên kết dùng chung (menu, nút, footer). Trang nội bộ chọn bằng reference → đổi slug không gãy link.
 * Gọi / Zalo / Facebook lấy số và URL từ Thông tin doanh nghiệp (không gõ lại).
 */
export const link = defineType({
  name: "link",
  title: "Liên kết",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Nhãn", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "kind",
      title: "Loại",
      type: "string",
      initialValue: "internal",
      options: {
        list: [
          { title: "Trang trong site", value: "internal" },
          { title: "Trang ngoài", value: "external" },
          { title: "Gọi số chính", value: "phone" },
          { title: "Zalo", value: "zalo" },
          { title: "Facebook", value: "facebook" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "internal",
      title: "Trang đích",
      type: "reference",
      to: LINKABLE_TYPES.map((type) => ({ type })),
      hidden: ({ parent }) => (parent as LinkParent)?.kind !== "internal",
      validation: (r) =>
        r.custom((v, ctx) =>
          (ctx.parent as LinkParent)?.kind === "internal" && !v ? "Chọn trang đích." : true,
        ),
    }),
    defineField({
      name: "anchor",
      title: "Vị trí trong trang",
      type: "string",
      options: { list: [...LINK_ANCHORS] },
      hidden: ({ parent }) => (parent as LinkParent)?.kind !== "internal",
    }),
    defineField({
      name: "external",
      title: "URL ngoài",
      type: "url",
      hidden: ({ parent }) => (parent as LinkParent)?.kind !== "external",
      validation: (r) =>
        r.uri({ scheme: ["https"] }).custom((v, ctx) =>
          (ctx.parent as LinkParent)?.kind === "external" && !v ? "Nhập URL https." : true,
        ),
    }),
    defineField({ name: "newTab", title: "Mở tab mới", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "label", subtitle: "kind" } },
});
