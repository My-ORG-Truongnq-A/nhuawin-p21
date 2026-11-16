import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";
import { heroImageRule } from "../objects";

/** Singleton trang (_id = tên type). Mỗi route trong sitemap.json là một template cố định. */

const seoField = defineField({ name: "seo", title: "SEO", type: "seo", validation: (r) => r.required() });
const h1Field = defineField({ name: "title", title: "Tiêu đề H1", type: "string", validation: (r) => r.required() });
const introField = defineField({ name: "intro", title: "Đoạn mở đầu", type: "text", rows: 3 });
const heroImageField = defineField({ name: "heroImage", title: "Ảnh đầu trang (rộng ≥ 1200 px)", type: "figure", validation: heroImageRule });
const faqField = defineField({ name: "faq", title: "Câu hỏi thường gặp", type: "faq" });
const messageFormField = defineField({ name: "messageForm", title: "Khối form tin nhắn", type: "messageFormBlock" });
const legacyField = defineField({ name: "legacy", title: "Truy vết web cũ", type: "legacyId" });

const features = (name: string, title: string, count?: number) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "featureItem" })],
    validation: (r) =>
      r.custom((v: unknown[] | undefined) =>
        !count || (v ?? []).length === count ? true : `Mockup có ${count} mục.`,
      ).warning(),
  });

const headed = (name: string, title: string, extra: FieldDefinition[]) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [defineField({ name: "heading", title: "Tiêu đề khối", type: "sectionHeading" }), ...extra],
  });

const page = (name: string, title: string, fields: FieldDefinition[]) =>
  defineType({ name, title, type: "document", fields, preview: { prepare: () => ({ title }) } });

export const homePage = page("homePage", "Trang chủ", [
  seoField,
  defineField({
    name: "hero",
    title: "Hero",
    type: "object",
    validation: (r) => r.required(),
    fields: [
      defineField({ name: "eyebrow", title: "Dòng nhỏ trên tiêu đề (kicker)", type: "string" }),
      defineField({
        name: "headlineLines",
        title: "Tiêu đề H1 (mỗi dòng một mục)",
        type: "array",
        of: [{ type: "string" }],
        validation: (r) => r.required().min(1).max(3),
      }),
      defineField({ name: "subheadline", title: "Đoạn dưới tiêu đề", type: "text", rows: 3 }),
      defineField({ name: "image", title: "Ảnh hero (rộng ≥ 1200 px)", type: "figure", validation: (r) => heroImageRule(r.required()) }),
      defineField({ name: "primaryCta", title: "Nút chính", type: "link", validation: (r) => r.required() }),
      defineField({ name: "secondaryCta", title: "Nút phụ", type: "link" }),
    ],
  }),
  headed("capability", "Năng lực sản xuất", [features("items", "Ý chính")]),
  defineField({ name: "productGroupsSection", title: "Khối 4 nhóm sản phẩm", type: "sectionHeading" }),
  defineField({ name: "applicationsSection", title: "Khối 7 ứng dụng", type: "sectionHeading" }),
  headed("partnerSection", "Đồng hành cùng đối tác", [defineField({ name: "cta", title: "Nút", type: "link" })]),
  headed("latestPosts", "Tin mới", [
    defineField({ name: "count", title: "Số bài", type: "number", initialValue: 3, validation: (r) => r.integer().min(1).max(6) }),
  ]),
  messageFormField,
  legacyField,
]);

export const productsPage = page("productsPage", "Trang Sản phẩm", [
  seoField,
  h1Field,
  introField,
  heroImageField,
  defineField({ name: "groupsSection", title: "Khối \"Chọn theo độ dày\"", type: "sectionHeading" }),
  headed("specTableSection", "Bảng quy cách (#bang-quy-cach)", [
    defineField({ name: "footnote", title: "Ghi chú dưới bảng", type: "text", rows: 2 }),
  ]),
  defineField({ name: "applicationsSection", title: "Khối ứng dụng (#ung-dung)", type: "sectionHeading" }),
  headed("whyChoose", "Vì sao chọn tấm Fomex", [features("items", "Ý chính")]),
  defineField({ name: "chooseByUseSection", title: "Chọn độ dày theo hạng mục", type: "sectionHeading" }),
  defineField({
    name: "chooseByUseRows",
    title: "Bảng chọn độ dày theo hạng mục",
    type: "array",
    of: [
      defineArrayMember({
        name: "useRow",
        type: "object",
        fields: [
          defineField({ name: "use", title: "Hạng mục", type: "string", validation: (r) => r.required() }),
          defineField({ name: "thickness", title: "Độ dày gợi ý", type: "string", validation: (r) => r.required() }),
          defineField({ name: "note", title: "Ghi chú", type: "string" }),
        ],
        preview: { select: { title: "use", subtitle: "thickness" } },
      }),
    ],
  }),
  faqField,
  messageFormField,
  legacyField,
]);

export const quotePage = page("quotePage", "Trang Báo giá", [
  seoField,
  h1Field,
  introField,
  features("benefits", "Ý cạnh form"),
  faqField,
  legacyField,
]);

