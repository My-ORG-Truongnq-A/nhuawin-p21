/**
 * GROQ cho cửa nội dung. Projection chiếu schema Sanity (content_model) về ĐÚNG hình dạng kiểu chung
 * (`lib/content/types.ts`) — `normalize.ts` chỉ làm sạch, seed và Sanity cùng một hình dạng.
 * Chỉ đọc bản đã publish (client đặt perspective "published", CDN). Test chạy bằng groq-js trên dữ liệu cục bộ.
 */
import { groqPathOf } from "@/lib/content/doc-paths";
import type { ContentKey } from "@/lib/content/types";

const SETTINGS = `*[_id == "siteSettings"][0]`;

/** Ảnh `figure` → ImageRef. */
const IMAGE = `{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt }`;

/**
 * Object `link` → CmsLink. `p` là tiền tố tới object (vd "link."), rỗng khi đang ở trong chính object.
 * Gọi / Zalo / Facebook lấy từ Thông tin doanh nghiệp (không gõ lại số / URL trong link).
 */
const linkOf = (p = "") => `select(
  ${p}kind == "internal" => { "kind": "internal", "path": ${groqPathOf(`${p}internal`)}, "anchor": ${p}anchor },
  ${p}kind == "external" => { "kind": "external", "url": ${p}external },
  ${p}kind == "phone" => { "kind": "external", "url": "tel:" + ${SETTINGS}.phones[isPrimary == true][0].e164 },
  ${p}kind == "zalo" => { "kind": "external", "url": ${SETTINGS}.socialLinks[platform == "zalo"][0].url },
  ${p}kind == "facebook" => { "kind": "external", "url": ${SETTINGS}.socialLinks[platform == "facebook"][0].url }
)`;

/** Một object `link` → NavItem (không có menu con). */
const LINK_ITEM = `{ "label": label, "link": ${linkOf()}, "children": [] }`;

/** Mục menu header `{ link, children[] }` → NavItem. */
const NAV_ITEM = `{ "label": link.label, "link": ${linkOf("link.")}, "children": children[]${LINK_ITEM} }`;

const SEO = `{ title, description, noindex, "ogImage": ogImage${IMAGE} }`;

export const QUERIES: Record<ContentKey, string> = {
  siteSettings: `${SETTINGS}{
    "brandName": siteName, legalName,
    "slogan": tagline,
    "description": seoDefaults.defaultDescription,
    "schemaType": "LocalBusiness",
    "logo": logoFull${IMAGE}, "logoHeader": logoHeader${IMAGE},
    "defaultOgImage": seoDefaults.defaultOgImage${IMAGE},
    "titleTemplate": seoDefaults.titleTemplate,
    "address": address{
      display,
      "street": array::join([streetAddress, ward][defined(@)], ", "),
      "locality": city, "region": city, postalCode, country,
      "mapUrl": ^.googleMapsUrl, "embedUrl": ^.mapEmbedUrl,
      "geo": select(defined(^.geo) => { "lat": ^.geo.lat, "lng": ^.geo.lng })
    },
    "phones": phones | order(isPrimary desc) [] { "number": display, e164, label },
    email,
    "zalo": socialLinks[platform == "zalo"][0]{ url, label },
    "socials": socialLinks[platform != "zalo"]{ platform, url, label, confirmed },
    openingHours[]{ days, opens, closes },
    hoursNote, floatingContact, gtmId,
    "taxId": legal.taxId, "foundingYear": legal.foundedYear, areaServed
  }`,
  header: `*[_id == "header"][0]{ "items": items[]${NAV_ITEM}, "cta": cta${LINK_ITEM} }`,
  footer: `*[_id == "footer"][0]{
    intro, showContact, copyright,
    "columns": columns[]{ title, "items": links[]${LINK_ITEM} },
    "legalLinks": legalLinks[]${LINK_ITEM}
  }`,
  homePage: `*[_id == "homePage"][0]{
    "seo": seo${SEO},
    "hero": hero{
      "titleLines": headlineLines, "lead": subheadline,
      "cta": primaryCta${LINK_ITEM}, "secondaryCta": secondaryCta${LINK_ITEM},
      "image": image${IMAGE}
    }
  }`,
  notFoundPage: `*[_id == "notFoundPage"][0]{ title, "body": text, "links": links[]${LINK_ITEM} }`,
  posts: `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    "slug": slug.current, title, excerpt, publishedAt,
    "updatedAt": coalesce(updatedAt, _updatedAt),
    "image": mainImage${IMAGE},
    "category": category->{ "slug": slug.current, title },
    "noindex": seo.noindex
  }`,
  productGroups: `*[_type == "productGroup" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, nominalLabel, actualRangeMm, sheetsPerBundle, description,
    "image": image${IMAGE}, specs[]{ label, nominal, grade, actualThicknessMm, sizeMm, sheetsPerBundle, note },
    quoteCtaLabel
  }`,
  applications: `*[_type == "application" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, thicknessHint,
    "recommendedGroups": recommendedGroups[]->slug.current,
    summary, "cardImage": cardImage${IMAGE}, "album": album[]${IMAGE}
  }`,
  categories: `*[_type == "category" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, description
  }`,
};
