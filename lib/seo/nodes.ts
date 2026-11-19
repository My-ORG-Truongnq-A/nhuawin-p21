/**
 * Node JSON-LD riêng theo template (seo_plan jsonLd.byTemplate) — truyền vào buildGraph({ extra }).
 * Thuần, đọc dữ liệu đã chuẩn hoá; mọi URL tuyệt đối. Khớp 100% nội dung hiển thị (FAQ).
 */
import type { Faq, Post, PostSummary, ProductGroup, RichText } from "@/lib/content/types";
import { absoluteUrl } from "@/lib/site-url";

type Node = Record<string, unknown>;

/** Chữ thuần của Portable Text (FAQ answer, mô tả). */
export function plainText(rt: RichText): string {
  return rt
    .filter((b) => b._type === "block")
    .map((b) => ((b.children as { text?: string }[] | undefined) ?? []).map((c) => c.text ?? "").join(""))
    .join("\n")
    .trim();
}

export function faqNode(faq: Faq | undefined, pageUrl: string): Node[] {
  if (!faq?.items.length) return [];
  return [
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faq.items.map((i) => ({
        "@type": "Question",
        name: i.question,
        acceptedAnswer: { "@type": "Answer", text: plainText(i.answer) },
      })),
    },
  ];
}

/** /san-pham: 4 Product trong ItemList, không có offers (MI-11, OQ-SEO-06). */
export function productListNodes(groups: ProductGroup[], siteUrl: string, brandName: string): Node[] {
  const orgId = `${siteUrl}/#organization`;
  return [
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl("/san-pham", siteUrl)}#danh-sach`,
      itemListElement: groups.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          "@id": `${absoluteUrl("/san-pham", siteUrl)}#${g.slug}`,
          name: `Tấm ${g.title}`,
          description: g.description,
          image: g.image ? absoluteUrl(g.image.url, siteUrl) : undefined,
          url: `${absoluteUrl("/san-pham", siteUrl)}#${g.slug}`,
          brand: { "@type": "Brand", name: brandName },
          manufacturer: { "@id": orgId },
          additionalProperty: [
            g.actualRangeMm && {
              "@type": "PropertyValue",
              name: "Độ dày thực tế",
              minValue: g.actualRangeMm.min,
              maxValue: g.actualRangeMm.max,
              unitCode: "MMT",
            },
            g.specs[0]?.sizeMm && { "@type": "PropertyValue", name: "Khổ tấm", value: g.specs[0].sizeMm },
            g.sheetsPerBundle && { "@type": "PropertyValue", name: "Số tấm mỗi kẹp", value: g.sheetsPerBundle },
          ].filter(Boolean),
        },
      })),
    },
  ];
}

export function blogPostingNode(post: Post, siteUrl: string): Node[] {
  const url = absoluteUrl(`/tin-tuc/${post.slug}`, siteUrl);
  const orgId = `${siteUrl}/#organization`;
  return [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.seoDescription ?? post.excerpt,
      image: post.image ? absoluteUrl(post.image.url, siteUrl) : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      author: { "@id": orgId },
      publisher: { "@id": orgId },
      mainEntityOfPage: { "@id": `${url}#webpage` },
      articleSection: post.category?.title,
      inLanguage: "vi",
    },
  ];
}

/** CollectionPage.mainEntity: các bài đang hiện trên trang. */
export function postListNode(posts: PostSummary[], pageUrl: string, siteUrl: string): Node[] {
  return [
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#danh-sach`,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/tin-tuc/${p.slug}`, siteUrl),
        name: p.title,
      })),
    },
  ];
}
