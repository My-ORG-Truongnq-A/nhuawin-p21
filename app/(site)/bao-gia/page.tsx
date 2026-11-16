import { Suspense } from "react";
import { RichText } from "@/components/content/RichText";
import { LeadForm, type ProductOption } from "@/components/forms/LeadForm";
import { Container } from "@/components/layout/Container";
import { rangeLabel } from "@/components/product/ProductBlocks";
import { FaqSection, PageHero } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/contact/links";
import { getLeadForms, getProductGroups, getQuotePage, getSiteSettings } from "@/lib/content";
import { parseLoai } from "@/lib/quote/parse-loai";
import { buildGraph } from "@/lib/seo/jsonld";
import { faqNode } from "@/lib/seo/nodes";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";

const PATH = "/bao-gia";

/** Canonical mọi biến thể ?loai= = /bao-gia (REQ-19) — metadata không đọc searchParams. */
export async function generateMetadata() {
  const p = await getQuotePage();
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

async function QuoteForm({ searchParams, products }: { searchParams: PageProps<"/bao-gia">["searchParams"]; products: ProductOption[] }) {
  const [sp, forms] = await Promise.all([searchParams, getLeadForms()]);
  const loai = parseLoai(sp.loai, products.map((p) => p.slug));
  return (
    <LeadForm
      kind="quote"
      page={PATH}
      products={products}
      defaultProduct={loai}
      submitLabel={forms.quote.submitLabel}
      roleOptions={forms.contact.roleOptions}
      notePlaceholder={forms.quote.notePlaceholder}
      privacyNote={forms.privacyNote ? <RichText value={forms.privacyNote} /> : undefined}
    />
  );
}

/** /bao-gia (T4.3, quote_form): form chọn sẵn loại tấm theo ?loai={slug productGroup} — #chon-quy-cach. */
export default async function QuotePage({ searchParams }: PageProps<"/bao-gia">) {
  const [page, groups, settings, forms] = await Promise.all([getQuotePage(), getProductGroups(), getSiteSettings(), getLeadForms()]);
  const products: ProductOption[] = groups.map((g) => ({ slug: g.slug, title: g.title, hint: [rangeLabel(g), g.sheetsPerBundle].filter(Boolean).join(" · ") }));
  const primary = settings.phones[0];
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, breadcrumbs: [{ name: "Nhận báo giá", path: PATH }] },
    extra: faqNode(page.faq, absoluteUrl(PATH, SITE_URL)),
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: "Nhận báo giá" }]} eyebrow="Nhận báo giá" title={page.title} intro={page.intro}>
        {settings.zalo && (
          <ButtonLink href={settings.zalo.url} target="_blank" rel="noopener" size="lg">
            Nhắn Zalo nhận giá
          </ButtonLink>
        )}
        {primary && (
          <ButtonLink href={telHref(primary.e164 ?? primary.number)} variant="hot" size="lg">
            Gọi {primary.number}
          </ButtonLink>
        )}
      </PageHero>

      <section aria-labelledby="quote-title" className="py-section">
        <Container className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 id="quote-title" className="text-2xl font-extrabold">
              {forms.quote.heading ?? "Thông tin nhận báo giá"}
            </h2>
            <p className="mt-2 text-muted">Chưa chắc độ dày? Bỏ trống và ghi hạng mục thi công ở phần ghi chú — WIN tư vấn giúp.</p>
            <div className="mt-8">
              {/* ?loai= là dữ liệu theo request → form stream sau vỏ tĩnh. */}
              <Suspense fallback={<div id="chon-quy-cach" className="min-h-96" aria-busy="true" />}>
                <QuoteForm searchParams={searchParams} products={products} />
              </Suspense>
            </div>
          </div>
          <aside className="h-fit rounded-card border border-line bg-surface-2 p-6">
            <p className="text-xs font-bold uppercase tracking-label text-brand-ink">Bạn nhận được</p>
            <ul className="mt-4 grid gap-4">
              {page.benefits.map((b) => (
                <li key={b.title}>
                  <h3 className="text-base font-bold">{b.title}</h3>
                  {b.text && <p className="text-sm text-muted">{b.text}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <ButtonLink href="/san-pham#bang-quy-cach" variant="secondary">
                Bảng quy cách đầy đủ
              </ButtonLink>
              <ButtonLink href="/hop-tac" variant="secondary">
                Chính sách đại lý
              </ButtonLink>
            </div>
          </aside>
        </Container>
      </section>

      <FaqSection faq={page.faq} />
    </>
  );
}
