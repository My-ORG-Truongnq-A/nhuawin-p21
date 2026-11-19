import Link from "next/link";
import { CmsImage } from "@/components/media/CmsImage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Application, ProductGroup, SpecRow } from "@/lib/content/types";
import { AlbumDisclosure } from "./AlbumDisclosure";

const mm = (n: number) => `${n.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mm`;
export const rangeLabel = (g: ProductGroup) => (g.actualRangeMm ? `${mm(g.actualRangeMm.min)} – ${mm(g.actualRangeMm.max)}`.replace(/ mm – /, " – ") : undefined);

/** Link báo giá theo nhóm: /bao-gia?loai={slug}#chon-quy-cach (REQ-19). */
export const quoteHref = (slug: string) => `/bao-gia?loai=${slug}#chon-quy-cach`;

/** Thẻ 4 nhóm ở trang chủ / Về WIN → /san-pham#{slug}. */
export function ProductGroupCards({ groups }: { groups: ProductGroup[] }) {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((g) => (
        <li key={g.slug} data-reveal className="overflow-hidden rounded-card border border-line bg-surface shadow-xs">
          <Link href={`/san-pham#${g.slug}`} className="group block h-full">
            {g.image && <CmsImage image={g.image} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />}
            <div className="p-5">
              {g.badge && <p className="text-xs font-bold uppercase tracking-label text-brand-ink">{g.badge}</p>}
              <h3 className="mt-1 text-xl font-bold group-hover:text-brand-ink">{g.title}</h3>
              {g.description && <p className="mt-2 text-sm text-muted">{g.description}</p>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 7 thẻ ứng dụng → /san-pham#ung-dung-{slug} (REQ-08). */
export function ApplicationCards({ apps }: { apps: Application[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {apps.map((a) => (
        <li key={a.slug} data-reveal>
          <Link href={`/san-pham#ung-dung-${a.slug}`} className="group relative block overflow-hidden rounded-card border border-line bg-surface-2">
            {a.cardImage ? (
              <CmsImage image={a.cardImage} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div aria-hidden="true" className="aspect-[4/3] w-full bg-surface-3" />
            )}
            <div className="p-4">
              <h3 className="text-base font-bold group-hover:text-brand-ink">{a.title}</h3>
              <p className="text-sm text-muted">{a.thicknessHint}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const specCells = (s: SpecRow) => [s.actualThicknessMm ? mm(s.actualThicknessMm) : "—", s.sizeMm ?? "—", s.sheetsPerBundle ?? "—"];

/**
 * Bảng quy cách (#bang-quy-cach): bảng ≥ 768 px, thẻ < 768 px (mockup fixedThisRun). Cả hai nằm trong HTML server.
 */
export function SpecTable({ groups, footnote }: { groups: ProductGroup[]; footnote?: string }) {
  const withSpecs = groups.filter((g) => g.specs.length);
  if (!withSpecs.length) return null;
  return (
    <>
      <div className="mt-8 hidden overflow-hidden rounded-card border border-line md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ink-950 text-surface">
            <tr>
              {["Loại tấm", "Độ dày thực tế", "Kích thước tấm", "Quy cách"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {withSpecs.map((g) => (
            <tbody key={g.slug}>
              <tr className="bg-surface-3">
                <th colSpan={4} scope="colgroup" className="px-4 py-2 font-spec text-base font-bold text-ink">
                  {g.title}
                  {rangeLabel(g) && <span className="font-medium text-muted"> · {rangeLabel(g)}</span>}
                </th>
              </tr>
              {g.specs.map((s, i) => (
                <tr key={`${s.label}-${i}`} className="border-t border-line">
                  <th scope="row" className="px-4 py-2.5 font-semibold text-ink">
                    {s.label}
                  </th>
                  {specCells(s).map((c, j) => (
                    <td key={j} className="px-4 py-2.5 tabular-nums">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className="mt-8 grid gap-6 md:hidden">
        {withSpecs.map((g) => (
          <section key={g.slug} aria-label={g.title}>
            <p className="font-spec text-lg font-bold text-ink">
              {g.title}
              {rangeLabel(g) && <span className="font-medium text-muted"> · {rangeLabel(g)}</span>}
            </p>
            <ul className="mt-3 grid gap-3">
              {g.specs.map((s, i) => (
                <li key={`${s.label}-${i}`} className="rounded-card border border-line bg-surface p-4">
                  <p className="font-semibold text-ink">{s.label}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {["Độ dày thực tế", "Kích thước tấm", "Quy cách"].map((k, j) => (
                      <div key={k} className="contents">
                        <dt className="text-muted">{k}</dt>
                        <dd className="tabular-nums text-body">{specCells(s)[j]}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {footnote && <p className="mt-4 text-sm text-muted">{footnote}</p>}
    </>
  );
}

/** Một nhóm sản phẩm trên /san-pham, anchor = slug CMS. */
export function ProductGroupItem({ g }: { g: ProductGroup }) {
  return (
    <li id={g.slug} data-reveal className="grid overflow-hidden rounded-card border border-line bg-surface md:grid-cols-[2fr_3fr]">
      {g.image && <CmsImage image={g.image} sizes="(min-width: 768px) 40vw, 100vw" className="h-full min-h-56 w-full object-cover" />}
      <div className="p-6">
        {g.badge && <p className="text-xs font-bold uppercase tracking-label text-brand-ink">{g.badge}</p>}
        <h3 className="mt-1 text-2xl font-bold">{g.title}</h3>
        {g.description && <p className="mt-2 text-muted">{g.description}</p>}
        {rangeLabel(g) && <p className="mt-3 font-spec text-lg font-semibold text-ink">Độ dày thực tế {rangeLabel(g)}</p>}
        {g.specs.length > 0 && (
          <ul className="mt-3 grid gap-1 text-sm text-body">
            {g.specs.map((s, i) => (
              <li key={`${s.label}-${i}`}>
                {s.label} — {s.actualThicknessMm ? mm(s.actualThicknessMm) : ""}
                {s.sheetsPerBundle ? ` · ${s.sheetsPerBundle}` : ""}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5">
          <ButtonLink href={quoteHref(g.slug)}>{g.quoteCtaLabel ?? `Báo giá ${g.title}`}</ButtonLink>
        </div>
      </div>
    </li>
  );
}

/** Phần một ứng dụng trên /san-pham (#ung-dung-{slug}); album ẩn hẳn khi chưa có ảnh (MI-08). */
export function ApplicationItem({ a }: { a: Application }) {
  const id = `ung-dung-${a.slug}`;
  return (
    <li id={id} data-reveal className="rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start gap-5">
        {a.cardImage && <CmsImage image={a.cardImage} sizes="160px" className="aspect-[4/3] w-40 rounded-md object-cover" />}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{a.title}</h3>
          <p className="text-sm text-muted">
            {a.thicknessHint}
            {a.album.length > 0 && ` · ${a.album.length} ảnh`}
          </p>
          {a.summary && <p className="mt-2 text-sm text-body">{a.summary}</p>}
          {a.album.length > 0 && (
            <div className="mt-4">
              <AlbumDisclosure id={id} label="Xem album ảnh">
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {a.album.map((img) => (
                    <li key={img.url}>
                      <figure>
                        <CmsImage image={img} sizes="(min-width: 768px) 25vw, 50vw" className="aspect-[4/3] w-full rounded-md object-cover" />
                        {img.caption && <figcaption className="mt-1 text-xs text-subtle">{img.caption}</figcaption>}
                      </figure>
                    </li>
                  ))}
                </ul>
              </AlbumDisclosure>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
