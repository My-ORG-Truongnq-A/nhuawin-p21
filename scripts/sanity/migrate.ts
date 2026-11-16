/**
 * Migrate seed → Sanity.
 *
 *   pnpm sanity:migrate                  # --dry (mặc định): không gọi mạng, in kế hoạch + ước lượng request
 *   pnpm sanity:migrate --dry --remote   # thêm ĐÚNG 1 request đọc để biết tài liệu nào đã có / đã sửa
 *   pnpm sanity:migrate --apply          # ghi thật (cần token ghi trong biến môi trường của tiến trình)
 *   pnpm sanity:migrate --apply --force  # ghi đè cả bản đã sửa trong Studio (chỉ khi được yêu cầu rõ)
 *   pnpm sanity:migrate --restore <backup.json> [--apply]   # hoàn tác theo backup (mặc định chỉ in)
 *
 * Biến môi trường: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (mặc định production),
 * SANITY_API_WRITE_TOKEN (chỉ khi --apply / --remote / --restore). Token không bao giờ được in ra.
 * Không chạy --apply lặp để "thử": thử bằng --dry.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createClient } from "next-sanity";
import type { AssetInfo } from "./lib/assets";
import { buildBundle, seedFiles } from "./lib/build";
import {
  applyMigration,
  emptyManifest,
  estimateRequests,
  plan,
  restoreBackup,
  type Backup,
  type Manifest,
  type Mutation,
  type Sink,
} from "./lib/engine";
import { validateDocs } from "./lib/validate";

const ROOT = resolve(__dirname, "../..");
const STATE_DIR = join(ROOT, ".digiauto", "migration");
const MANIFEST = join(STATE_DIR, "manifest.json");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? (process.argv[i + 1] ?? "") : undefined;
}
const flag = (name: string) => process.argv.includes(name);

export function realSink(): Sink {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId) throw new Error("Thiếu NEXT_PUBLIC_SANITY_PROJECT_ID.");
  if (!token) throw new Error("Thiếu SANITY_API_WRITE_TOKEN trong môi trường tiến trình (orchestrator cấp).");
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-11-01",
    useCdn: false,
    perspective: "raw",
    token,
  });
  return {
    readState: (ids, assetIds) =>
      client.fetch(
        `{ "docs": *[_id in $ids], "drafts": *[_id in $draftIds]{_id,_rev}, "assets": *[_id in $assetIds]{_id} }`,
        { ids, draftIds: ids.map((i) => `drafts.${i}`), assetIds },
      ),
    uploadImage: async (a: AssetInfo, bytes: Buffer) => {
      const r = await client.assets.upload("image", bytes, {
        filename: a.url.split("/").pop(),
        contentType: a.ext === "png" ? "image/png" : "image/webp",
      });
      return { _id: r._id };
    },
    commit: async (muts: Mutation[]) => {
      const tx = client.transaction();
      for (const m of muts) {
        if ("createOrReplace" in m) tx.createOrReplace(m.createOrReplace as never);
        else tx.delete(m.delete.id);
      }
      await tx.commit({ returnDocuments: false });
    },
    readRevs: (ids) => client.fetch(`*[_id in $ids]{_id,_rev}`, { ids }),
  };
}

/** Bọc Sink để đếm request thực tế. */
function counting(sink: Sink): { sink: Sink; count: () => number } {
  let n = 0;
  const w = <A extends unknown[], R>(f: (...a: A) => Promise<R>) => (...a: A) => {
    n++;
    return f(...a);
  };
  return {
    sink: { readState: w(sink.readState), uploadImage: w(sink.uploadImage), commit: w(sink.commit), readRevs: w(sink.readRevs) },
    count: () => n,
  };
}

