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

/**
 * Portable Text: link nội bộ (reference) → "href" dựng sẵn từ bảng doc-paths; figure → ImageRef + caption.
 */
const RICH = `[]{
  ...,
  _type == "block" => { "markDefs": markDefs[]{
    ...,
    _type == "link" => { "href": select(kind == "internal" => ${groqPathOf("internal")}, href) }
  } },
  _type == "figure" => { "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt, caption },
  _type == "faq" => { "items": items[]{ question, "answer": answer[]{ ..., "markDefs": markDefs[]{ ..., _type == "link" => { "href": select(kind == "internal" => ${groqPathOf("internal")}, href) } } } } }
}`;

const FEATURE = `{ title, text, icon, verification, "image": image${IMAGE} }`;
const FAQ = `{ title, "items": items[]{ question, "answer": answer${RICH} } }`;
const STEP = `{ title, text, "image": image${IMAGE} }`;
const HEADED = `{ heading, "items": items[]${FEATURE} }`;
const PAGE = `"seo": seo${SEO}, title, intro`;

const POST_FIELDS = `"slug": slug.current, title, excerpt, publishedAt,
    "updatedAt": coalesce(updatedAt, _updatedAt),
    "image": mainImage${IMAGE},
    "category": category->{ "slug": slug.current, title },
    "noindex": seo.noindex`;

/** Một bài theo slug (tham số $slug) cho /tin-tuc/[slug]. */
export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
    ${POST_FIELDS},
    "seoTitle": seo.title, "seoDescription": seo.description, "ogImage": seo.ogImage${IMAGE},
    "body": body${RICH},
    "relatedSlugs": relatedPosts[]->slug.current
  }`;

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
    "taxId": legal.taxId, "foundingYear": legal.foundedYear, "registeredAddress": legal.registeredAddress,
    areaServed, quickFacts
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
      eyebrow, "titleLines": headlineLines, "lead": subheadline,
      "cta": primaryCta${LINK_ITEM}, "secondaryCta": secondaryCta${LINK_ITEM},
      "image": image${IMAGE}
    },
    "capability": capability${HEADED},
    productGroupsSection, applicationsSection,
    "partnerSection": partnerSection{ heading, "cta": cta${LINK_ITEM} },
    "latestPosts": latestPosts{ heading, count },
    messageForm
  }`,
  productsPage: `*[_id == "productsPage"][0]{
    ${PAGE}, "heroImage": heroImage${IMAGE},
    groupsSection, specTableSection, applicationsSection,
    "whyChoose": whyChoose${HEADED},
    "chooseByUse": { "heading": chooseByUseSection, "rows": chooseByUseRows },
    "faq": faq${FAQ}, messageForm
  }`,
  quotePage: `*[_id == "quotePage"][0]{ ${PAGE}, "benefits": benefits[]${FEATURE}, "faq": faq${FAQ} }`,
  aboutPage: `*[_id == "aboutPage"][0]{
    ${PAGE}, "heroImage": heroImage${IMAGE},
    "story": { "heading": storyHeading, "body": story${RICH}, "image": storyImage${IMAGE} },
    mission, vision, values,
    "capability": capability${HEADED},
    "factory": factory{ heading, "processSteps": processSteps[]${STEP}, "gallery": gallery[]${IMAGE}, "visitCta": visitCta${LINK_ITEM} },
    messageForm
  }`,
  partnershipPage: `*[_id == "partnershipPage"][0]{
    ${PAGE}, "heroImage": heroImage${IMAGE},
    "partnerGroups": partnerGroups${HEADED},
    "growTogether": growTogether{ eyebrow, title, intro, "benefits": benefits[]${FEATURE}, "logisticsImage": logisticsImage${IMAGE} },
    "processSteps": processSteps[]${STEP},
    "registerCta": registerCta${LINK_ITEM},
    "faq": faq${FAQ}
  }`,
  newsPage: `*[_id == "newsPage"][0]{ ${PAGE}, postsPerPage, emptyText, "articleCta": articleCta{ heading, text, "cta": cta${LINK_ITEM} } }`,
  contactPage: `*[_id == "contactPage"][0]{ ${PAGE}, showMap, messageForm }`,
  privacyPage: `*[_id == "privacyPage"][0]{ "seo": seo${SEO}, title, "body": body${RICH}, updatedAt }`,
  leadForms: `*[_id == "leadForms"][0]{
    messageFormDefault, contact, quote, partnership, successMessage, errorMessage,
    "privacyNote": privacyNote${RICH}
  }`,
  notFoundPage: `*[_id == "notFoundPage"][0]{ title, "body": text, "links": links[]${LINK_ITEM} }`,
  posts: `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){ ${POST_FIELDS} }`,
  productGroups: `*[_type == "productGroup" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, nominalLabel, actualRangeMm, sheetsPerBundle, description, badge,
    "image": image${IMAGE}, specs[]{ label, nominal, grade, actualThicknessMm, sizeMm, sheetsPerBundle, note },
    quoteCtaLabel
  }`,
  applications: `*[_type == "application" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, thicknessHint,
    "recommendedGroups": recommendedGroups[]->slug.current,
    summary, "cardImage": cardImage${IMAGE},
    "album": album[]{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt, caption }
  }`,
  categories: `*[_type == "category" && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, order, description
  }`,
};
