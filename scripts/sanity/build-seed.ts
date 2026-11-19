/**
 * Sinh seed/sanity/{documents,assets}.json từ seed TS của repo. KHÔNG sửa tay hai tệp này.
 *   pnpm sanity:build-seed          # ghi tệp
 *   pnpm sanity:build-seed --check  # chỉ so sánh (thoát 1 nếu lệch)
 * Không gọi mạng.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { buildBundle, seedFiles } from "./lib/build";
import { validateDocs } from "./lib/validate";

const ROOT = resolve(__dirname, "../..");
const check = process.argv.includes("--check");
const bundle = buildBundle(ROOT);
const issues = validateDocs(bundle.docs, bundle.assets);
if (issues.errors.length) {
  console.error(`Seed không hợp lệ:\n- ${issues.errors.join("\n- ")}`);
  process.exit(1);
}
let drift = 0;
for (const [rel, content] of Object.entries(seedFiles(bundle))) {
  const p = join(ROOT, rel);
  if (check) {
    if (!existsSync(p) || readFileSync(p, "utf8") !== content) {
      console.error(`LỆCH: ${rel}`);
      drift++;
    }
  } else {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    console.log(`ghi ${rel}`);
  }
}
if (issues.warnings.length) console.log(issues.warnings.map((w) => `⚠ ${w}`).join("\n"));
console.log(`${bundle.docs.length} tài liệu, ${bundle.assets.length} ảnh.`);
process.exit(drift ? 1 : 0);
