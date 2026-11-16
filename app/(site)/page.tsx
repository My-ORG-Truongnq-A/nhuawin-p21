import { Container } from "@/components/layout/Container";
import { CmsImage } from "@/components/media/CmsImage";
import { ApplicationCards, ProductGroupCards } from "@/components/product/ProductBlocks";
import { FeatureGrid, MessageFormSection, NavButton, PostCard, QuickFacts, SectionHeader } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getApplications, getHomePage, getPartnershipPage, getPosts, getProductGroups, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata() {
  const home = await getHomePage();
  return pageMetadata({ path: "/", title: home.seo.title, description: home.seo.description, image: home.seo.ogImage, noindex: home.seo.noindex });
}

/**
 * Trang chủ (T4.1) — PA1 "Xưởng mở": hero ảnh nhà máy toàn khung (LCP, không fade), năng lực,
 * 4 nhóm → /san-pham#…, 7 ứng dụng → /san-pham#ung-dung-…, đối tác (nền tối), 3 tin mới, thông tin nhanh, form.
 */
export default async function HomePage() {
  const [home, settings, groups, apps, posts, partner] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getProductGroups(),
    getApplications(),
    getPosts(),
    getPartnershipPage(),
  ]);
  const { hero } = home;
  const latest = posts.filter((p) => !p.noindex).slice(0, home.latestPosts?.count ?? 3);
  const graph = buildGraph({ settings, siteUrl: SITE_URL, page: { path: "/", name: home.seo.title ?? settings.brandName, description: home.seo.description } });

  return (
    <>
      <JsonLd data={graph} />
      <span id="top" aria-hidden="true" />
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink-950 py-section text-surface lg:min-h-[78vh]">
        {hero.image && (
          <>
            <CmsImage image={hero.image} lcp fill sizes="100vw" className="hero-media -z-20 object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/30" />
          </>
        )}
        <Container className="flex h-full flex-col justify-center lg:pt-16">
          {hero.eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-label text-cyan-200">{hero.eyebrow}</p>}
          {/* H1 nhiều dòng: dấu cách giữa các dòng trong DOM (seo_plan vấn đề #3). */}
          <h1 id="hero-title" className="max-w-[18ch] text-4xl font-extrabold text-surface">
            {hero.titleLines.map((line, i) => (
              <span key={line} className={`block ${i > 0 ? "text-cyan-200" : ""}`}>
                {i > 0 ? " " : ""}
                {line}
              </span>
            ))}
          </h1>
          {hero.lead && <p className="mt-6 max-w-prose text-lg text-surface/85">{hero.lead}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <NavButton item={hero.cta} />
            <NavButton item={hero.secondaryCta} variant="secondary" />
          </div>
        </Container>
      </section>

      {home.capability && (
        <section id="nang-luc" aria-labelledby="capability-title" className="py-section">
          <Container>
            <SectionHeader heading={home.capability.heading} id="capability-title" />
            <FeatureGrid items={home.capability.items} numbered />
          </Container>
        </section>
      )}

      <section id="san-pham" aria-labelledby="products-title" className="bg-surface-2 py-section">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader heading={home.productGroupsSection} id="products-title" />
            <ButtonLink href="/san-pham" variant="secondary">
              Xem chi tiết sản phẩm
            </ButtonLink>
          </div>
          <ProductGroupCards groups={groups} />
        </Container>
      </section>

      <section id="ung-dung" aria-labelledby="applications-title" className="py-section">
        <Container>
          <SectionHeader heading={home.applicationsSection} id="applications-title" />
          <ApplicationCards apps={apps} />
        </Container>
      </section>

      {home.partnerSection && (
        <section id="hop-tac" aria-labelledby="partner-title" className="relative isolate overflow-hidden bg-ink-950 py-section text-surface">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader heading={home.partnerSection.heading} id="partner-title" dark />
              {partner.partnerGroups && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {partner.partnerGroups.items.map((g) => (
                    <li key={g.title} className="rounded-pill border border-surface/30 px-4 py-1.5 text-sm font-semibold">
                      {g.title}
                    </li>
                  ))}
                </ul>
              )}
              {partner.growTogether && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {partner.growTogether.benefits.map((b) => (
                    <li key={b.title}>
                      <h3 className="text-base font-bold text-surface">{b.title}</h3>
                      {b.text && <p className="text-sm text-surface/80">{b.text}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8">
                <NavButton item={home.partnerSection.cta} />
              </div>
            </div>
            {partner.growTogether?.logisticsImage && (
              <CmsImage image={partner.growTogether.logisticsImage} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full rounded-card" />
            )}
          </Container>
        </section>
      )}

      {latest.length > 0 && (
        <section id="kien-thuc" aria-labelledby="knowledge-title" className="py-section">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeader heading={home.latestPosts?.heading} id="knowledge-title" />
              <ButtonLink href="/tin-tuc" variant="secondary">
                Xem tất cả bài viết
              </ButtonLink>
            </div>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {latest.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </ul>
          </Container>
        </section>
      )}

      <QuickFacts />
      <MessageFormSection block={home.messageForm} page="/" />
    </>
  );
}
