/**
 * Bộ nạp thuần (không phụ thuộc Next) của cửa nội dung — để test được.
 * Bản có cache (`"use cache"` + cacheTag) nằm ở `lib/content/index.ts`.
 */
import { SEED } from "@/seed/content";
import { NORMALIZERS } from "./normalize";
import type { ContentKey, ContentMap } from "./types";

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
