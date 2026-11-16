/**
 * Lõi migrate: lập kế hoạch + chạy theo lô qua một `Sink` (client Sanity thật hoặc giả trong test).
 * Quy tắc (bất biến 10, skill content-migration):
 *  - id tất định, createOrReplace trong MỘT transaction (không một request mỗi tài liệu);
 *  - không ghi đè tài liệu đã sửa trong Studio (rev khác manifest, hoặc đang có bản nháp) trừ --force;
 *  - ảnh: id asset tính từ sha1 → chỉ tải ảnh chưa có (một truy vấn kiểm tất cả);
 *  - backup trước khi ghi, --restore khoá theo rev.
 */
import { readFileSync } from "node:fs";
import type { AssetInfo } from "./assets";
import { hashDoc } from "./build";
import type { SanityDoc } from "./to-docs";

export type Manifest = {
  version: 1;
  /** id → rev + hash seed tại lần migrate gần nhất. */
  docs: Record<string, { rev: string; hash: string; at: string }>;
};

export type Existing = { _id: string; _rev: string; _updatedAt?: string } & Record<string, unknown>;
export type RemoteState = { docs: Existing[]; drafts: { _id: string; _rev: string }[]; assets: { _id: string }[] };

export type Action = "create" | "replace" | "unchanged" | "skip-edited" | "skip-draft";
export type PlanItem = { id: string; type: string; action: Action; reason?: string };

export type Mutation = { createOrReplace: SanityDoc } | { delete: { id: string } };

/** Ranh giới với Sanity — mỗi hàm là đúng MỘT request. */
export interface Sink {
  /** Một truy vấn GROQ gom (tài liệu + bản nháp + asset). */
  readState(ids: string[], assetIds: string[]): Promise<RemoteState>;
  uploadImage(a: AssetInfo, bytes: Buffer): Promise<{ _id: string }>;
  /** Một transaction nhiều mutation. */
  commit(mutations: Mutation[]): Promise<void>;
  /** Một truy vấn lấy _rev hiện tại của các id. */
  readRevs(ids: string[]): Promise<{ _id: string; _rev: string }[]>;
}

export const emptyManifest = (): Manifest => ({ version: 1, docs: {} });

export function plan(docs: SanityDoc[], remote: RemoteState | null, manifest: Manifest, force: boolean): PlanItem[] {
  const byId = new Map((remote?.docs ?? []).map((d) => [d._id, d]));
  const drafts = new Set((remote?.drafts ?? []).map((d) => d._id));
  return docs.map((d) => {
    const base = { id: d._id, type: d._type };
    if (!remote) return { ...base, action: "create" as const, reason: "chưa kiểm remote (dry offline)" };
    const ex = byId.get(d._id);
    if (!ex) return { ...base, action: "create" };
    const m = manifest.docs[d._id];
    if (!force && drafts.has(`drafts.${d._id}`)) return { ...base, action: "skip-draft", reason: "đang có bản nháp trong Studio" };
    if (!force && (!m || m.rev !== ex._rev))
      return { ...base, action: "skip-edited", reason: m ? "_rev khác lần migrate trước (đã sửa trong Studio)" : "đã tồn tại nhưng không do migrate tạo" };
    if (m && m.hash === hashDoc(d) && m.rev === ex._rev) return { ...base, action: "unchanged" };
    return { ...base, action: "replace" };
  });
}

/** Ước lượng số request Sanity của một lần --apply (cận trên). */
export function estimateRequests(uploads: number): number {
  return 1 /* readState */ + uploads + 1 /* transaction */ + 1 /* readRevs */;
}

export type Backup = {
  version: 1;
  createdAt: string;
  /** Bản gốc của các tài liệu sẽ bị thay. */
  replaced: Existing[];
  /** id tài liệu do lần chạy này tạo mới. */
  created: string[];
  /** Điền sau khi ghi: id → _rev ngay sau migrate (khoá cho --restore). */
  after?: Record<string, string>;
};

export type ApplyResult = {
  plan: PlanItem[];
  requests: number;
  uploaded: string[];
  written: string[];
  backup: Backup | null;
  manifest: Manifest;
};

