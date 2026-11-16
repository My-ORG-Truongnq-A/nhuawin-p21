/**
 * Lưu BẢN GỐC ảnh của web cũ (nguồn: content_inventory.json → images[].sourceUrl) vào .digiauto/originals/.
 * Bản WebP 1200 px trong public/images/seed/ là bản dùng cho site; bản gốc chỉ để lưu trữ (không commit, không deploy).
 *
 *   tsx scripts/images/fetch-originals.ts           # --dry (mặc định): liệt kê, không tải
 *   tsx scripts/images/fetch-originals.ts --apply   # tải những tệp chưa có; ghi manifest sha256
 *
 * Chỉ GET ảnh công khai của web cũ; không gọi API Sanity; bỏ qua tệp đã tải (chạy lại không tải lại).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");
const OUT = join(ROOT, ".digiauto", "originals");
const apply = process.argv.includes("--apply");

type Img = { sourceUrl?: string; alt?: string };
const inv = JSON.parse(readFileSync(join(ROOT, ".digiauto/inputs/content_inventory.json"), "utf8")) as { pages: { path: string; images?: Img[] }[] };

const byUrl = new Map<string, { pages: Set<string>; alts: Set<string> }>();
for (const p of inv.pages)
  for (const i of p.images ?? []) {
    if (!i.sourceUrl) continue;
    const e = byUrl.get(i.sourceUrl) ?? { pages: new Set(), alts: new Set() };
    e.pages.add(p.path);
    if (i.alt) e.alts.add(i.alt);
    byUrl.set(i.sourceUrl, e);
  }

// Ảnh album chỉ nằm trong HTML/RSC đã crawl (không có trong content_inventory) → quét thêm cache.
const CACHE = join(ROOT, ".digiauto", "cache", "old");
if (existsSync(CACHE)) {
  const re = /cdn\.sanity\.io\/images\/6n8ixrme\/production\/[a-f0-9]{40}-\d+x\d+\.(?:webp|png|jpg|jpeg)/g;
  for (const f of readdirSync(CACHE).filter((x) => x.endsWith(".html"))) {
    const html = readFileSync(join(CACHE, f), "utf8").replace(/%2F/gi, "/");
    for (const m of html.match(re) ?? []) {
      const url = `https://${m}`;
      const e = byUrl.get(url) ?? { pages: new Set<string>(), alts: new Set<string>() };
      e.pages.add(`cache:${f}`);
      byUrl.set(url, e);
    }
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const manifest: Record<string, unknown>[] = [];
  let fetched = 0;
  for (const [url, meta] of byUrl) {
    const name = basename(new URL(url).pathname);
    const file = join(OUT, name);
    if (!existsSync(file) && apply) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      fetched++;
    }
    const have = existsSync(file);
    manifest.push({
      file: name,
      sourceUrl: url,
      pages: [...meta.pages],
      alts: [...meta.alts],
      bytes: have ? readFileSync(file).length : null,
      sha256: have ? createHash("sha256").update(readFileSync(file)).digest("hex") : null,
    });
  }
  if (apply) writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${apply ? "APPLY" : "DRY"} — ${byUrl.size} ảnh gốc duy nhất, tải mới ${fetched}${apply ? "" : " (dry không tải; thêm --apply)"}.`);
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
