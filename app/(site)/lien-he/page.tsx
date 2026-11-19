import { ContactList } from "@/components/contact/ContactList";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { Container } from "@/components/layout/Container";
import { MessageFormSection, PageHero, QuickFacts } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getContactPage, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

const PATH = "/lien-he";

export async function generateMetadata() {
  const p = await getContactPage();
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

/** /lien-he (T4.8, contact): NAP chỉ từ siteSettings (REQ-03), bản đồ, thông tin nhanh, form #lien-he. */
export default async function ContactPage() {
  const [page, settings] = await Promise.all([getContactPage(), getSiteSettings()]);
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, type: "ContactPage", breadcrumbs: [{ name: "Liên hệ", path: PATH }] },
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: "Liên hệ" }]} eyebrow="Liên hệ" title={page.title} intro={page.intro} />

      <section aria-labelledby="factory-title" className="py-section">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="factory-title" className="text-2xl font-extrabold">
              Nhà máy WIN
            </h2>
            <div className="mt-6">
              <ContactList settings={settings} />
            </div>
            <div className="mt-8 rounded-card border border-line bg-surface-2 p-6">
              <h3 className="text-lg font-bold">Đặt lịch tham quan nhà máy</h3>
              <p className="mt-2 text-muted">Chọn “Tham quan nhà máy” trong form, WIN sẽ xác nhận lịch qua điện thoại.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href="/ve-win#nha-may" variant="secondary">
                  Xem hình ảnh nhà máy
                </ButtonLink>
                <ButtonLink href="/bao-gia">Chọn quy cách tại trang Nhận báo giá</ButtonLink>
              </div>
            </div>
          </div>
          {page.showMap && <MapEmbed address={settings.address} title={`Bản đồ ${settings.brandName}`} />}
        </Container>
      </section>

      <QuickFacts />
      <MessageFormSection block={page.messageForm} page={PATH} />
    </>
  );
}
