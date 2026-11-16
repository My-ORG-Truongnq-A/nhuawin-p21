/**
 * GROQ cho cửa nội dung. Projection trả đúng hình dạng thô mà `lib/content/normalize.ts` đọc.
 * Chỉ đọc bản đã publish (client đặt perspective "published").
 */
import type { ContentKey } from "@/lib/content/types";

const IMAGE = `{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt }`;
const LINK = `link{ kind, path, anchor, url }`;
const NAV_ITEM = `{ label, ${LINK}, children[]{ label, ${LINK} } }`;

export const QUERIES: Record<ContentKey, string> = {
  siteSettings: `*[_type == "siteSettings"][0]{
    brandName, legalName, slogan, description, schemaType,
    "logo": logo${IMAGE}, "defaultOgImage": defaultOgImage${IMAGE},
    address{ street, locality, region, postalCode, country, mapUrl, "geo": { "lat": geo.lat, "lng": geo.lng } },
    phones[]{ number, label }, email, zalo{ url, label },
    socials[]{ platform, label, url, confirmed },
    openingHours[]{ label, days, opens, closes },
    taxId, foundingYear, areaServed
  }`,
  header: `*[_type == "header"][0]{ items[]${NAV_ITEM}, "cta": cta${NAV_ITEM} }`,
  footer: `*[_type == "footer"][0]{ columns[]{ title, items[]${NAV_ITEM} }, "privacyLink": privacyLink${NAV_ITEM} }`,
  homePage: `*[_type == "homePage"][0]{
    seo{ title, description, noindex, "ogImage": ogImage${IMAGE} },
    hero{ eyebrow, titleLines, lead, "cta": cta${NAV_ITEM}, "image": image${IMAGE} }
  }`,
  notFoundPage: `*[_type == "notFoundPage"][0]{ title, body, links[]${NAV_ITEM} }`,
  posts: `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    "slug": slug.current, title, excerpt, publishedAt,
    "updatedAt": coalesce(updatedAt, _updatedAt),
    "image": mainImage${IMAGE}, "noindex": seo.noindex
  }`,
};
