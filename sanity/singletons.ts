/**
 * Danh sách singleton — một nguồn cho structure, document actions, menu "Tạo mới" và seed.
 * Phải khớp `singletonTypes` trong schema (có test).
 */
export const SINGLETON_TYPES = [
  "siteSettings",
  "header",
  "footer",
  "leadForms",
  "redirectSettings",
  "homePage",
  "productsPage",
  "quotePage",
  "aboutPage",
  "partnershipPage",
  "newsPage",
  "contactPage",
  "privacyPage",
  "notFoundPage",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];

const set = new Set<string>(SINGLETON_TYPES);
export const isSingleton = (type: string): type is SingletonType => set.has(type);

/** Action được phép trên singleton: không tạo / xoá / nhân bản / gỡ xuất bản (CM-13). */
export const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);
