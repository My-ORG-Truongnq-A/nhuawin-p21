/**
 * check:hardcode (T0.4, REQ-03, REQ-14, GEO-03): mã nguồn không chứa NAP / dữ kiện doanh nghiệp
 * (phải đọc từ siteSettings), và không đâu chứa claim chưa xác minh.
 * Có vi phạm → in tệp:dòng, thoát mã 1.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

type Rule = { value: string; kind: "phone" | "text"; reason: string };
export type Rules = {
  sourceOnly: Rule[];
  everywhere: Rule[];
  sourceExempt: string[];
};
export type Hit = { file: string; line: number; value: string; reason: string };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toRegex(rule: Rule): RegExp {
  if (rule.kind === "phone") {
    // Khớp mọi kiểu viết: "0900 123 456", "0900123456", "0900.123.456", "+84 900 123 456".
    const digits = rule.value.replace(/\D/g, "");
    const local = digits.replace(/^0/, "");
    const body = local.split("").join("[\\s.\\-]?");
    return new RegExp(`(?<!\\d)(?:0|\\+?84[\\s.\\-]?)${body}(?!\\d)`, "giu");
  }
  return new RegExp(escape(rule.value), "giu");
}

export function scanText(file: string, text: string, rules: Rules): Hit[] {
  const path = file.split(sep).join("/");
  const exempt = rules.sourceExempt.some((p) => path.startsWith(p));
  const active = [...(exempt ? [] : rules.sourceOnly), ...rules.everywhere];
  const hits: Hit[] = [];
  const lines = text.split(/\r?\n/);
  for (const rule of active) {
    const re = toRegex(rule);
    lines.forEach((content, i) => {
      re.lastIndex = 0;
      if (re.test(content.normalize("NFC"))) hits.push({ file: path, line: i + 1, value: rule.value, reason: rule.reason });
    });
  }
  return hits;
}

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, exts, out);
    else if (exts.includes(extname(name))) out.push(full);
  }
  return out;
}

function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const config = JSON.parse(readFileSync(join(root, "scripts/forbidden-strings.json"), "utf8")) as Rules & {
    scanDirs: string[];
    scanRootFiles: string[];
    ignoreFiles: string[];
    extensions: string[];
  };
  const files = [
    ...config.scanDirs.flatMap((d) => walk(join(root, d), config.extensions)),
    ...config.scanRootFiles.map((f) => join(root, f)),
  ]
    .map((f) => relative(root, f).split(sep).join("/"))
    .filter((f) => !config.ignoreFiles.includes(f));

  const hits = files.flatMap((f) => {
    try {
      return scanText(f, readFileSync(join(root, f), "utf8"), config);
    } catch {
      return [];
    }
  });

  if (hits.length > 0) {
    for (const h of hits) console.error(`${h.file}:${h.line}  "${h.value}" — ${h.reason}`);
    console.error(`\ncheck:hardcode: ${hits.length} vi phạm.`);
    process.exit(1);
  }
  console.log(`check:hardcode: OK (${files.length} tệp).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