function loadManifest(): Manifest {
  return existsSync(MANIFEST) ? (JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest) : emptyManifest();
}
function save(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

async function main() {
  const apply = flag("--apply");
  const force = flag("--force");
  const maxRequests = Number(arg("--max-requests") ?? 80);
  const restorePath = arg("--restore");
  const asJson = flag("--json");

  if (restorePath !== undefined) {
    const backup = JSON.parse(readFileSync(resolve(restorePath), "utf8")) as Backup;
    console.log(`Restore: ${backup.replaced.length} tài liệu thay lại, ${backup.created.length} tài liệu xoá.`);
    if (!apply) return console.log("(dry) Thêm --apply để hoàn tác.");
    const r = await restoreBackup({ backup, sink: realSink(), force });
    console.log(r.conflicts.length && !force ? `DỪNG — đã đổi sau migrate: ${r.conflicts.join(", ")}` : `Xong: ${JSON.stringify(r)}`);
    if (r.conflicts.length && !force) process.exitCode = 2;
    return;
  }

  const bundle = buildBundle(ROOT);
  // Chống sửa tay seed JSON: tệp commit phải đúng bằng bản sinh lại.
  for (const [rel, content] of Object.entries(seedFiles(bundle))) {
    const p = join(ROOT, rel);
    if (!existsSync(p) || readFileSync(p, "utf8") !== content)
      throw new Error(`${rel} lệch bản sinh từ script (sửa tay hoặc chưa build) — chạy: pnpm sanity:build-seed`);
  }
  const issues = validateDocs(bundle.docs, bundle.assets);
  if (issues.errors.length) {
    console.error(`Seed không hợp lệ (${issues.errors.length} lỗi):\n- ${issues.errors.join("\n- ")}`);
    process.exitCode = 1;
    return;
  }

  const manifest = loadManifest();
  const worst = estimateRequests(bundle.assets.length);
  const byType = Object.entries(
    bundle.docs.reduce<Record<string, number>>((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {}),
  );

  if (!apply) {
    let remote = null;
    let remoteReq = 0;
    if (flag("--remote")) {
      remote = await realSink().readState(bundle.docs.map((d) => d._id), bundle.assets.map((a) => a.assetId));
      remoteReq = 1;
    }
    const items = plan(bundle.docs, remote, manifest, force);
    const summary = { mode: "dry", docs: bundle.docs.length, byType: Object.fromEntries(byType), assets: bundle.assets.length, warnings: issues.warnings, requestsThisRun: remoteReq, worstCaseApplyRequests: worst, maxRequests, actions: items.reduce<Record<string, number>>((m, i) => ((m[i.action] = (m[i.action] ?? 0) + 1), m), {}) };
    console.log(asJson ? JSON.stringify(summary, null, 2) : `DRY — ${bundle.docs.length} tài liệu (${byType.map(([t, n]) => `${t}:${n}`).join(", ")}), ${bundle.assets.length} ảnh.\nRequest lần này: ${remoteReq}. Cận trên cho --apply: ${worst} / ngưỡng ${maxRequests}.\n${issues.warnings.map((w) => `⚠ ${w}`).join("\n")}`);
    return;
  }

  const { sink, count } = counting(realSink());
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(STATE_DIR, "backups", `migrate-${stamp}.json`);
  const r = await applyMigration({
    docs: bundle.docs,
    assets: bundle.assets,
    sink,
    manifest,
    force,
    maxRequests,
    now: () => new Date().toISOString(),
    saveBackup: (b) => save(backupPath, b),
  });
  save(MANIFEST, r.manifest);
  const acts = r.plan.reduce<Record<string, number>>((m, i) => ((m[i.action] = (m[i.action] ?? 0) + 1), m), {});
  console.log(`APPLY xong — request thực tế: ${count()} (ước lượng ≤ ${worst}). Ghi ${r.written.length} tài liệu, tải ${r.uploaded.length} ảnh.`);
  console.log(`Kế hoạch: ${JSON.stringify(acts)}${r.backup ? `\nBackup: ${backupPath}` : ""}`);
  for (const i of r.plan.filter((x) => x.action.startsWith("skip"))) console.log(`  bỏ qua ${i.id}: ${i.reason}`);
}

if (require.main === module || process.argv[1]?.endsWith("migrate.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  });
}
