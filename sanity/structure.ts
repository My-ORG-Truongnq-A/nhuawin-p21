import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { isAdministrator } from "./lib/rules";

const TITLES: Record<string, string> = {
  siteSettings: "Thông tin doanh nghiệp",
  header: "Menu trên (header)",
  footer: "Chân trang (footer)",
  leadForms: "Biểu mẫu (câu chữ)",
  redirectSettings: "Chuyển hướng URL",
  homePage: "Trang chủ",
  productsPage: "Trang Sản phẩm",
  quotePage: "Trang Báo giá",
  aboutPage: "Trang Về WIN",
  partnershipPage: "Trang Hợp tác",
  newsPage: "Trang Tin tức",
  contactPage: "Trang Liên hệ",
  privacyPage: "Chính sách bảo mật",
  notFoundPage: "Trang 404",
};

/** Singleton mở thẳng tài liệu có _id = tên type (không có danh sách, không tạo mới). */
const singleton = (S: StructureBuilder, type: string) =>
  S.listItem()
    .title(TITLES[type] ?? type)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(TITLES[type] ?? type));

const group = (S: StructureBuilder, id: string, title: string, items: ReturnType<StructureBuilder["listItem"]>[]) =>
  S.listItem().id(id).title(title).child(S.list().id(id).title(title).items(items));

/** Studio nhóm theo nghiệp vụ (content_model studioStructure). Chuyển hướng URL chỉ Administrator thấy. */
export const structure: StructureResolver = (S, context) => {
  const admin = isAdministrator(context.currentUser);
  const settings = ["siteSettings", "header", "footer", "leadForms", ...(admin ? ["redirectSettings"] : [])];
  const pages = [
    "homePage",
    "productsPage",
    "quotePage",
    "aboutPage",
    "partnershipPage",
    "newsPage",
    "contactPage",
    "privacyPage",
    "notFoundPage",
  ];

  return S.list()
    .title("Nội dung")
    .items([
      group(S, "cau-hinh-chung", "Cấu hình chung", settings.map((t) => singleton(S, t))),
      group(S, "trang", "Trang", pages.map((t) => singleton(S, t))),
      group(S, "san-pham", "Sản phẩm", [
        S.listItem()
          .id("productGroup")
          .title("Nhóm sản phẩm")
          .child(S.documentTypeList("productGroup").title("Nhóm sản phẩm").defaultOrdering([{ field: "order", direction: "asc" }])),
        S.listItem()
          .id("application")
          .title("Ứng dụng")
          .child(S.documentTypeList("application").title("Ứng dụng").defaultOrdering([{ field: "order", direction: "asc" }])),
      ]),
      group(S, "tin-tuc", "Tin tức", [
        S.listItem()
          .id("post")
          .title("Bài viết (mới nhất trước)")
          .child(S.documentTypeList("post").title("Bài viết").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
        S.listItem()
          .id("post-by-category")
          .title("Bài viết theo chủ đề")
          .child(
            S.documentTypeList("category")
              .title("Chủ đề")
              .child((categoryId) =>
                S.documentList()
                  .title("Bài viết")
                  .schemaType("post")
                  .filter('_type == "post" && category._ref == $categoryId')
                  .params({ categoryId })
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
              ),
          ),
        S.listItem()
          .id("category")
          .title("Chủ đề")
          .child(S.documentTypeList("category").title("Chủ đề").defaultOrdering([{ field: "order", direction: "asc" }])),
      ]),
    ]);
};
