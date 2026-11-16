/**
 * Dựng bộ tài liệu Sanity từ seed của repo (tất định). Một nguồn cho build-seed / migrate / verify.
 * Không ghi mạng. Không đọc `.digiauto/` (thư mục đó không nằm trong git).
 */
import { createHash } from "node:crypto";
import { collectImageUrls, assetFromFile, type AssetInfo } from "./assets";
import { buildDocs, type SanityDoc } from "./to-docs";
import { SEED, SEED_POSTS } from "../../../seed/content";

/** Thời điểm crawl web cũ — content_inventory.json `crawledAt`. */
export const CRAWLED_AT = "2026-11-13T17:10:41+07:00";
export const LEGACY_SITE = "https://www.nhuawinvietnam.com.vn";

export type SeedBundle = {
  docs: SanityDoc[];
  assets: AssetInfo[];
};

export function buildBundle(root: string): SeedBundle {
  const urls = [...collectImageUrls([SEED, SEED_POSTS])].sort();
  const assets = urls.map((u) => assetFromFile(root, u));
  const map = new Map(assets.map((a) => [a.url, a]));
  const docs = buildDocs(SEED, SEED_POSTS, { assets: map, crawledAt: CRAWLED_AT, legacySite: LEGACY_SITE });
  // Thứ tự tất định: theo _type rồi _id.
  const order = ["category", "productGroup", "application", "post"];
  docs.sort((a, b) => {
    const ra = order.indexOf(a._type);
    const rb = order.indexOf(b._type);
    return (ra < 0 ? -1 : ra) - (rb < 0 ? -1 : rb) || a._id.localeCompare(b._id);
  });
  return { docs, assets };
}

/** JSON ổn định (khoá sắp xếp) để băm / so sánh. */
export function stable(v: unknown): string {
  const sort = (x: unknown): unknown =>
    Array.isArray(x)
      ? x.map(sort)
      : x && typeof x === "object"
        ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, y]) => [k, sort(y)]))
        : x;
  return JSON.stringify(sort(v));
}

export const hashDoc = (d: unknown) => createHash("sha256").update(stable(d)).digest("hex");

/** Nội dung hai tệp seed JSON sinh ra (build-seed ghi, migrate đối chiếu để phát hiện sửa tay). */
export function seedFiles(b: SeedBundle): { "seed/sanity/documents.json": string; "seed/sanity/assets.json": string } {
  return {
    "seed/sanity/documents.json": JSON.stringify(b.docs, null, 2) + "\n",
    "seed/sanity/assets.json":
      JSON.stringify(
        b.assets.map((a) => ({ url: a.url, assetId: a.assetId, sha256: a.sha256, width: a.width, height: a.height, ext: a.ext, bytes: a.bytes })),
        null,
        2,
      ) + "\n",
  };
}
