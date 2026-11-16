"use client";

import { viVNLocale } from "@sanity/locale-vi-vn";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, STUDIO_TITLE } from "./sanity/env";
import { SINGLETONS, schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletons = new Set<string>(SINGLETONS);
/** Singleton không được tạo mới / nhân bản / xoá (quyền thao tác hạn chế). */
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: STUDIO_TITLE,
  plugins: [structureTool({ structure }), viVNLocale()],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) =>
      singletons.has(schemaType) ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action)) : prev,
  },
  apiVersion,
});
