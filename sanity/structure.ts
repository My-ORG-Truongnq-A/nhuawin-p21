import type { StructureResolver } from "sanity/structure";

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

/** Studio tiếng Việt: singleton mở thẳng tài liệu duy nhất; bài viết là danh sách. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Nội dung")
    .items([
      singleton(S, "siteSettings", "Thông tin doanh nghiệp"),
      singleton(S, "header", "Menu đầu trang"),
      singleton(S, "footer", "Chân trang"),
      S.divider(),
      singleton(S, "homePage", "Trang chủ"),
      singleton(S, "notFoundPage", "Trang 404"),
      S.divider(),
      S.documentTypeListItem("post").title("Bài viết"),
    ]);
