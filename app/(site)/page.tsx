import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getHomePage, getSiteSettings } from "@/lib/content";
import { resolveLink } from "@/lib/nav/resolve-link";
import { buildGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata() {
  const home = await getHomePage();
  return pageMetadata({
    path: "/",
    title: home.seo.title,
    description: home.seo.description,
    image: home.seo.ogImage,
    noindex: home.seo.noindex,
  });
}

/**
 * Trang chủ — KHUNG: mới có hero. Các khối còn lại dựng ở T4.1 theo phương án được duyệt ở G2 (MI-23).
 * Hero là phần tử LCP: hiển thị ngay từ HTML, không reveal / fade (HN-02).
 */
export default async function HomePage() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
  const { hero } = home;
  const cta = hero.cta ? resolveLink(hero.cta.link) : null;
  const graph = buildGraph({
    settings,
    siteUrl: SITE_URL,
    page: { path: "/", name: home.seo.title ?? settings.brandName, description: home.seo.description },
  });

  return (
    <>
      <JsonLd data={graph} />
      <section aria-labelledby="hero-title" className="bg-ink-950 py-section">
        <Container className="max-w-site">
          {hero.eyebrow && (
            <p className="mb-4 text-xs font-bold uppercase tracking-label text-cyan-200">{hero.eyebrow}</p>
          )}
          <h1 id="hero-title" className="max-w-[18ch] text-4xl font-extrabold text-surface">
            {hero.titleLines.map((line, i) => (
              <span key={line} className={`block ${i > 0 ? "text-cyan-200" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          {hero.lead && <p className="mt-6 max-w-prose text-lg text-surface/85">{hero.lead}</p>}
          {hero.cta && cta && (
            <div className="mt-8">
              <ButtonLink href={cta.href} size="lg">
                {hero.cta.label}
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
