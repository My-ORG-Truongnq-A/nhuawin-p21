import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Schema KHUNG: đủ cho cửa nội dung hiện tại (siteSettings, header, footer, homePage, notFoundPage, post).
 * Content model đầy đủ (4 document + 14 singleton, T3.1/T3.2) bổ sung ở P3.
 * Đổi tên `_type` phải sửa cả CONTENT_TYPES (lib/content/tags.ts) — có test.
 */

const DAYS = [
  { title: "Thứ 2", value: "Monday" },
  { title: "Thứ 3", value: "Tuesday" },
  { title: "Thứ 4", value: "Wednesday" },
  { title: "Thứ 5", value: "Thursday" },
  { title: "Thứ 6", value: "Friday" },
  { title: "Thứ 7", value: "Saturday" },
  { title: "Chủ nhật", value: "Sunday" },
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Thông tin doanh nghiệp",
  type: "document",
  fields: [
    defineField({ name: "brandName", title: "Tên thương hiệu (một tên dùng mọi nơi)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "legalName", title: "Tên pháp lý", type: "string" }),
    defineField({ name: "slogan", title: "Khẩu hiệu", type: "string" }),
    defineField({ name: "description", title: "Mô tả ngắn (dùng cho SEO, llms.txt)", type: "text", rows: 3 }),
    defineField({
      name: "schemaType",
      title: "Loại hình (JSON-LD)",
      type: "string",
      initialValue: "LocalBusiness",
      options: { list: ["Organization", "LocalBusiness"] },
    }),
    defineField({ name: "logo", title: "Logo (tệp gốc, không crop)", type: "figure" }),
    defineField({ name: "defaultOgImage", title: "Ảnh chia sẻ mặc định 1200×630", type: "figure" }),
    defineField({
      name: "address",
      title: "Địa chỉ",
      type: "object",
      fields: [
        defineField({ name: "street", title: "Số nhà, đường / cụm công nghiệp, xã", type: "string" }),
        defineField({ name: "locality", title: "Tỉnh / thành phố", type: "string" }),
        defineField({ name: "region", title: "Vùng", type: "string" }),
        defineField({ name: "postalCode", title: "Mã bưu chính", type: "string" }),
        defineField({ name: "country", title: "Quốc gia (mã)", type: "string", initialValue: "VN" }),
        defineField({ name: "mapUrl", title: "Link Google Maps", type: "url" }),
        defineField({ name: "geo", title: "Toạ độ", type: "geopoint" }),
      ],
    }),
    defineField({
      name: "phones",
      title: "Số điện thoại (số đầu tiên là hotline chính)",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "phone",
          fields: [
            defineField({ name: "number", title: "Số", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Nhãn (vd Kinh doanh)", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "email", title: "Email", type: "string", validation: (r) => r.email() }),
    defineField({
      name: "zalo",
      title: "Zalo",
      type: "object",
      fields: [
        defineField({ name: "url", title: "Link Zalo", type: "url" }),
        defineField({ name: "label", title: "Nhãn nút", type: "string", initialValue: "Nhắn Zalo" }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Mạng xã hội",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "social",
          fields: [
            defineField({
              name: "platform",
              title: "Nền tảng",
              type: "string",
              options: { list: ["facebook", "youtube", "tiktok", "linkedin", "google_business"] },
              validation: (r) => r.required(),
            }),
            defineField({ name: "label", title: "Tên hiển thị", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required() }),
            defineField({ name: "confirmed", title: "Khách đã xác nhận (mới hiện trên site)", type: "boolean", initialValue: false }),
          ],
        }),
      ],
    }),
    defineField({
      name: "openingHours",
      title: "Giờ làm việc",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "hours",
          fields: [
            defineField({ name: "label", title: "Nhãn (vd Thứ 2 – Thứ 7)", type: "string" }),
            defineField({ name: "days", title: "Ngày", type: "array", of: [{ type: "string" }], options: { list: DAYS } }),
            defineField({ name: "opens", title: "Mở (HH:MM)", type: "string" }),
            defineField({ name: "closes", title: "Đóng (HH:MM)", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "taxId", title: "Mã số thuế", type: "string" }),
    defineField({ name: "foundingYear", title: "Năm thành lập", type: "number" }),
    defineField({ name: "areaServed", title: "Khu vực phục vụ", type: "string" }),
  ],
});

export const header = defineType({
  name: "header",
  title: "Menu đầu trang",
  type: "document",
  fields: [
    defineField({ name: "items", title: "Mục menu", type: "array", of: [defineArrayMember({ type: "navItem" })] }),
    defineField({ name: "cta", title: "Nút chính (vd Nhận báo giá)", type: "navItem" }),
  ],
});

export const footer = defineType({
  name: "footer",
  title: "Chân trang",
  type: "document",
  fields: [
    defineField({
      name: "columns",
      title: "Cột liên kết",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({ name: "title", title: "Tiêu đề cột", type: "string", validation: (r) => r.required() }),
            defineField({ name: "items", title: "Liên kết", type: "array", of: [defineArrayMember({ type: "navItem" })] }),
          ],
        }),
      ],
    }),
    defineField({ name: "privacyLink", title: "Link chính sách bảo mật (chỉ khi trang đã publish)", type: "navItem" }),
  ],
});

export const homePage = defineType({
  name: "homePage",
  title: "Trang chủ",
  type: "document",
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({
      name: "hero",
      title: "Khối đầu trang",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Dòng nhỏ phía trên", type: "string" }),
        defineField({ name: "titleLines", title: "Tiêu đề (mỗi dòng một mục)", type: "array", of: [{ type: "string" }], validation: (r) => r.required().min(1) }),
        defineField({ name: "lead", title: "Đoạn mở", type: "text", rows: 3 }),
        defineField({ name: "cta", title: "Nút chính (một nút)", type: "navItem" }),
        defineField({ name: "image", title: "Ảnh", type: "figure" }),
      ],
    }),
  ],
});

export const notFoundPage = defineType({
  name: "notFoundPage",
  title: "Trang 404",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Lời nhắn", type: "text", rows: 3 }),
    defineField({ name: "links", title: "Liên kết gợi ý", type: "array", of: [defineArrayMember({ type: "navItem" })] }),
  ],
});

export const post = defineType({
  name: "post",
  title: "Bài viết",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Đường dẫn", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Tóm tắt", type: "text", rows: 3 }),
    defineField({ name: "mainImage", title: "Ảnh đại diện", type: "figure" }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime" }),
    defineField({ name: "updatedAt", title: "Ngày cập nhật nội dung", type: "datetime" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  orderings: [{ title: "Mới nhất", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
});

/** Singleton: một tài liệu, id cố định = tên loại. */
export const SINGLETONS = ["siteSettings", "header", "footer", "homePage", "notFoundPage"] as const;

export const documentTypes = [siteSettings, header, footer, homePage, notFoundPage, post];
