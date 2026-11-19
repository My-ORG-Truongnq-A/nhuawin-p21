import { defineArrayMember, defineField, defineType } from "sanity";
import { PAGE_TYPES } from "../../../lib/content/doc-paths";

type LinkMark = { kind?: string } | undefined;

/** Link trong Portable Text: trỏ trang trong site bằng reference, hoặc URL ngoài / mailto / tel. */
const linkAnnotation = defineArrayMember({
  name: "link",
  title: "Liên kết",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Loại",
      type: "string",
      initialValue: "internal",
      options: { list: [{ title: "Trang trong site", value: "internal" }, { title: "Ngoài site", value: "external" }], layout: "radio" },
    }),
    defineField({
      name: "internal",
      title: "Trang đích",
      type: "reference",
      to: [...PAGE_TYPES, "post", "category"].map((type) => ({ type })),
      hidden: ({ parent }) => (parent as LinkMark)?.kind !== "internal",
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      hidden: ({ parent }) => (parent as LinkMark)?.kind !== "external",
      validation: (r) => r.uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
    defineField({ name: "newTab", title: "Mở tab mới", type: "boolean", initialValue: false }),
    defineField({ name: "nofollow", title: "nofollow", type: "boolean", initialValue: false }),
  ],
});

/** Portable Text rút gọn — câu trả lời FAQ, ghi chú dưới form. */
export const simpleBlockContent = defineType({
  name: "simpleBlockContent",
  title: "Văn bản ngắn",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Thường", value: "normal" }],
      lists: [
        { title: "Gạch đầu dòng", value: "bullet" },
        { title: "Đánh số", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Đậm", value: "strong" },
          { title: "Nghiêng", value: "em" },
        ],
        annotations: [linkAnnotation],
      },
    }),
  ],
});

export const faq = defineType({
  name: "faq",
  title: "Câu hỏi thường gặp",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề khối", type: "string" }),
    defineField({
      name: "items",
      title: "Câu hỏi",
      type: "array",
      validation: (r) => r.min(1),
      of: [
        defineArrayMember({
          name: "faqItem",
          title: "Câu hỏi",
          type: "object",
          fields: [
            defineField({ name: "question", title: "Câu hỏi", type: "string", validation: (r) => r.required() }),
            defineField({ name: "answer", title: "Trả lời", type: "simpleBlockContent", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({ title: title || "Câu hỏi thường gặp", subtitle: `${(items ?? []).length} câu` }),
  },
});

/**
 * Portable Text cho bài viết, câu chuyện Về WIN, chính sách bảo mật.
 * Không có h1 (H1 do template render từ title). brandHighlight: màu lấy từ token trong code, không chọn màu trong CMS.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Nội dung",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Thường", value: "normal" },
        { title: "Tiêu đề 2", value: "h2" },
        { title: "Tiêu đề 3", value: "h3" },
        { title: "Tiêu đề 4", value: "h4" },
        { title: "Trích dẫn", value: "blockquote" },
      ],
      lists: [
        { title: "Gạch đầu dòng", value: "bullet" },
        { title: "Đánh số", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Đậm", value: "strong" },
          { title: "Nghiêng", value: "em" },
          { title: "Gạch chân", value: "underline" },
          { title: "Nhấn màu thương hiệu", value: "brandHighlight" },
        ],
        annotations: [linkAnnotation],
      },
    }),
    defineArrayMember({ type: "figure" }),
    defineArrayMember({ type: "table", title: "Bảng (hàng đầu là tiêu đề)" }),
    defineArrayMember({ type: "embed" }),
    defineArrayMember({ type: "faq" }),
  ],
});
