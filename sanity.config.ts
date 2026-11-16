"use client";

import { viVNLocale } from "@sanity/locale-vi-vn";
import { table } from "@sanity/table";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { resolveDocumentActions, withLegacyUnpublishWarning } from "./sanity/actions";
import { apiVersion, dataset, projectId, STUDIO_TITLE } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { isSingleton } from "./sanity/singletons";
import { structure } from "./sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: STUDIO_TITLE,
  plugins: [structureTool({ structure }), table(), viVNLocale()],
  schema: {
    types: schemaTypes,
    // Singleton không có mẫu tạo mới (CM-13).
    templates: (templates) => templates.filter(({ schemaType }) => !isSingleton(schemaType)),
  },
  document: {
    // Ẩn singleton khỏi menu "Tạo mới" toàn cục.
    newDocumentOptions: (prev) => prev.filter((item) => !isSingleton(item.templateId)),
    actions: (prev, { schemaType }) => resolveDocumentActions(prev, schemaType, withLegacyUnpublishWarning),
  },
  apiVersion,
});
