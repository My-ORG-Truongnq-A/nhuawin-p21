import { defineArrayMember, defineField, defineType } from "sanity";
import { PAGE_PATHS } from "../../../lib/content/doc-paths";
import {
  checkHotlineToken,
  checkPrimaryPhone,
  checkRedirectRules,
  checkTaxId,
  checkTitleTemplate,
  hasPrivacyLink,
  type RedirectRule,
} from "../../lib/rules";
import { ogImageRule } from "../objects";

/** Singleton cấu hình chung (_id = tên type). Mọi NAP / câu chữ form hiển thị trên site đọc từ đây. */

const DAY_OPTIONS = [
  { title: "Thứ 2", value: "Mo" },
  { title: "Thứ 3", value: "Tu" },
  { title: "Thứ 4", value: "We" },
  { title: "Thứ 5", value: "Th" },
  { title: "Thứ 6", value: "Fr" },
  { title: "Thứ 7", value: "Sa" },
  { title: "Chủ nhật", value: "Su" },
];

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Thông tin doanh nghiệp",
  type: "document",
  groups: [
    { name: "identity", title: "Định danh", default: true },
    { name: "contact", title: "Liên hệ" },
    { name: "hours", title: "Giờ làm việc" },
    { name: "social", title: "Mạng xã hội" },
    { name: "floating", title: "Nút nổi" },
    { name: "legal", title: "Pháp lý" },
    { name: "seo", title: "SEO mặc định" },
    { name: "tracking", title: "Đo lường" },
  ],
  fields: [
    defineField({ name: "siteName", title: "Tên hiển thị", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "legalName", title: "Tên pháp nhân", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "identity" }),
    defineField({ name: "showTagline", title: "Hiện tagline dạng chữ", type: "boolean", initialValue: false, group: "identity" }),
    defineField({
      name: "areaServed",
      title: "Khu vực phục vụ (JSON-LD, llms.txt)",
      type: "string",
      group: "identity",
    }),
    defineField({ name: "logoFull", title: "Logo đầy đủ", type: "figure", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "logoHeader", title: "Logo cho thanh menu (bản rút gọn)", type: "figure", group: "identity" }),
    defineField({
      name: "favicon",
      title: "Favicon (vuông, ≥ 512 × 512 px)",
      type: "image",
      group: "identity",
    }),
    defineField({
      name: "phones",
      title: "Số điện thoại",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          name: "phone",
          type: "object",
          fields: [
            defineField({ name: "display", title: "Số hiển thị (vd 0900 000 000)", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "e164",
              title: "Số quốc tế cho link gọi (vd +84900000000)",
              type: "string",
              validation: (r) => r.required().regex(/^\+84\d{9,10}$/, { name: "E.164" }),
            }),
            defineField({ name: "label", title: "Nhãn (vd Kinh doanh)", type: "string" }),
            defineField({ name: "isPrimary", title: "Số chính (hotline)", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "display", subtitle: "label" } },
        }),
      ],
      validation: (r) => r.required().min(1).custom((v: { isPrimary?: boolean }[] | undefined) => checkPrimaryPhone(v)),
    }),
    defineField({ name: "email", title: "Email", type: "string", group: "contact", validation: (r) => r.required().email() }),
    defineField({
      name: "address",
      title: "Địa chỉ nhà máy",
      type: "object",
      group: "contact",
      validation: (r) => r.required(),
      fields: [
        defineField({ name: "display", title: "Địa chỉ hiển thị", type: "string", validation: (r) => r.required() }),
        defineField({ name: "streetAddress", title: "Số nhà / khu", type: "string" }),
        defineField({ name: "ward", title: "Xã / phường", type: "string" }),
        defineField({ name: "city", title: "Tỉnh / thành phố", type: "string" }),
        defineField({ name: "postalCode", title: "Mã bưu chính", type: "string" }),
        defineField({ name: "country", title: "Quốc gia (mã ISO)", type: "string", readOnly: true, initialValue: "VN" }),
      ],
    }),
    defineField({ name: "googleMapsUrl", title: "Link Google Maps", type: "url", group: "contact" }),
    defineField({ name: "mapEmbedUrl", title: "Link nhúng bản đồ (iframe)", type: "url", group: "contact" }),
    defineField({ name: "geo", title: "Toạ độ (cho JSON-LD)", type: "geopoint", group: "contact" }),
    defineField({
      name: "openingHours",
      title: "Giờ làm việc",
      type: "array",
      group: "hours",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: "openingHoursRow",
          type: "object",
          fields: [
            defineField({
              name: "days",
              title: "Ngày",
              type: "array",
              of: [{ type: "string" }],
              options: { list: DAY_OPTIONS },
              validation: (r) => r.required().min(1),
            }),
            defineField({ name: "opens", title: "Mở (HH:MM)", type: "string", validation: (r) => r.required().regex(HHMM, { name: "HH:MM" }) }),
            defineField({ name: "closes", title: "Đóng (HH:MM)", type: "string", validation: (r) => r.required().regex(HHMM, { name: "HH:MM" }) }),
          ],
          preview: {
            select: { days: "days", opens: "opens", closes: "closes" },
            prepare: ({ days, opens, closes }) => ({ title: (days ?? []).join(", "), subtitle: `${opens ?? "?"}–${closes ?? "?"}` }),
          },
        }),
      ],
    }),
    defineField({ name: "hoursNote", title: "Ghi chú giờ làm việc (nghỉ lễ…)", type: "string", group: "hours" }),
    defineField({
      name: "socialLinks",
      title: "Mạng xã hội",
      type: "array",
      group: "social",
      of: [
        defineArrayMember({
          name: "socialLink",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Nền tảng",
              type: "string",
              options: { list: ["zalo", "facebook", "youtube", "tiktok"] },
              validation: (r) => r.required(),
            }),
            defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
            defineField({ name: "label", title: "Tên hiển thị", type: "string" }),
            defineField({
              name: "confirmed",
              title: "Khách đã xác nhận (mới hiện trên site / sameAs)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "floatingContact",
      title: "Cụm nút liên hệ nổi",
      type: "object",
      group: "floating",
      fields: [
        defineField({ name: "enabled", title: "Bật", type: "boolean", initialValue: true }),
        defineField({ name: "showCall", title: "Nút Gọi (số chính)", type: "boolean", initialValue: true }),
        defineField({ name: "showZalo", title: "Nút Zalo", type: "boolean", initialValue: true }),
        defineField({ name: "showFacebook", title: "Nút Facebook", type: "boolean", initialValue: true }),
      ],
    }),
    defineField({
      name: "legal",
      title: "Thông tin pháp lý",
      type: "object",
      group: "legal",
      fields: [
        defineField({ name: "taxId", title: "Mã số thuế", type: "string", validation: (r) => r.custom((v: string | undefined) => checkTaxId(v)) }),
        defineField({ name: "registeredAddress", title: "Địa chỉ đăng ký kinh doanh", type: "string" }),
        defineField({
          name: "foundedYear",
          title: "Năm thành lập",
          type: "number",
          validation: (r) => r.integer().min(1900).max(new Date().getFullYear()),
        }),
      ],
    }),
    defineField({
      name: "seoDefaults",
      title: "SEO mặc định",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "titleTemplate",
          title: "Mẫu tiêu đề (vd %s | Tên thương hiệu)",
          type: "string",
          validation: (r) => r.required().custom((v: string | undefined) => checkTitleTemplate(v)),
        }),
        defineField({
          name: "defaultDescription",
          title: "Mô tả mặc định",
          type: "text",
          rows: 3,
          validation: (r) => [r.min(120).warning("Nên từ 120 ký tự."), r.max(160).warning("Nên ≤ 160 ký tự.")],
        }),
        defineField({
          name: "defaultOgImage",
          title: "Ảnh chia sẻ mặc định (≥ 1200 × 630)",
          type: "figure",
          validation: (r) => ogImageRule(r.required()),
        }),
      ],
    }),
    defineField({
      name: "gtmId",
      title: "Mã Google Tag Manager (để trống = không gắn)",
      type: "string",
      group: "tracking",
      validation: (r) => r.regex(/^GTM-[A-Z0-9]+$/, { name: "GTM-XXXX" }),
    }),
  ],
  preview: { prepare: () => ({ title: "Thông tin doanh nghiệp" }) },
});

