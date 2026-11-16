import { RichText } from "@/components/content/RichText";
import { Container } from "@/components/layout/Container";
import { CmsImage } from "@/components/media/CmsImage";
import { ProductGroupCards } from "@/components/product/ProductBlocks";
import { FeatureGrid, MessageFormSection, NavButton, PageHero, ProcessSteps, QuickFacts, SectionHeader } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getAboutPage, getProductGroups, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

const PATH = "/ve-win";

export async function generateMetadata() {
  const p = await getAboutPage();
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

/** /ve-win (T4.4, about): giới thiệu, sứ mệnh, #nang-luc, #nha-may (6 công đoạn + ảnh), thông tin nhanh. */
export default async function AboutPage() {
  const [page, groups, settings] = await Promise.all([getAboutPage(), getProductGroups(), getSiteSettings()]);
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, type: "AboutPage", breadcrumbs: [{ name: "Về WIN", path: PATH }] },
  });
  const pillars = [
    ["Sứ mệnh", page.mission],
    ["Tầm nhìn", page.vision],
    ["Giá trị cốt lõi", page.values.length ? `${page.values.join(" · ")}.` : undefined],
  ].filter((x): x is [string, string] => Boolean(x[1]));

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: "Về WIN" }]} eyebrow="Về WIN" title={page.title} intro={page.intro} image={page.heroImage}>
        <ButtonLink href="#nha-may" size="lg">
          Xem hình ảnh nhà máy
        </ButtonLink>
        <ButtonLink href="/hop-tac" variant="secondary" size="lg">
          Hợp tác cùng WIN
        </ButtonLink>
      </PageHero>

      {page.story && (
        <section id="tong-quan" aria-labelledby="overview-title" className="py-section">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader heading={page.story.heading} id="overview-title" />
              <RichText value={page.story.body} className="mt-6 text-lg" />
            </div>
            {page.story.image && <CmsImage image={page.story.image} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full rounded-card" />}
          </Container>
        </section>
      )}

      {pillars.length > 0 && (
        <section id="su-menh" aria-label="Sứ mệnh và định hướng" className="bg-surface-2 py-section">
          <Container>
            <ul className="grid gap-6 md:grid-cols-3">
              {pillars.map(([k, v]) => (
                <li key={k} data-reveal className="rounded-card border border-line bg-surface p-6">
                  <h2 className="text-xl font-bold">{k}</h2>
                  <p className="mt-2 text-muted">{v}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {page.capability && (
        <section id="nang-luc" aria-labelledby="capability-title" className="py-section">
          <Container>
            <SectionHeader heading={page.capability.heading} id="capability-title" />
            <FeatureGrid items={page.capability.items} />
          </Container>
        </section>
      )}

      {page.factory && (
        <section id="nha-may" aria-labelledby="factory-title" className="bg-surface-2 py-section">
          <Container>
            <SectionHeader heading={page.factory.heading} id="factory-title" />
            <ProcessSteps steps={page.factory.processSteps} />
            {page.factory.gallery.length > 0 && (
              <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
                {page.factory.gallery.map((img) => (
                  <li key={img.url}>
                    <CmsImage image={img} sizes="(min-width: 1024px) 33vw, 50vw" className="aspect-[16/10] w-full rounded-card object-cover" />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <NavButton item={page.factory.visitCta} />
              <ButtonLink href="/hop-tac" variant="secondary" size="lg">
                Chính sách hợp tác
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <section id="san-pham" aria-labelledby="products-title" className="py-section">
        <Container>
          <SectionHeader heading={{ eyebrow: "Sản phẩm của WIN", title: "Tấm Fomex cho từng nhu cầu" }} id="products-title" />
          <ProductGroupCards groups={groups} />
        </Container>
      </section>

      <QuickFacts />
      <MessageFormSection block={page.messageForm} page={PATH} />
    </>
  );
}
