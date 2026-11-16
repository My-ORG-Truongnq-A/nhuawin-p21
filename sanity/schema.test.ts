import { describe, expect, it } from "vitest";
import { resolveDocumentActions } from "./actions";
import { allDocumentTypes, schemaTypes, singletonTypes } from "./schemaTypes";
import { documentTypes } from "./schemaTypes/documents";
import { isSingleton, SINGLETON_TYPES } from "./singletons";

type Field = { name: string; type: string; fields?: Field[]; of?: Field[] };

/** Duyệt mọi field (kể cả lồng trong object / array) của toàn bộ schema. */
function allFieldNames(): string[] {
  const names: string[] = [];
  const walk = (fields: Field[] | undefined) => {
    for (const f of fields ?? []) {
      if (f.name) names.push(f.name);
      walk(f.fields);
      walk(f.of);
    }
  };
  for (const t of schemaTypes as unknown as Field[]) {
    walk(t.fields);
    walk(t.of);
  }
  return names;
}

describe("content model (T3.1, T3.2)", () => {
  it("14 singleton khớp SINGLETON_TYPES (CM-13)", () => {
    expect(singletonTypes.map((t) => t.name).sort()).toEqual([...SINGLETON_TYPES].sort());
    expect(SINGLETON_TYPES).toHaveLength(14);
  });

  it("4 document nhiều bản ghi", () => {
    expect(documentTypes.map((t) => t.name).sort()).toEqual(["application", "category", "post", "productGroup"]);
  });

  it("tên type không trùng nhau", () => {
    const names = schemaTypes.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("không có loại lead / author / page tự do (CM-10, excludedTypes)", () => {
    const names = allDocumentTypes.map((t) => t.name);
    for (const banned of ["lead", "author", "page", "service", "project", "caseStudy", "job"]) {
      expect(names).not.toContain(banned);
    }
  });

  it("không có trường language (CM-12), giá / chiết khấu / MOQ / chứng nhận (CM-09), dữ liệu người gửi (CM-10)", () => {
    const banned = /^(language|lang|price|prices|gia|giaBan|discount|chietKhau|moq|minOrder|certificates?|chungNhan|fullName|hoTen|senderPhone|senderEmail)$/i;
    expect(allFieldNames().filter((n) => banned.test(n))).toEqual([]);
  });

  it("post bắt buộc chủ đề (CM-06)", () => {
    const post = documentTypes.find((t) => t.name === "post") as unknown as { fields: (Field & { to?: { type: string }[] })[] };
    const cat = post.fields.find((f) => f.name === "category");
    expect(cat?.type).toBe("reference");
    expect(cat?.to).toEqual([{ type: "category" }]);
  });
});

describe("resolveDocumentActions (CM-13)", () => {
  const all = ["publish", "unpublish", "delete", "duplicate", "discardChanges", "restore"].map((action) => ({ action }));
  const names = (xs: { action?: string }[]) => xs.map((x) => x.action);

  it.each(SINGLETON_TYPES)("singleton %s chỉ publish / discardChanges / restore", (type) => {
    expect(names(resolveDocumentActions(all, type))).toEqual(["publish", "discardChanges", "restore"]);
  });

  it.each(["productGroup", "application"])("%s không nhân bản", (type) => {
    expect(names(resolveDocumentActions(all, type))).not.toContain("duplicate");
    expect(names(resolveDocumentActions(all, type))).toContain("delete");
  });

  it("post: unpublish được bọc cảnh báo, action khác giữ nguyên", () => {
    const wrapped = { action: "unpublish", wrapped: true };
    const out = resolveDocumentActions(all, "post", (a) => (a.action === "unpublish" ? wrapped : a));
    expect(out).toContain(wrapped);
    expect(out).toHaveLength(all.length);
  });

  it("category giữ đủ action (xoá bị Sanity chặn khi còn reference mạnh)", () => {
    expect(resolveDocumentActions(all, "category")).toEqual(all);
  });

  it("isSingleton", () => {
    expect(isSingleton("siteSettings")).toBe(true);
    expect(isSingleton("post")).toBe(false);
  });
});
