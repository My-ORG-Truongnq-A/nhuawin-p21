import { readFileSync } from "node:fs";
import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";
import { NORMALIZERS, postDetail } from "@/lib/content/normalize";
import { POST_QUERY, QUERIES } from "@/lib/sanity/queries";
import { SEED, SEED_POSTS } from "@/seed/content";
import { buildBundle, seedFiles } from "./lib/build";
import {
  applyMigration,
  emptyManifest,
  estimateRequests,
  plan,
  restoreBackup,
  type Backup,
  type Existing,
  type Manifest,
  type Mutation,
  type RemoteState,
  type Sink,
} from "./lib/engine";
import { validateDocs } from "./lib/validate";
import { compare } from "./verify";

const ROOT = process.cwd();
const bundle = buildBundle(ROOT);
const { docs, assets } = bundle;

/** Dataset giả để chạy GROQ thật: tài liệu + asset (url nội bộ giữ nguyên để so với seed). */
const dataset = [
  ...assets.map((a) => ({
    _id: a.assetId,
    _type: "sanity.imageAsset",
    url: a.url,
    metadata: { dimensions: { width: a.width, height: a.height } },
  })),
  ...docs,
];

async function run(query: string, params: Record<string, unknown> = {}) {
  return (await evaluate(parse(query), { dataset, params })).get();
}

describe("seed JSON sinh từ script", () => {
  it("tệp seed/sanity/*.json trùng bản sinh lại (không sửa tay)", () => {
    for (const [rel, content] of Object.entries(seedFiles(bundle))) {
      expect(readFileSync(rel, "utf8"), rel).toBe(content);
    }
  });

  it("tất định: dựng hai lần ra cùng kết quả", () => {
    expect(JSON.stringify(buildBundle(ROOT).docs)).toBe(JSON.stringify(docs));
  });

  it("không lỗi validate; 34 tài liệu theo loại, id duy nhất", () => {
    expect(validateDocs(docs, assets).errors).toEqual([]);
    const n = (t: string) => docs.filter((d) => d._type === t).length;
    expect([n("post"), n("category"), n("productGroup"), n("application")]).toEqual([6, 4, 4, 7]);
    expect(docs).toHaveLength(34);
    expect(new Set(docs.map((d) => d._id)).size).toBe(34);
    // singleton: _id = _type; privacyPage chưa có nội dung → không tạo
    expect(docs.filter((d) => d._id === d._type)).toHaveLength(13);
    expect(docs.some((d) => d._type === "privacyPage")).toBe(false);
  });

  it("_id không chứa dấu chấm (tài liệu công khai qua CDN)", () => {
    expect(docs.filter((d) => d._id.includes("."))).toEqual([]);
  });

  it("validate bắt alt thiếu, tham chiếu gãy, số chính sai", () => {
    const bad = structuredClone(docs);
    const post = bad.find((d) => d._type === "post")!;
    (post.mainImage as { alt: string }).alt = "x";
    (post.category as { _ref: string })._ref = "category-khong-co";
    const s = bad.find((d) => d._id === "siteSettings")!;
    (s.phones as { isPrimary?: boolean }[]).forEach((p) => (p.isPrimary = false));
    const errs = validateDocs(bad, assets).errors.join("\n");
    expect(errs).toMatch(/alt phải 5–160/);
    expect(errs).toMatch(/tham chiếu gãy → category-khong-co/);
    expect(errs).toMatch(/đúng 1 số chính/);
  });
});