export const aboutPage = page("aboutPage", "Trang Về WIN", [
  seoField,
  h1Field,
  introField,
  heroImageField,
  defineField({ name: "storyHeading", title: "Tiêu đề khối giới thiệu", type: "sectionHeading" }),
  defineField({ name: "story", title: "Câu chuyện WIN", type: "blockContent" }),
  defineField({ name: "storyImage", title: "Ảnh khối giới thiệu", type: "figure" }),
  defineField({ name: "mission", title: "Sứ mệnh", type: "text", rows: 3 }),
  defineField({ name: "vision", title: "Tầm nhìn", type: "text", rows: 3 }),
  defineField({ name: "values", title: "Giá trị cốt lõi", type: "array", of: [{ type: "string" }] }),
  headed("capability", "Năng lực (#nang-luc)", [features("items", "Ý chính")]),
  headed("factory", "Nhà máy (#nha-may)", [
    defineField({ name: "processSteps", title: "Quy trình sản xuất", type: "array", of: [defineArrayMember({ type: "processStep" })] }),
    defineField({ name: "gallery", title: "Ảnh nhà máy", type: "array", of: [defineArrayMember({ type: "figure" })], options: { layout: "grid" } }),
    defineField({ name: "visitCta", title: "Nút đặt lịch tham quan", type: "link" }),
  ]),
  messageFormField,
  legacyField,
]);

export const partnershipPage = page("partnershipPage", "Trang Hợp tác", [
  seoField,
  h1Field,
  introField,
  heroImageField,
  headed("partnerGroups", "Đối tượng hợp tác (#doi-tuong)", [features("items", "Đối tượng", 3)]),
  defineField({
    name: "growTogether",
    title: "Hợp tác cùng phát triển",
    type: "object",
    fields: [
      defineField({ name: "eyebrow", title: "Dòng nhỏ phía trên", type: "string" }),
      defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
      defineField({ name: "intro", title: "Đoạn mở", type: "text", rows: 3 }),
      features("benefits", "Lợi ích", 4),
      defineField({ name: "logisticsImage", title: "Ảnh xe nâng / xe tải tại nhà máy", type: "figure" }),
    ],
  }),
  defineField({
    name: "processSteps",
    title: "Quy trình hợp tác",
    type: "array",
    of: [defineArrayMember({ type: "processStep" })],
    validation: (r) => r.custom((v: unknown[] | undefined) => ((v ?? []).length === 4 ? true : "Mockup có 4 bước.")).warning(),
  }),
  defineField({ name: "registerCta", title: "Nút đăng ký", type: "link", validation: (r) => r.required() }),
  faqField,
  legacyField,
]);

export const newsPage = page("newsPage", "Trang Tin tức", [
  seoField,
  h1Field,
  introField,
  defineField({
    name: "postsPerPage",
    title: "Số bài mỗi trang",
    type: "number",
    validation: (r) => r.required().integer().min(6).max(24),
  }),
  defineField({ name: "emptyText", title: "Câu khi chủ đề chưa có bài", type: "string" }),
  defineField({
    name: "articleCta",
    title: "Khối CTA cuối bài (dùng chung)",
    type: "object",
    fields: [
      defineField({ name: "heading", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
      defineField({ name: "text", title: "Đoạn", type: "text", rows: 2 }),
      defineField({ name: "cta", title: "Nút", type: "link", validation: (r) => r.required() }),
    ],
  }),
  legacyField,
]);

export const contactPage = page("contactPage", "Trang Liên hệ", [
  seoField,
  h1Field,
  introField,
  defineField({ name: "showMap", title: "Hiện bản đồ", type: "boolean", initialValue: true }),
  messageFormField,
  legacyField,
]);

export const privacyPage = page("privacyPage", "Chính sách bảo mật", [
  seoField,
  defineField({ name: "title", title: "Tiêu đề H1", type: "string", validation: (r) => r.required() }),
  defineField({ name: "body", title: "Nội dung", type: "blockContent", validation: (r) => r.required() }),
  defineField({ name: "updatedAt", title: "Ngày cập nhật", type: "date", validation: (r) => r.required() }),
]);

/** Trang 404 phải gợi ý đủ 4 trang chính (REQ-17). */
const NOT_FOUND_REQUIRED = ["homePage", "productsPage", "quotePage", "contactPage"];

export const notFoundPage = page("notFoundPage", "Trang 404", [
  defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
  defineField({ name: "text", title: "Lời nhắn", type: "text", rows: 3 }),
  defineField({
    name: "links",
    title: "Liên kết gợi ý",
    type: "array",
    of: [defineArrayMember({ type: "link" })],
    validation: (r) =>
      r
        .custom((v: { internal?: { _ref?: string } }[] | undefined) => {
          const refs = new Set((v ?? []).map((l) => l.internal?._ref));
          const missing = NOT_FOUND_REQUIRED.filter((id) => !refs.has(id));
          return missing.length === 0 ? true : `Nên có link tới: ${missing.join(", ")}.`;
        })
        .warning(),
  }),
]);

export const pageSingletons = [
  homePage,
  productsPage,
  quotePage,
  aboutPage,
  partnershipPage,
  newsPage,
  contactPage,
  privacyPage,
  notFoundPage,
];
