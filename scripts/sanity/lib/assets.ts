/**
 * Ảnh seed → thông tin asset Sanity tất định. `_id` asset của Sanity = `image-<sha1 nội dung>-<W>x<H>-<đuôi>`,
 * nên tính được trước khi tải lên: biết ảnh nào đã có chỉ bằng MỘT truy vấn, không tải hai lần (cache theo hash).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type AssetInfo = {
  /** URL trong seed, vd /images/seed/47d2391c86.webp. */
  url: string;
  file: string;
  assetId: string;
  sha1: string;
  sha256: string;
  width: number;
  height: number;
  ext: "webp" | "png";
  bytes: number;
};

export function webpSize(buf: Buffer): { width: number; height: number } {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") throw new Error("Không phải WebP.");
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (fourcc === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`WebP không hỗ trợ: ${fourcc}`);
}

export function pngSize(buf: Buffer): { width: number; height: number } {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("Không phải PNG.");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function assetFromFile(root: string, url: string): AssetInfo {
  const file = join(root, "public", url.replace(/^\//, ""));
  const buf = readFileSync(file);
  const ext = url.toLowerCase().endsWith(".png") ? "png" : url.toLowerCase().endsWith(".webp") ? "webp" : null;
  if (!ext) throw new Error(`Định dạng ảnh chưa hỗ trợ: ${url}`);
  const { width, height } = ext === "png" ? pngSize(buf) : webpSize(buf);
  const sha1 = createHash("sha1").update(buf).digest("hex");
  return {
    url,
    file,
    assetId: `image-${sha1}-${width}x${height}-${ext}`,
    sha1,
    sha256: createHash("sha256").update(buf).digest("hex"),
    width,
    height,
    ext,
    bytes: buf.length,
  };
}

/** Gom mọi `url` ảnh nội bộ (`/images/...`) xuất hiện trong cây dữ liệu seed. */
export function collectImageUrls(tree: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(tree)) tree.forEach((x) => collectImageUrls(x, out));
  else if (tree && typeof tree === "object") {
    const o = tree as Record<string, unknown>;
    if (typeof o.url === "string" && typeof o.width === "number" && typeof o.height === "number" && o.url.startsWith("/images/")) out.add(o.url);
    Object.values(o).forEach((x) => collectImageUrls(x, out));
  }
  return out;
}