export async function applyMigration(opts: {
  docs: SanityDoc[];
  assets: AssetInfo[];
  sink: Sink;
  manifest: Manifest;
  force: boolean;
  maxRequests: number;
  now: () => string;
  saveBackup: (b: Backup) => void;
  /** Tối đa byte payload một transaction (tham chiếu chéo nên không chia lô giữa chừng). */
  maxTxBytes?: number;
}): Promise<ApplyResult> {
  const { docs, assets, sink, force } = opts;
  const worst = estimateRequests(assets.length);
  if (worst > opts.maxRequests) throw new Error(`Ước lượng ${worst} request vượt ngưỡng --max-requests=${opts.maxRequests}.`);

  let requests = 0;
  const remote = await sink.readState(
    docs.map((d) => d._id),
    assets.map((a) => a.assetId),
  );
  requests++;

  const items = plan(docs, remote, opts.manifest, force);
  const writeIds = new Set(items.filter((i) => ["create", "replace"].includes(i.action)).map((i) => i.id));
  const toWrite = docs.filter((d) => writeIds.has(d._id));

  // Chỉ tải ảnh mà tài liệu cần ghi dùng và Sanity chưa có.
  const have = new Set(remote.assets.map((a) => a._id));
  const used = new Set<string>();
  JSON.stringify(toWrite, (k, v) => (k === "_ref" && typeof v === "string" && v.startsWith("image-") ? (used.add(v), v) : v));
  const missing = assets.filter((a) => used.has(a.assetId) && !have.has(a.assetId));

  const uploaded: string[] = [];
  const created = toWrite.filter((d) => !remote.docs.some((e) => e._id === d._id)).map((d) => d._id);
  const backup: Backup | null = toWrite.length
    ? { version: 1, createdAt: opts.now(), replaced: remote.docs.filter((e) => writeIds.has(e._id)), created }
    : null;
  if (backup) opts.saveBackup(backup); // backup TRƯỚC mọi thao tác ghi (kể cả tải ảnh)

  for (const a of missing) {
    const res = await sink.uploadImage(a, readFileSync(a.file));
    requests++;
    if (res._id !== a.assetId) throw new Error(`Asset trả về ${res._id} ≠ dự kiến ${a.assetId} — dừng, chưa ghi tài liệu nào.`);
    uploaded.push(a.assetId);
  }

  const written: string[] = [];
  const manifest: Manifest = { version: 1, docs: { ...opts.manifest.docs } };
  if (toWrite.length) {
    const bytes = Buffer.byteLength(JSON.stringify(toWrite));
    if (bytes > (opts.maxTxBytes ?? 3_000_000))
      throw new Error(`Payload ${bytes} byte vượt giới hạn một transaction; không chia lô giữa chừng vì tham chiếu mạnh chéo giữa tài liệu.`);
    await sink.commit(toWrite.map((d) => ({ createOrReplace: d })));
    requests++;
    written.push(...toWrite.map((d) => d._id));
    const revs = await sink.readRevs(written);
    requests++;
    const at = opts.now();
    for (const r of revs) manifest.docs[r._id] = { rev: r._rev, hash: hashDoc(docs.find((d) => d._id === r._id)), at };
    if (backup) {
      backup.after = Object.fromEntries(revs.map((r) => [r._id, r._rev]));
      opts.saveBackup(backup);
    }
  }
  // Tài liệu "unchanged" vẫn cập nhật rev nếu khớp hash (không có gì để ghi).
  return { plan: items, requests, uploaded, written, backup, manifest };
}

/** --restore: đưa lại bản gốc / xoá bản do migrate tạo, chỉ khi tài liệu chưa bị sửa kể từ sau migrate. */
export async function restoreBackup(opts: { backup: Backup; sink: Sink; force: boolean }): Promise<{ restored: string[]; deleted: string[]; conflicts: string[] }> {
  const { backup, sink } = opts;
  if (!backup.after) throw new Error("Backup chưa có `after` (lần migrate chưa hoàn tất) — không biết rev để khoá.");
  const ids = Object.keys(backup.after);
  const now = await sink.readRevs(ids);
  const conflicts = ids.filter((id) => now.find((r) => r._id === id)?._rev !== backup.after![id]);
  if (conflicts.length && !opts.force) return { restored: [], deleted: [], conflicts };
  const muts: Mutation[] = [
    ...backup.replaced.map((d) => {
      const { _rev, _updatedAt, _createdAt, ...rest } = d as Record<string, unknown>;
      void _rev; void _updatedAt; void _createdAt;
      return { createOrReplace: rest as SanityDoc };
    }),
    ...backup.created.map((id) => ({ delete: { id } })),
  ];
  await sink.commit(muts);
  return { restored: backup.replaced.map((d) => d._id), deleted: backup.created, conflicts };
}
