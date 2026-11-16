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

export async function getSiteSettings() {
  "use cache";
  cacheTag(CONTENT_TAGS.siteSettings);
  cacheLife("hours");
  return read("siteSettings");
}

export async function getHeader() {
  "use cache";
  cacheTag(CONTENT_TAGS.header);
  cacheLife("hours");
  return read("header");
}

export async function getFooter() {
  "use cache";
  cacheTag(CONTENT_TAGS.footer);
  cacheLife("hours");
  return read("footer");
}

export async function getHomePage() {
  "use cache";
  cacheTag(CONTENT_TAGS.homePage);
  cacheLife("hours");
  return read("homePage");
}

export async function getNotFoundPage() {
  "use cache";
  cacheTag(CONTENT_TAGS.notFoundPage);
  cacheLife("hours");
  return read("notFoundPage");
}

export async function getPosts() {
  "use cache";
  cacheTag(CONTENT_TAGS.posts);
  cacheLife("hours");
  return read("posts");
}

export type * from "./types";
