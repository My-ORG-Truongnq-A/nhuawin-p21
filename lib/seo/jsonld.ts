/**
 * JSON-LD dạng @graph nối bằng @id (T2.5, GEO-02/03). NAP đọc từ siteSettings — không hard-code.
 * Trường chưa có dữ kiện bị bỏ (không chuỗi rỗng); sameAs chỉ gồm mạng xã hội đã xác nhận.
 * Node riêng của template (Product, FAQPage, Article…) truyền qua `extra` ở P4.
 */
import type { SiteSettings } from "@/lib/content/types";
import { toE164 } from "@/lib/contact/links";
import { HTML_LANG } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

type Node = Record<string, unknown>;

export type GraphInput = {
  settings: SiteSettings;
  siteUrl: string;
  page: {
    path: string;
    name: string;
    description?: string;
    type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
    breadcrumbs?: { name: string; path: string }[];
  };
  extra?: Node[];
};

/** Bỏ key undefined / chuỗi rỗng / mảng rỗng / object rỗng (đệ quy). */
function clean<T>(value: T): T | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) {
    const arr = value.map(clean).filter((v) => v !== undefined);
    return (arr.length ? arr : undefined) as T | undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Node)
      .map(([k, v]) => [k, clean(v)] as const)
      .filter(([, v]) => v !== undefined);
    const typedOnly = entries.length === 1 && entries[0][0] === "@type";
    return (entries.length && !typedOnly ? Object.fromEntries(entries) : undefined) as T | undefined;
  }
  return value;
}

function organization(s: SiteSettings, siteUrl: string): Node {
  const id = `${siteUrl}/#organization`;
  const phones = s.phones.map((p) => p.e164 ?? toE164(p.number)).filter((p): p is string => !!p);
  const a = s.address;
  return {
    "@type": s.schemaType,
    "@id": id,
    name: s.brandName,
    legalName: s.legalName,
    alternateName: s.legalName ? s.brandName : undefined,
    description: s.description,
    slogan: s.slogan,
    url: siteUrl,
    logo: s.logo ? { "@type": "ImageObject", url: absoluteUrl(s.logo.url, siteUrl), width: s.logo.width, height: s.logo.height } : undefined,
    image: s.logo ? absoluteUrl(s.logo.url, siteUrl) : undefined,
    email: s.email,
    telephone: phones[0],
    taxID: s.taxId,
    foundingDate: s.foundingYear ? String(s.foundingYear) : undefined,
    address: a
      ? {
          "@type": "PostalAddress",
          streetAddress: a.street,
          addressLocality: a.locality,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        }
      : undefined,
    geo: a?.geo ? { "@type": "GeoCoordinates", latitude: a.geo.lat, longitude: a.geo.lng } : undefined,
    hasMap: a?.mapUrl,
    openingHoursSpecification: s.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: s.areaServed ? { "@type": "Country", name: s.areaServed } : undefined,
    contactPoint: phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "sales",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    })),
    sameAs: s.socials.filter((x) => x.confirmed).map((x) => x.url),
  };
}

export function buildGraph({ settings, siteUrl, page, extra = [] }: GraphInput) {
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const pageUrl = absoluteUrl(page.path, siteUrl);
  const crumbs = page.breadcrumbs?.length ? [{ name: "Trang chủ", path: "/" }, ...page.breadcrumbs] : [];
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  const graph: Node[] = [
    organization(settings, siteUrl),
    { "@type": "WebSite", "@id": websiteId, url: siteUrl, name: settings.brandName, inLanguage: HTML_LANG, publisher: { "@id": orgId } },
    {
      "@type": page.type ?? "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.name,
      description: page.description,
      inLanguage: HTML_LANG,
      isPartOf: { "@id": websiteId },
      about: { "@id": orgId },
      breadcrumb: crumbs.length ? { "@id": breadcrumbId } : undefined,
    },
  ];
  if (crumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absoluteUrl(c.path, siteUrl),
      })),
    });
  }
  graph.push(...extra);

  return { "@context": "https://schema.org", "@graph": graph.map((n) => clean(n)).filter(Boolean) };
}

/** JSON an toàn để nhúng trong <script>: escape '<' (chặn "</script>"). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