describe("khứ hồi: tài liệu Sanity → GROQ cửa nội dung → đúng seed", () => {
  const singletons = [
    "siteSettings", "header", "footer", "homePage", "productsPage", "quotePage", "aboutPage",
    "partnershipPage", "newsPage", "contactPage", "leadForms", "notFoundPage",
  ] as const;

  for (const key of singletons) {
    it(key, async () => {
      const out = NORMALIZERS[key](await run(QUERIES[key]));
      expect(out).toEqual(SEED[key]);
    });
  }

  it("privacyPage → null (chưa có nội dung được duyệt)", async () => {
    expect(NORMALIZERS.privacyPage(await run(QUERIES.privacyPage))).toBeNull();
  });

  it("categories / productGroups / applications", async () => {
    expect(NORMALIZERS.categories(await run(QUERIES.categories))).toEqual(SEED.categories);
    expect(NORMALIZERS.productGroups(await run(QUERIES.productGroups))).toEqual(SEED.productGroups);
    const apps = NORMALIZERS.applications(await run(QUERIES.applications))!;
    expect(apps.map((a) => a.slug)).toEqual(SEED.applications.map((a) => a.slug));
    // album + nhóm gợi ý khớp; ảnh thẻ riêng chỉ khác khi seed không có
    for (const a of apps) {
      const s = SEED.applications.find((x) => x.slug === a.slug)!;
      expect(a.album).toEqual(s.album);
      expect(a.recommendedGroups).toEqual(s.recommendedGroups);
      const { caption: _c, ...card } = (s.cardImage ?? s.album[0]) as typeof s.album[number]; // GROQ ảnh thẻ không chiếu caption
      void _c;
      expect(a.cardImage).toEqual(card);
    }
  });

  it("6 bài: danh sách + chi tiết khớp seed (ngày, chủ đề, thân bài, bảng)", async () => {
    const list = NORMALIZERS.posts(await run(QUERIES.posts))!;
    expect(list.map((p) => p.slug).sort()).toEqual(SEED_POSTS.map((p) => p.slug).sort());
    for (const p of SEED_POSTS) {
      const got = postDetail(await run(POST_QUERY, { slug: p.slug }))!;
      expect(got.body).toEqual(p.body);
      expect(got.category).toEqual(p.category);
      expect(got.title).toBe(p.title);
      expect(got.publishedAt?.slice(0, 10)).toBe(p.publishedAt);
      expect(got.seoTitle).toBe(p.seoTitle);
      expect(got.seoDescription).toBe(p.seoDescription);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Lõi migrate chạy với Sink giả — 0 request tới Sanity.

class FakeSink implements Sink {
  store = new Map<string, Existing>();
  assets = new Set<string>();
  drafts = new Set<string>();
  calls = { read: 0, upload: 0, commit: 0, revs: 0 };
  rev = 0;
  commits: Mutation[][] = [];
  async readState(ids: string[], assetIds: string[]): Promise<RemoteState> {
    this.calls.read++;
    return {
      docs: ids.map((i) => this.store.get(i)).filter(Boolean) as Existing[],
      drafts: ids.filter((i) => this.drafts.has(`drafts.${i}`)).map((i) => ({ _id: `drafts.${i}`, _rev: "d" })),
      assets: assetIds.filter((a) => this.assets.has(a)).map((_id) => ({ _id })),
    };
  }
  async uploadImage(a: { assetId: string }) {
    this.calls.upload++;
    this.assets.add(a.assetId);
    return { _id: a.assetId };
  }
  async commit(muts: Mutation[]) {
    this.calls.commit++;
    this.commits.push(muts);
    for (const m of muts) {
      if ("createOrReplace" in m) this.store.set(m.createOrReplace._id, { ...m.createOrReplace, _rev: `r${++this.rev}` } as Existing);
      else this.store.delete(m.delete.id);
    }
  }
  async readRevs(ids: string[]) {
    this.calls.revs++;
    return ids.map((i) => this.store.get(i)).filter(Boolean).map((d) => ({ _id: d!._id, _rev: d!._rev }));
  }
}

const base = (sink: Sink, manifest: Manifest, extra: Partial<Parameters<typeof applyMigration>[0]> = {}) => {
  const backups: Backup[] = [];
  return {
    backups,
    opts: {
      docs,
      assets,
      sink,
      manifest,
      force: false,
      maxRequests: 80,
      now: () => "2026-11-16T00:00:00Z",
      saveBackup: (b: Backup) => void backups.push(structuredClone(b)),
      ...extra,
    },
  };
};

describe("applyMigration (Sink giả)", () => {
  it("lần đầu: 1 đọc + N tải ảnh + 1 transaction + 1 đọc rev; ghi đủ 34 tài liệu trong MỘT lô", async () => {
    const sink = new FakeSink();
    const { opts } = base(sink, emptyManifest());
    const r = await applyMigration(opts);
    expect(sink.calls).toEqual({ read: 1, upload: assets.length, commit: 1, revs: 1 });
    expect(r.requests).toBe(estimateRequests(assets.length));
    expect(sink.commits[0]).toHaveLength(34);
    expect(sink.commits[0].every((m) => "createOrReplace" in m)).toBe(true);
    expect(Object.keys(r.manifest.docs)).toHaveLength(34);
  });

  it("chạy lại: không ghi, không tải ảnh (id tất định, không nhân bản)", async () => {
    const sink = new FakeSink();
    const first = await applyMigration(base(sink, emptyManifest()).opts);
    const again = await applyMigration(base(sink, first.manifest).opts);
    expect(again.written).toEqual([]);
    expect(again.uploaded).toEqual([]);
    expect(sink.calls.commit).toBe(1);
    expect(sink.calls.upload).toBe(assets.length);
    expect(again.plan.every((p) => p.action === "unchanged")).toBe(true);
    expect(sink.store.size).toBe(34);
  });

  it("không ghi đè tài liệu đã sửa trong Studio (rev đổi) trừ --force", async () => {
    const sink = new FakeSink();
    const first = await applyMigration(base(sink, emptyManifest()).opts);
    const edited = sink.store.get("homePage")!;
    sink.store.set("homePage", { ...edited, title: "Khách sửa", _rev: "studio-1" });
    const again = await applyMigration(base(sink, first.manifest).opts);
    expect(again.plan.find((p) => p.id === "homePage")?.action).toBe("skip-edited");
    expect(sink.store.get("homePage")?.title).toBe("Khách sửa");
    const forced = await applyMigration(base(sink, first.manifest, { force: true }).opts);
    expect(forced.written).toContain("homePage");
    expect(sink.store.get("homePage")?.title).toBeUndefined();
  });

  it("bỏ qua tài liệu đang có bản nháp; tài liệu có sẵn nhưng không do migrate tạo", async () => {
    const sink = new FakeSink();
    sink.store.set("header", { _id: "header", _rev: "x1" });
    sink.drafts.add("drafts.footer");
    const r = await applyMigration(base(sink, emptyManifest()).opts);
    const act = (id: string) => r.plan.find((p) => p.id === id)?.action;
    expect(act("header")).toBe("skip-edited");
    expect(act("footer")).toBe("create"); // bản nháp chỉ chặn khi đã có bản publish để thay
  });

  it("ảnh đã có trên Sanity thì không tải lại", async () => {
    const sink = new FakeSink();
    assets.slice(0, 10).forEach((a) => sink.assets.add(a.assetId));
    await applyMigration(base(sink, emptyManifest()).opts);
    expect(sink.calls.upload).toBe(assets.length - 10);
  });

  it("vượt --max-requests → dừng TRƯỚC khi gọi bất kỳ request nào", async () => {
    const sink = new FakeSink();
    await expect(applyMigration(base(sink, emptyManifest(), { maxRequests: 10 }).opts)).rejects.toThrow(/vượt ngưỡng/);
    expect(sink.calls).toEqual({ read: 0, upload: 0, commit: 0, revs: 0 });
  });

  it("backup được lưu TRƯỚC khi tải ảnh / ghi, và có `after` khi xong", async () => {
    const sink = new FakeSink();
    sink.store.set("siteSettings", { _id: "siteSettings", _rev: "old", siteName: "Bản cũ" });
    const m: Manifest = { version: 1, docs: { siteSettings: { rev: "old", hash: "khac", at: "t" } } };
    const { opts, backups } = base(sink, m);
    await applyMigration(opts);
    expect(backups[0].replaced.map((d) => d._id)).toEqual(["siteSettings"]);
    expect(backups[0].after).toBeUndefined();
    expect(backups.at(-1)?.after?.siteSettings).toBeDefined();
    expect(backups[0].created).toHaveLength(33);
  });

  it("restore: trả bản gốc + xoá bản tạo mới; dừng nếu tài liệu đã đổi sau migrate", async () => {
    const sink = new FakeSink();
    sink.store.set("siteSettings", { _id: "siteSettings", _rev: "old", siteName: "Bản cũ" });
    const m: Manifest = { version: 1, docs: { siteSettings: { rev: "old", hash: "khac", at: "t" } } };
    const { opts, backups } = base(sink, m);
    await applyMigration(opts);
    const backup = backups.at(-1)!;

    sink.store.set("header", { ...sink.store.get("header")!, _rev: "studio-2" });
    const blocked = await restoreBackup({ backup, sink, force: false });
    expect(blocked.conflicts).toEqual(["header"]);
    expect(sink.store.size).toBe(34);

    sink.store.set("header", { ...sink.store.get("header")!, _rev: backup.after!.header });
    const ok = await restoreBackup({ backup, sink, force: false });
    expect(ok.conflicts).toEqual([]);
    expect(sink.store.size).toBe(1);
    expect(sink.store.get("siteSettings")?.siteName).toBe("Bản cũ");
  });
});

describe("plan (dry)", () => {
  it("offline (remote=null): mọi tài liệu là create, không cần mạng", () => {
    expect(plan(docs, null, emptyManifest(), false).every((i) => i.action === "create")).toBe(true);
  });
});

describe('verify.compare', () => {
  const ids = assets.map((a) => a.assetId);
  const m = emptyManifest();
  it('seed khớp chính nó → ok', () => {
    expect(compare(docs as never, docs as never, ids, m, 'self').ok).toBe(true);
  });
  it('bắt thiếu tài liệu, lệch slug, ref gãy, thiếu asset, lệch nội dung', () => {
    const remote = structuredClone(docs) as (Record<string, unknown> & { _id: string })[];
    const post = remote.find((d) => d._id.startsWith('post-'))!;
    (post.slug as { current: string }).current = 'sai';
    (post.category as { _ref: string })._ref = 'category-khong-co';
    remote.find((d) => d._id === 'homePage')!.title = 'sửa';
    const r = compare(docs as never, remote.filter((d) => d._id !== 'header') as never, ids.slice(1), m, 'remote');
    expect(r.ok).toBe(false);
    expect(r.missingDocs).toEqual(['header']);
    expect(r.slugMismatch).toHaveLength(1);
    expect(r.brokenRefs.length).toBeGreaterThan(0);
    expect(r.missingAssets.length).toBeGreaterThan(0);
    expect(r.bodyMismatch).toContain('homePage');
  });
  it('rev khác manifest → đã sửa trong Studio, không tính lệch', () => {
    const remote = structuredClone(docs).map((d) => ({ ...d, _rev: 'studio' })) as Record<string, unknown>[];
    remote.find((d) => d._id === 'homePage')!.title = 'sửa';
    const man = { version: 1 as const, docs: { homePage: { rev: 'cũ', hash: 'x', at: 't' } } };
    const r = compare(docs as never, remote as never, ids, man, 'remote');
    expect(r.editedInStudio).toEqual(['homePage']);
    expect(r.ok).toBe(true);
  });
});
