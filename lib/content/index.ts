import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { serverEnv } from "@/lib/env";
import { sanityClient } from "@/lib/sanity/client";
import { QUERIES } from "@/lib/sanity/queries";
import { loadContent } from "./load";
import { CONTENT_TAGS } from "./tags";
import type { ContentKey, ContentMap } from "./types";

/**
 * CỬA DUY NHẤT đọc nội dung (KT-01). Trang / component chỉ import từ đây.
 * - Nguồn: Sanity (CDN, published) hoặc seed (SANITY_SOURCE=seed / chưa có projectId / Sanity lỗi).
 * - Cache: "use cache" + cacheTag theo loại + cacheLife("hours"); webhook làm mới theo tag (KT-02, KT-03).
 */

async function read<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  const { contentSource } = serverEnv();
  const { data } = await loadContent(key, {
    source: contentSource,
    fetchSanity: (k) => sanityClient().fetch(QUERIES[k]),
  });
  return data;
}

/** Cờ "đang dùng seed" — GL-02 chặn go-live khi bật. */
export function contentSource(): "seed" | "sanity" {
  return serverEnv().contentSource;
}

/**
 * Đọc có cache: khoá là đối số nên mỗi loại một mục cache; gắn đủ tag của loại (CONTENT_TAGS).
 * Không có no-store / revalidate: 0 — làm mới nhờ webhook revalidateTag.
 */
async function cachedRead<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  "use cache";
  cacheTag(...CONTENT_TAGS[key]);
  cacheLife("hours");
  return read(key);
}

export const getSiteSettings = () => cachedRead("siteSettings");
export const getHeader = () => cachedRead("header");
export const getFooter = () => cachedRead("footer");
export const getHomePage = () => cachedRead("homePage");
export const getNotFoundPage = () => cachedRead("notFoundPage");
export const getPosts = () => cachedRead("posts");
export const getProductGroups = () => cachedRead("productGroups");
export const getApplications = () => cachedRead("applications");
export const getCategories = () => cachedRead("categories");

export type * from "./types";
