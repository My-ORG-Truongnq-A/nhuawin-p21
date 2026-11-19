import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero, PostCard } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getNewsPage, getPosts, getSiteSettings } from "@/lib/content";
import { newsHref, paginate, parseNewsParams } from "@/lib/news/params";
import { buildGraph } from "@/lib/seo/jsonld";
import { postListNode } from "@/lib/seo/nodes";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";

type Props = PageProps<"/tin-tuc">;

/** Canonical tự trỏ đã chuẩn hoá; trang lọc / phân trang "noindex, follow" (seo_plan, OQ-SEO-03). */
export async function generateMetadata({ searchParams }: Props) {
  const [sp, page, cats] = await Promise.all([searchParams, getNewsPage(), getCategories()]);
  const q = parseNewsParams(sp, cats.map((c) => c.slug));
  if (q === "not-found") return pageMetadata({ path: "/tin-tuc", title: page.seo.title ?? page.title, noindex: true });
  const cat = cats.find((c) => c.slug === q.topic);
  const suffix = q.page > 1 ? ` – Trang ${q.page}` : "";
  return pageMetadata({
    path: q.canonicalPath,
    keepQuery: true,
    title: cat ? `${cat.title}${suffix} | Tin tức` : `${page.seo.title ?? page.title}${suffix}`,
    description: cat?.description ?? page.seo.description,
    image: page.seo.ogImage,
    noindex: q.noindex || page.seo.noindex,
  });
}

async function Listing({ searchParams }: Pick<Props, "searchParams">) {
  const [sp, page, cats, posts, settings] = await Promise.all([searchParams, getNewsPage(), getCategories(), getPosts(), getSiteSettings()]);
  const q = parseNewsParams(sp, cats.map((c) => c.slug));
  if (q === "not-found") notFound();
  const visible = posts.filter((p) => !q.topic || p.category?.slug === q.topic);
  const paged = paginate(visible, q.page, page.postsPerPage);
  if (paged === "not-found") notFound();
  const cat = cats.find((c) => c.slug === q.topic);
  const pageUrl = absoluteUrl(q.canonicalPath, SITE_URL);
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: {
      path: q.canonicalPath,
      name: cat?.title ?? page.title,
      description: cat?.description ?? page.seo.description,
      type: "CollectionPage",
      breadcrumbs: [{ name: "Tin tức", path: "/tin-tuc" }, ...(cat ? [{ name: cat.title, path: newsHref(cat.slug) }] : [])],
    },
    extra: postListNode(paged.items, pageUrl, SITE_URL),
  });
  const pill = "inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border px-4 text-sm font-semibold";

  return (
    <>
      <JsonLd data={graph} />
      <nav aria-label="Chủ đề">
        <ul className="flex flex-wrap gap-2">
          {[{ slug: undefined, title: "Tất cả" }, ...cats].map((c) => {
            const current = c.slug === q.topic;
            return (
              <li key={c.slug ?? "all"}>
                <Link
                  href={`${newsHref(c.slug)}#danh-sach`}
                  aria-current={current ? "page" : undefined}
                  className={`${pill} ${current ? "border-brand bg-brand text-surface" : "border-line text-ink hover:border-brand"}`}
                >
                  {c.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {cat && <h2 className="mt-8 text-2xl font-extrabold">{cat.title}</h2>}
      {paged.items.length ? (
        <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {paged.items.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted">{page.emptyText ?? "Chưa có bài viết."}</p>
      )}
      {paged.totalPages > 1 && (
        <nav aria-label="Phân trang" className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {Array.from({ length: paged.totalPages }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <Link
                  href={`${newsHref(q.topic, n)}#danh-sach`}
                  aria-current={n === q.page ? "page" : undefined}
                  aria-label={`Trang ${n}`}
                  className={`${pill} min-w-11 justify-center ${n === q.page ? "border-brand bg-brand text-surface" : "border-line text-ink"}`}
                >
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}

/** /tin-tuc (T4.6, blog_index): lọc ?chu-de=, phân trang ?trang= (số bài từ newsPage.postsPerPage). */
export default async function NewsPage({ searchParams }: Props) {
  const page = await getNewsPage();
  return (
    <>
      <PageHero crumbs={[{ name: "Tin tức" }]} eyebrow="Tin tức" title={page.title} intro={page.intro} />
      <section id="danh-sach" aria-label="Danh sách bài viết" className="py-section">
        <Container>
          <Suspense fallback={<div className="min-h-96" aria-busy="true" />}>
            <Listing searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
