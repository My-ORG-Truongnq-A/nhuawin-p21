/**
 * Bộ nạp thuần (không phụ thuộc Next) của cửa nội dung — để test được.
 * Bản có cache (`"use cache"` + cacheTag) nằm ở `lib/content/index.ts`.
 */
import { SEED, SEED_POSTS } from "@/seed/content";
import { NORMALIZERS, postDetail } from "./normalize";
import type { ContentKey, ContentMap, Post } from "./types";

export type LoadDeps = {
  source: "seed" | "sanity";
  fetchSanity: (key: ContentKey) => Promise<unknown>;
  log?: { warn: (msg: string) => void };
};

export type Loaded<K extends ContentKey> = { data: ContentMap[K]; fromSeed: boolean };

export async function loadContent<K extends ContentKey>(key: K, deps: LoadDeps): Promise<Loaded<K>> {
  const log = deps.log ?? console;
  if (deps.source === "seed") return { data: SEED[key], fromSeed: true };

  try {
    const raw = await deps.fetchSanity(key);
    const data = NORMALIZERS[key](raw) as ContentMap[K] | null;
    if (data === null) {
      log.warn(`[content] Sanity thiếu "${key}" hoặc thiếu trường bắt buộc → dùng seed.`);
      return { data: SEED[key], fromSeed: true };
    }
    return { data, fromSeed: false };
  } catch (err) {
    log.warn(`[content] Đọc "${key}" từ Sanity lỗi (${(err as Error).message}) → dùng seed.`);
    return { data: SEED[key], fromSeed: true };
  }
}

export type LoadPostDeps = {
  source: "seed" | "sanity";
  fetchPost: (slug: string) => Promise<unknown>;
  log?: { warn: (msg: string) => void };
};

/**
 * Một bài theo slug. Sanity trả null (không có bài) → null (404), KHÔNG rơi về seed:
 * bài đã gỡ trong CMS không được sống lại từ seed. Chỉ lỗi mạng mới dùng seed.
 */
export async function loadPost(slug: string, deps: LoadPostDeps): Promise<Post | null> {
  const fromSeed = () => SEED_POSTS.find((p) => p.slug === slug) ?? null;
  if (deps.source === "seed") return fromSeed();
  try {
    const raw = await deps.fetchPost(slug);
    return raw ? postDetail(raw) : null;
  } catch (err) {
    (deps.log ?? console).warn(`[content] Đọc bài "${slug}" từ Sanity lỗi (${(err as Error).message}) → dùng seed.`);
    return fromSeed();
  }
}
