import Link from "next/link";
import { getNotFoundPage } from "@/lib/content";
import { resolveLink } from "@/lib/nav/resolve-link";
import { Section } from "./Section";

/** Nội dung 404 tiếng Việt từ notFoundPage (CMS), có link về các trang chính (T4.10, SEO-12). Không JSON-LD. */
export async function NotFoundContent() {
  const page = await getNotFoundPage();
  return (
    <Section labelledBy="not-found-title">
      <p className="text-xs font-bold uppercase tracking-label text-muted">Lỗi 404</p>
      <h1 id="not-found-title" className="mt-3 text-3xl font-extrabold">
        {page.title}
      </h1>
      {page.body && <p className="mt-4 max-w-prose text-lg text-muted">{page.body}</p>}
      {page.links.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-3">
          {page.links.map((item) => (
            <li key={item.label}>
              <Link
                href={resolveLink(item.link).href}
                className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 font-semibold text-brand-ink hover:bg-brand-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
