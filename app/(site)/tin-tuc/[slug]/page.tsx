import { notFound } from "next/navigation";
import { RichText } from "@/components/content/RichText";
import { Container } from "@/components/layout/Container";
import { CmsImage } from "@/components/media/CmsImage";
import { quoteHref } from "@/components/product/ProductBlocks";
import { Breadcrumbs, dateVi, MessageFormSection, NavButton, PostCard } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getNewsPage, getPost, getPosts, getProductGroups, getSiteSettings } from "@/lib/content";
import { newsHref } from "@/lib/news/params";
import { isPlaceholderPostSlug, postStaticParams } from "@/lib/news/static-params";
import { buildGraph } from "@/lib/seo/jsonld";
import { blogPostingNode } from "@/lib/seo/nodes";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

type Props = PageProps<"/tin-tuc/[slug]">;

/**
 * Bài mới publish chưa có trong build: request đầu chờ render đầy đủ rồi lưu ISR (tag "post").
 * Nhờ vậy slug không tồn tại gọi notFound() TRƯỚC khi stream → mã 404 thật (không soft-404).
 */
export const ensureStatic = "navigation";

/** CMS trống → một slug giữ chỗ (cacheComponents đòi ≥ 1 param); slug đó luôn 404 + noindex. */
export async function generateStaticParams() {
  return postStaticParams(await getPosts());
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = isPlaceholderPostSlug(slug) ? null : await getPost(slug);
  if (!post) return pageMetadata({ path: `/tin-tuc/${slug}`, noindex: true });
  return pageMetadata({
    path: `/tin-tuc/${post.slug}`,
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    image: post.ogImage ?? post.image,
    noindex: post.noindex,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

/** /tin-tuc/[slug] (T4.7, article): giữ tiêu đề / ngày / chủ đề / ảnh như web cũ; bài liên quan; CTA → /bao-gia. */
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = isPlaceholderPostSlug(slug) ? null : await getPost(slug);
  if (!post) notFound();
  const [all, news, settings, groups] = await Promise.all([getPosts(), getNewsPage(), getSiteSettings(), getProductGroups()]);
  const picked = post.relatedSlugs.map((s) => all.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const related = (picked.length ? picked : all.filter((p) => p.slug !== post.slug && p.category?.slug === post.category?.slug))
    .concat(all.filter((p) => p.slug !== post.slug))
    .filter((p, i, arr) => p.slug !== post.slug && arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, 3);
  const crumbs = [
    { name: "Tin tức", path: "/tin-tuc" },
    ...(post.category ? [{ name: post.category.title, path: newsHref(post.category.slug) }] : []),
    { name: post.title, path: `/tin-tuc/${post.slug}` },
  ];
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: `/tin-tuc/${post.slug}`, name: post.title, description: post.seoDescription ?? post.excerpt, breadcrumbs: crumbs },
    extra: blogPostingNode(post, SITE_URL),
  });
  const cta = news.articleCta;

  return (
    <>
      <JsonLd data={graph} />
      <article>
        <header className="bg-ink-950 py-section text-surface">
          <Container className="max-w-4xl">
            <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c))} />
            {post.category && <p className="mt-8 text-xs font-bold uppercase tracking-label text-cyan-200">{post.category.title}</p>}
            <h1 className="mt-3 text-3xl font-extrabold text-surface">{post.title}</h1>
            {post.excerpt && <p className="mt-5 text-lg text-surface/85">{post.excerpt}</p>}
            {post.publishedAt && (
              <p className="mt-4 text-sm text-surface/70">
                <time dateTime={post.publishedAt}>{dateVi(post.publishedAt)}</time>
              </p>
            )}
          </Container>
        </header>
        <Container className="max-w-4xl py-12">
          {post.image && <CmsImage image={post.image} lcp sizes="(min-width: 896px) 896px, 100vw" className="h-auto w-full rounded-card" />}
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <RichText value={post.body} className="max-w-prose text-body" />
            <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
              <p className="text-xs font-bold uppercase tracking-label text-brand-ink">Sản phẩm liên quan</p>
              <ul className="grid gap-2 text-sm">
                {groups.map((g) => (
                  <li key={g.slug}>
                    <a href={`/san-pham#${g.slug}`} className="font-semibold text-ink hover:text-brand-ink">
                      {g.title}
                    </a>
                    <a href={quoteHref(g.slug)} className="ml-2 text-brand-ink underline underline-offset-2">
                      Báo giá
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
          {cta && (
            <section aria-labelledby="article-cta" className="mt-12 rounded-card bg-brand-100 p-6">
              <h2 id="article-cta" className="text-xl font-extrabold">
                {cta.heading}
              </h2>
              {cta.text && <p className="mt-2 text-muted">{cta.text}</p>}
              <div className="mt-4">{cta.cta ? <NavButton item={cta.cta} /> : <ButtonLink href="/bao-gia">Nhận báo giá</ButtonLink>}</div>
            </section>
          )}
        </Container>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-surface-2 py-section">
          <Container>
            <h2 id="related-title" className="text-2xl font-extrabold">
              Bài viết liên quan
            </h2>
            <ul className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </ul>
          </Container>
        </section>
      )}
      <MessageFormSection page={`/tin-tuc/${post.slug}`} />
    </>
  );
}
