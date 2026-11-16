import { documentTypes } from "./documents";
import { objectTypes } from "./objects";
import { pageSingletons } from "./singletons/pages";
import { settingsSingletons } from "./singletons/settings";

/** 14 singleton: _id cố định = tên type (content_model conventions.singletonIds). */
export const singletonTypes = [...settingsSingletons, ...pageSingletons];

/** Mọi loại tài liệu (document + singleton) — dùng cho test và webhook. */
export const allDocumentTypes = [...documentTypes, ...singletonTypes];

export const schemaTypes = [...objectTypes, ...allDocumentTypes];
