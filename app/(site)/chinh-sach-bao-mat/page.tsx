import { notFound } from "next/navigation";
import { RichText } from "@/components/content/RichText";
import { Container } from "@/components/layout/Container";
import { dateVi, PageHero } from "@/components/sections/blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPrivacyPage, getSiteSettings } from "@/lib/content";
import { buildGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

const PATH = "/chinh-sach-bao-mat";

export async function generateMetadata() {
  const p = await getPrivacyPage();
  if (!p) return pageMetadata({ path: PATH, noindex: true });
  return pageMetadata({ path: PATH, title: p.seo.title ?? p.title, description: p.seo.description, image: p.seo.ogImage, noindex: p.seo.noindex });
}

/** /chinh-sach-bao-mat (T4.9, legal): chưa publish → 404 (REQ-21, MI-15); pháp nhân đọc từ siteSettings. */
export default async function PrivacyPage() {
  const [page, s] = await Promise.all([getPrivacyPage(), getSiteSettings()]);
  if (!page) notFound();
  const graph = buildGraph({
    settings: s,
    siteUrl: SITE_URL,
    page: { path: PATH, name: page.title, description: page.seo.description, breadcrumbs: [{ name: page.title, path: PATH }] },
  });
  const legal = [
    ["Đơn vị", s.legalName ?? s.brandName],
    ["Mã số thuế", s.taxId],
    ["Địa chỉ đăng ký", s.registeredAddress],
    ["Email", s.email],
  ].filter((x): x is [string, string] => Boolean(x[1]));

  return (
    <>
      <JsonLd data={graph} />
      <PageHero crumbs={[{ name: page.title }]} title={page.title} intro={`Cập nhật ${dateVi(page.updatedAt)}`} />
      <Container className="max-w-3xl py-section">
        <dl className="grid gap-x-6 gap-y-2 rounded-card border border-line bg-surface-2 p-6 text-sm sm:grid-cols-[10rem_1fr]">
          {legal.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-bold text-ink">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <RichText value={page.body} className="mt-10" />
      </Container>
    </>
  );
}
