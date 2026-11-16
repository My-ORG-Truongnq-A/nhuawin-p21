import { RichText } from "@/components/content/RichText";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/layout/Container";
import { CmsImage } from "@/components/media/CmsImage";
import { FaqSection, FeatureGrid, NavButton, PageHero, SectionHeader, StepList } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLeadForms, getPartnershipPage, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { faqNode } from "@/lib/seo/nodes";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";

const PATH = "/hop-tac";

export async function generateMetadata() {
  const p = await getPartnershipPage();
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

/**
 * /hop-tac (T4.5, partnership) — PA1: khối "Hợp tác cùng phát triển" nền tối (3 nhóm, 4 lợi ích, ảnh xe nâng),
 * 4 bước + nút Đăng ký hợp tác → #dang-ky, #doi-tuong, FAQ, form. Không có câu chữ chiết khấu / MOQ (MI-11).
 */
export default async function PartnershipPage() {
  const [page, forms, settings] = await Promise.all([getPartnershipPage(), getLeadForms(), getSiteSettings()]);
  const g = page.growTogether;
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, breadcrumbs: [{ name: "Hợp tác", path: PATH }] },
    extra: faqNode(page.faq, absoluteUrl(PATH, SITE_URL)),
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: "Hợp tác" }]} eyebrow="Hợp tác" title={page.title} intro={page.intro} image={page.heroImage}>
        <NavButton item={page.registerCta} />
      </PageHero>

      {g && (
        <section id="dong-hanh" aria-labelledby="cooperation-title" className="bg-ink-950 py-section text-surface">
          <Container className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader heading={{ eyebrow: g.eyebrow, title: g.title, intro: g.intro }} id="cooperation-title" dark />
              {page.partnerGroups && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {page.partnerGroups.items.map((x) => (
                    <li key={x.title} className="rounded-pill border border-surface/30 px-4 py-1.5 text-sm font-semibold">
                      {x.title}
                    </li>
                  ))}
                </ul>
              )}
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {g.benefits.map((b) => (
                  <li key={b.title} data-reveal className="rounded-card border border-surface/20 bg-surface/5 p-5">
                    <h3 className="text-lg font-bold text-surface">{b.title}</h3>
                    {b.text && <p className="mt-1 text-sm text-surface/80">{b.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
            {g.logisticsImage && <CmsImage image={g.logisticsImage} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full rounded-card" />}
          </Container>
          {page.processSteps.length > 0 && (
            <Container>
              <StepList steps={page.processSteps} dark />
              <div className="mt-8">
                <NavButton item={page.registerCta} />
              </div>
            </Container>
          )}
        </section>
      )}

      {page.partnerGroups && (
        <section id="doi-tuong" aria-labelledby="audiences-title" className="py-section">
          <Container>
            <SectionHeader heading={page.partnerGroups.heading} id="audiences-title" />
            <FeatureGrid items={page.partnerGroups.items} />
          </Container>
        </section>
      )}

      <FaqSection faq={page.faq} />

      <section id="dang-ky" aria-labelledby="register-title" className="py-section">
        <Container className="max-w-3xl">
          <h2 id="register-title" className="text-3xl font-extrabold">
            {forms.partnership.heading ?? "Đăng ký hợp tác"}
          </h2>
          {forms.partnership.intro && <p className="mt-3 text-muted">{forms.partnership.intro}</p>}
          <div className="mt-8">
            <LeadForm
              kind="partnership"
              page={PATH}
              submitLabel={forms.partnership.submitLabel}
              roleOptions={forms.contact.roleOptions}
              privacyNote={forms.privacyNote ? <RichText value={forms.privacyNote} /> : undefined}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