const navChildren = defineField({
  name: "children",
  title: "Menu con (1 cấp)",
  type: "array",
  of: [defineArrayMember({ type: "link" })],
});

export const header = defineType({
  name: "header",
  title: "Menu trên (header)",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Mục menu",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: "navItem",
          title: "Mục menu",
          type: "object",
          fields: [defineField({ name: "link", title: "Liên kết", type: "link", validation: (r) => r.required() }), navChildren],
          preview: { select: { title: "link.label", children: "children" }, prepare: ({ title, children }) => ({ title, subtitle: `${(children ?? []).length} mục con` }) },
        }),
      ],
    }),
    defineField({ name: "cta", title: "Nút chính", type: "link", validation: (r) => r.required() }),
  ],
  preview: { prepare: () => ({ title: "Menu trên (header)" }) },
});

export const footer = defineType({
  name: "footer",
  title: "Chân trang (footer)",
  type: "document",
  fields: [
    defineField({ name: "intro", title: "Đoạn giới thiệu ngắn", type: "text", rows: 3 }),
    defineField({
      name: "columns",
      title: "Cột liên kết",
      type: "array",
      of: [
        defineArrayMember({
          name: "footerColumn",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Tiêu đề cột", type: "string", validation: (r) => r.required() }),
            defineField({ name: "links", title: "Liên kết", type: "array", of: [defineArrayMember({ type: "link" })], validation: (r) => r.required().min(1) }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    defineField({ name: "showContact", title: "Hiện khối liên hệ (lấy từ Thông tin doanh nghiệp)", type: "boolean", initialValue: true }),
    defineField({
      name: "legalLinks",
      title: "Liên kết pháp lý (chỉ thêm khi trang đã publish)",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({ name: "copyright", title: "Dòng bản quyền (dùng được {year}, {legalName})", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Chân trang (footer)" }) },
});

/** Câu chữ 3 form. Không có trường lưu dữ liệu người gửi — lead đi thẳng CRM (REQ-04, CM-10). */
export const leadForms = defineType({
  name: "leadForms",
  title: "Biểu mẫu (câu chữ)",
  type: "document",
  fields: [
    defineField({
      name: "messageFormDefault",
      title: "Khối form tin nhắn — mặc định",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề lớn", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subheading", title: "Dòng nhỏ", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Form Liên hệ / tin nhắn",
      type: "object",
      fields: [
        defineField({ name: "roleOptions", title: "Lựa chọn \"Bạn là\"", type: "array", of: [{ type: "string" }], validation: (r) => r.required().min(1).unique() }),
        defineField({ name: "needOptions", title: "Lựa chọn \"Bạn cần\"", type: "array", of: [{ type: "string" }], validation: (r) => r.required().min(1).unique() }),
        defineField({ name: "notePlaceholder", title: "Gợi ý ô ghi chú", type: "string" }),
        defineField({ name: "submitLabel", title: "Nhãn nút gửi", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "quote",
      title: "Form Báo giá",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "notePlaceholder", title: "Gợi ý ô ghi chú", type: "string" }),
        defineField({ name: "submitLabel", title: "Nhãn nút gửi", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "partnership",
      title: "Form Đăng ký hợp tác",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "intro", title: "Đoạn mở đầu", type: "text", rows: 3 }),
        defineField({ name: "submitLabel", title: "Nhãn nút gửi", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: "successMessage", title: "Thông báo gửi thành công", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "errorMessage",
      title: "Thông báo lỗi khi CRM không nhận (chứa {hotline})",
      type: "string",
      validation: (r) => r.required().custom((v: string | undefined) => checkHotlineToken(v)),
    }),
    defineField({
      name: "privacyNote",
      title: "Dòng ghi chú dưới form (kèm link Chính sách bảo mật)",
      type: "simpleBlockContent",
      validation: (r) =>
        r.required().custom((v: unknown) => (hasPrivacyLink(v) ? true : "Cần ít nhất một link tới trang Chính sách bảo mật.")),
    }),
  ],
  preview: { prepare: () => ({ title: "Biểu mẫu (câu chữ)" }) },
});

/** Route đang có nội dung — luật chuyển hướng không được che. */
const LIVE_ROUTES = Object.values(PAGE_PATHS);

export const redirectSettings = defineType({
  name: "redirectSettings",
  title: "Chuyển hướng URL",
  type: "document",
  fields: [
    defineField({
      name: "rules",
      title: "Luật chuyển hướng",
      description: "Mỗi URL cũ tới đích trong một bước. Không trùng đường dẫn cũ, không che trang đang có.",
      type: "array",
      of: [defineArrayMember({ type: "redirect" })],
      validation: (r) =>
        r.custom((v: RedirectRule[] | undefined) => {
          const errors = checkRedirectRules(v, LIVE_ROUTES);
          return errors.length === 0 ? true : errors.join(" ");
        }),
    }),
  ],
  preview: { prepare: () => ({ title: "Chuyển hướng URL" }) },
});

export const settingsSingletons = [siteSettings, header, footer, leadForms, redirectSettings];
