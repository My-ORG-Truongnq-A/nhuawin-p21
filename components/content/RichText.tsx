import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { CmsImage } from "@/components/media/CmsImage";
import type { ImageRef, RichText as RichTextValue } from "@/lib/content/types";
import { slugifyVi } from "@/lib/slug/slugify-vi";

const text = (children: unknown) =>
  Array.isArray(children) ? children.map((c) => (typeof c === "string" ? c : "")).join("") : String(children ?? "");

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
    // id theo tiêu đề: giữ anchor mục lục của bài cũ (vd #sai-lam-thuong-gap).
    h2: ({ children }) => (
      <h2 id={slugifyVi(text(children))} className="mt-10 text-2xl font-bold">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="mt-8 text-xl font-bold">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-6 text-lg font-bold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="mt-8 whitespace-pre-line rounded-card border border-line bg-surface-2 p-5 text-body">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-brand">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-semibold">{children}</ol>,
  },
  marks: {
    brandHighlight: ({ children }) => <span className="font-semibold text-brand-ink">{children}</span>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href;
      if (!href) return <>{children}</>;
      const cls = "font-semibold text-brand-ink underline underline-offset-2";
      return href.startsWith("/") ? (
        <Link href={href} className={cls}>
          {children}
        </Link>
      ) : (
        <a href={href} className={cls} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {})}>
          {children}
        </a>
      );
    },
  },
  types: {
    figure: ({ value }) => (
      <figure className="mt-8">
        <CmsImage image={value as ImageRef} sizes="(min-width: 768px) 720px, 100vw" className="h-auto w-full rounded-card" />
        {(value as { caption?: string }).caption && (
          <figcaption className="mt-2 text-sm text-subtle">{(value as { caption?: string }).caption}</figcaption>
        )}
      </figure>
    ),
    table: ({ value }) => {
      const rows = ((value as { rows?: { _key: string; cells?: string[] }[] }).rows ?? []).filter((r) => r.cells?.length);
      if (!rows.length) return null;
      const [head, ...body] = rows;
      return (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {head.cells!.map((c, i) => (
                  <th key={i} scope="col" className="border-b-2 border-line-strong bg-surface-2 px-3 py-2 font-semibold text-ink">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r) => (
                <tr key={r._key}>
                  {r.cells!.map((c, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="border-b border-line px-3 py-2 font-semibold text-ink">
                        {c}
                      </th>
                    ) : (
                      <td key={i} className="border-b border-line px-3 py-2">
                        {c}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    embed: () => null,
    faq: () => null,
  },
};

/** Portable Text đã chuẩn hoá ở cửa nội dung (link có href sẵn). */
export function RichText({ value, className = "" }: { value: RichTextValue; className?: string }) {
  return (
    <div className={className}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}
