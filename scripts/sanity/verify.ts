/**
 * Đối chiếu dataset đã publish với seed (cổng check.sanity_verify): 0 thiếu tài liệu · 0 lệch slug ·
 * 0 tham chiếu gãy · 0 thiếu asset · 0 lệch nội dung.
 *
 *   pnpm sanity:verify --self           # offline: kiểm seed tự nhất quán (0 request)
 *   pnpm sanity:verify [--out file]     # MỘT truy vấn GROQ gom (1 request); token đọc nếu dataset riêng tư
 *
 * Tài liệu có `_rev` khác lần migrate cuối được tính "đã sửa trong Studio" (không phải lệch).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createClient } from "next-sanity";
import { buildBundle, stable } from "./lib/build";
import type { Manifest } from "./lib/engine";
import { validateDocs } from "./lib/validate";

const ROOT = resolve(__dirname, "../..");
type Doc = Record<string, unknown> & { _id: string; _type: string };

const strip = (d: Doc) => {
  const { _rev, _createdAt, _updatedAt, ...rest } = d as Record<string, unknown>;
  void _rev; void _createdAt; void _updatedAt;
  return rest;
};

function refsOf(v: unknown, out: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => refsOf(x, out));
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o._ref === "string") out.push(o._ref);
    Object.values(o).forEach((x) => refsOf(x, out));
  }
  return out;
}

export type VerifyResult = {
  mode: "self" | "remote";
  expected: Record<string, number>;
  found: Record<string, number>;
  missingDocs: string[];
  slugMismatch: string[];
  brokenRefs: string[];
  missingAssets: string[];
  bodyMismatch: string[];
  editedInStudio: string[];
  ok: boolean;
};

const count = (docs: { _type: string }[]) => docs.reduce<Record<string, number>>((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {});

export function compare(seed: Doc[], remote: Doc[], remoteAssets: string[], manifest: Manifest, mode: "self" | "remote"): VerifyResult {
  const byId = new Map(remote.map((d) => [d._id, d]));
  const ids = new Set(byId.keys());
  const assets = new Set(remoteAssets);
  const r: VerifyResult = { mode, expected: count(seed), found: count(remote), missingDocs: [], slugMismatch: [], brokenRefs: [], missingAssets: [], bodyMismatch: [], editedInStudio: [], ok: false };
  for (const s of seed) {
    const d = byId.get(s._id);
    if (!d) {
      r.missingDocs.push(s._id);
      continue;
    }
    const a = (s.slug as { current?: string } | undefined)?.current;
    const b = (d.slug as { current?: string } | undefined)?.current;
    if (a !== b) r.slugMismatch.push(`${s._id}: ${a} ≠ ${b}`);
    if (stable(strip(d)) !== stable(s)) {
      const m = manifest.docs[s._id];
      (m && (d as { _rev?: string })._rev !== m.rev ? r.editedInStudio : r.bodyMismatch).push(s._id);
    }
    for (const ref of refsOf(d)) {
      if (ref.startsWith("image-")) {
        if (!assets.has(ref)) r.missingAssets.push(`${s._id} → ${ref}`);
      } else if (!ids.has(ref)) r.brokenRefs.push(`${s._id} → ${ref}`);
    }
  }
  r.ok = [r.missingDocs, r.slugMismatch, r.brokenRefs, r.missingAssets, r.bodyMismatch].every((x) => x.length === 0);
  return r;
}

async function main() {
  const bundle = buildBundle(ROOT);
  const manifestPath = join(ROOT, ".digiauto", "migration", "manifest.json");
  const manifest: Manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { version: 1, docs: {} };
  const seed = bundle.docs as Doc[];
  let result: VerifyResult;
  if (process.argv.includes("--self")) {
    const issues = validateDocs(bundle.docs, bundle.assets);
    result = compare(seed, seed, bundle.assets.map((a) => a.assetId), manifest, "self");
    if (issues.errors.length) result.ok = false;
  } else {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    if (!projectId) throw new Error("Thiếu NEXT_PUBLIC_SANITY_PROJECT_ID.");
    const client = createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2026-11-01",
      useCdn: false,
      perspective: "published",
      token: process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN,
    });
    const res = await client.fetch<{ docs: Doc[]; assets: { _id: string }[] }>(
      `{ "docs": *[_id in $ids], "assets": *[_id in $assetIds]{_id} }`,
      { ids: seed.map((d) => d._id), assetIds: bundle.assets.map((a) => a.assetId) },
    );
    result = compare(seed, res.docs, res.assets.map((a) => a._id), manifest, "remote");
  }
  const out = process.argv.indexOf("--out");
  if (out >= 0) writeFileSync(resolve(process.argv[out + 1]), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

if (require.main === module || process.argv[1]?.endsWith("verify.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  });
}
