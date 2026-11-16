/**
 * buildMetadata (T2.1, SEO-04/05): mọi route dùng hàm này — title có thương hiệu, description,
 * canonical tuyệt đối (bỏ query), OG tuyệt đối, robots theo indexing guard. Không xuất hreflang (chỉ "vi").
 * Thuần (không đọc env / CMS) để test; bản dùng trong route ở `lib/seo/page-metadata.ts`.
 */
import type { Metadata } from "next";
import type { ImageRef } from "@/lib/content/types";
import { OG_LOCALE } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export type MetaInput = {
  /** Path canonical; query bị bỏ (vd /bao-gia?loai=… → /bao-gia). */
  path: string;
  title?: string;
  description?: string;
  image?: ImageRef;
  /** Cờ noindex của trang / template (404, trang lọc, bài có cờ). Vẫn follow. */
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export type MetaContext = {
  brandName: string;
  siteUrl: string;
  indexable: boolean;
  defaultOgImage?: ImageRef;
};

export function formatTitle(title: string | undefined, brandName: string): string {
  if (!title) return brandName;
  return title.includes(brandName) ? title : `${title} | ${brandName}`;
}

export function buildMetadata(input: MetaInput, ctx: MetaContext): Metadata {
  const path = input.path.split("?")[0] || "/";
  const canonical = absoluteUrl(path, ctx.siteUrl);
  const title = formatTitle(input.title, ctx.brandName);
  const image = input.image ?? ctx.defaultOgImage;
  const images = image
    ? [{ url: absoluteUrl(image.url, ctx.siteUrl), width: image.width, height: image.height, alt: image.alt }]
    : undefined;

  const robots = !ctx.indexable
    ? { index: false, follow: false }
    : input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true };

  return {
    title: { absolute: title },
    description: input.description,
    alternates: { canonical },
    robots,
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      siteName: ctx.brandName,
      locale: OG_LOCALE,
      title,
      description: input.description,
      images,
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description: input.description, images: images?.map((i) => i.url) },
  };
}
