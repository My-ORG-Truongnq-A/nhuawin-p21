/**
 * Sinh ảnh OG 1200×630 cho mỗi template từ logo gốc (không vẽ lại logo) + tên trang.
 *   tsx scripts/images/make-og.ts          # --dry: liệt kê
 *   tsx scripts/images/make-og.ts --apply  # ghi public/images/og/<template>.png + manifest
 * Tiêu đề trang lấy từ nhãn cố định bên dưới (tên trang, không dữ kiện kinh doanh).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
// sharp chỉ là phụ thuộc gián tiếp (Next) — chưa khai báo devDependency để khỏi đổi lockfile
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require("sharp") as (...a: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

const ROOT = resolve(__dirname, "../..");
const apply = process.argv.includes("--apply");
const TEMPLATES: Record<string, string> = {
  home: "Nhà sản xuất tấm Fomex",
  "san-pham": "Sản phẩm tấm Fomex",
  "bao-gia": "Nhận báo giá tấm Fomex",
  "ve-win": "Về Nhựa WIN Việt Nam",
  "hop-tac": "Hợp tác phân phối",
  "tin-tuc": "Tin tức & kiến thức Fomex",
  "lien-he": "Liên hệ Nhựa WIN",
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function main() {
  const out = join(ROOT, "public/images/og");
  if (apply) mkdirSync(out, { recursive: true });
  const logo = await sharp(join(ROOT, "public/images/brand/logo-win.png")).resize({ width: 420 }).png().toBuffer();
  const manifest: unknown[] = [];
  for (const [key, title] of Object.entries(TEMPLATES)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/><rect y="590" width="1200" height="40" fill="#0b4da8"/><text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#02408e">${esc(title)}</text><text x="80" y="480" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#334155">Nhựa WIN Việt Nam</text></svg>`;
    const buf = await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#fff" } })
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, { input: logo, top: 70, left: 80 }])
      .png({ palette: true, quality: 90 })
      .toBuffer();
    manifest.push({ template: key, file: `/images/og/${key}.png`, width: 1200, height: 630, bytes: buf.length, alt: `Ảnh chia sẻ trang ${title} — Nhựa WIN Việt Nam`, source: "generated-from-client-logo" });
    if (apply) writeFileSync(join(out, `${key}.png`), buf);
  }
  if (apply) writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${apply ? "APPLY" : "DRY"} — ${manifest.length} ảnh OG`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
