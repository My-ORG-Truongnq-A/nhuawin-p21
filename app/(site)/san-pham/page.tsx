import { Container } from "@/components/layout/Container";
import { ApplicationItem, ProductGroupItem, SpecTable } from "@/components/product/ProductBlocks";
import { FaqSection, FeatureGrid, MessageFormSection, PageHero, SectionHeader } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getApplications, getProductGroups, getProductsPage, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { faqNode, productListNodes } from "@/lib/seo/nodes";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";

const PATH = "/san-pham";

export async function generateMetadata() {
  const p = await getProductsPage();
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

/**
 * /san-pham (T4.2, product_catalog) — PA2 "Bảng quy cách": 4 nhóm (#fomex-*), #bang-quy-cach
 * (bảng ≥ 768 px / thẻ < 768 px, HTML server), #ung-dung + 7 #ung-dung-* có album, FAQ.
 */
export default async function ProductsPage() {
  const [page, groups, apps, settings] = await Promise.all([getProductsPage(), getProductGroups(), getApplications(), getSiteSettings()]);
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, breadcrumbs: [{ name: "Sản phẩm", path: PATH }] },
    extra: [...productListNodes(groups, SITE_URL, settings.brandName), ...faqNode(page.faq, absoluteUrl(PATH, SITE_URL))],
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: "Sản phẩm" }]} eyebrow="Sản phẩm" title={page.title} intro={page.intro} image={page.heroImage}>
        <ButtonLink href="/bao-gia" size="lg">
          Nhận báo giá
        </ButtonLink>
        <ButtonLink href="#bang-quy-cach" variant="secondary" size="lg">
          Xem bảng quy cách
        </ButtonLink>
      </PageHero>

      <section aria-labelledby="list-title" className="py-section">
        <Container>
          <SectionHeader heading={page.groupsSection ?? { title: "Chọn theo độ dày" }} id="list-title" />
          <ul className="mt-10 grid gap-6">
            {groups.map((g) => (
              <ProductGroupItem key={g.slug} g={g} />
            ))}
          </ul>
        </Container>
      </section>

      <section id="bang-quy-cach" aria-labelledby="spec-title" className="bg-surface-2 py-section">
        <Container>
          <SectionHeader heading={page.specTableSection?.heading ?? { title: "Bảng quy cách" }} id="spec-title" />
          <SpecTable groups={groups} footnote={page.specTableSection?.footnote} />
        </Container>
      </section>

      <section id="ung-dung" aria-labelledby="applications-title" className="py-section">
        <Container>
          <SectionHeader heading={page.applicationsSection} id="applications-title" />
          <nav aria-label="Ứng dụng" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {apps.map((a) => (
                <li key={a.slug}>
                  <a href={`#ung-dung-${a.slug}`} className="inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-sm font-semibold text-ink hover:border-brand">
                    {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="mt-8 grid gap-4 lg:grid-cols-2">
            {apps.map((a) => (
              <ApplicationItem key={a.slug} a={a} />
            ))}
          </ul>
        </Container>
      </section>

      {page.whyChoose && (
        <section aria-labelledby="properties-title" className="bg-surface-2 py-section">
          <Container>
            <SectionHeader heading={page.whyChoose.heading} id="properties-title" />
            <FeatureGrid items={page.whyChoose.items} numbered />
          </Container>
        </section>
      )}

      {page.chooseByUse && (
        <section aria-labelledby="guide-title" className="py-section">
          <Container>
            <SectionHeader heading={page.chooseByUse.heading} id="guide-title" />
            <div className="mt-8 overflow-x-auto rounded-card border border-line">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead className="bg-surface-3">
                  <tr>
                    {["Hạng mục", "Độ dày gợi ý", "Ghi chú"].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-semibold text-ink">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.chooseByUse.rows.map((r) => (
                    <tr key={r.use} className="border-t border-line">
                      <th scope="row" className="px-4 py-2.5 font-semibold text-ink">
                        {r.use}
                      </th>
                      <td className="px-4 py-2.5 font-spec font-semibold">{r.thickness}</td>
                      <td className="px-4 py-2.5 text-muted">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      <FaqSection faq={page.faq} />
      <MessageFormSection block={page.messageForm} page={PATH} />
    </>
  );
}
