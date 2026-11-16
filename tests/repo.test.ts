import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

describe("rào repo (KT-08, KT-09, KT-11)", () => {
  const files = ["app", "components", "lib"].flatMap((d) => sourceFiles(join(root, d)));

  it('không file "use client" nào import zod / lib/env (bundle nặng, lộ biến server)', () => {
    const bad = files.filter((f) => {
      const src = readFileSync(f, "utf8");
      return /^["']use client["']/.test(src.trimStart()) && /from ["'](zod|@\/lib\/env)["']/.test(src);
    });
    expect(bad.map((f) => relative(root, f))).toEqual([]);
  });

  it("không đọc NEXT_PUBLIC_SITE_URL ngoài lib/site-url.ts và lib/indexing.ts (SEO-02)", () => {
    const allowed = new Set(["lib/site-url.ts", "lib/indexing.ts"]);
    const bad = files
      .map((f) => relative(root, f).replace(/\\/g, "/"))
      .filter((f) => !f.endsWith(".test.ts") && !allowed.has(f))
      .filter((f) => readFileSync(join(root, f), "utf8").includes("process.env.NEXT_PUBLIC_SITE_URL"));
    expect(bad).toEqual([]);
  });

  it("không có .vercel/project.json trong repo", () => {
    expect(existsSync(join(root, ".vercel/project.json"))).toBe(false);
  });

  it(".env.example chỉ có placeholder (không token / ID thật)", () => {
    const env = readFileSync(join(root, ".env.example"), "utf8");
    expect(env).not.toMatch(/sk[a-zA-Z0-9]{20,}|G-[A-Z0-9]{6,}|GTM-[A-Z0-9]{4,}/);
    for (const name of ["NEXT_PUBLIC_SITE_URL", "ALLOW_INDEXING", "NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_REVALIDATE_SECRET", "LEAD_DESTINATION", "DGA_API_URL", "DGA_FORM_KEY"]) {
      expect(env).toMatch(new RegExp(`^${name}=`, "m"));
    }
  });
});
