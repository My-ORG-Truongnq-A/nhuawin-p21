"use client";

import Image, { type ImageLoaderProps } from "next/image";
import type { ImageRef } from "@/lib/content/types";

/** Ảnh Sanity: CDN tự đổi cỡ + định dạng (AVIF/WebP) → không tốn bộ tối ưu ảnh của Vercel. */
function sanityLoader({ src, width, quality }: ImageLoaderProps) {
  const u = new URL(src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", String(quality ?? 75));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "max");
  return u.toString();
}

type Props = {
  image: ImageRef;
  sizes: string;
  className?: string;
  /** Ảnh LCP: tải sớm, ưu tiên cao, KHÔNG mờ dần (HN-02). */
  lcp?: boolean;
  fill?: boolean;
};

/** Mọi ảnh nội dung đi qua đây (loader + sizes + alt từ CMS). */
export function CmsImage({ image, sizes, className, lcp = false, fill = false }: Props) {
  const isSanity = image.url.startsWith("https://cdn.sanity.io/");
  const common = {
    src: image.url,
    alt: image.alt,
    sizes,
    className,
    ...(isSanity ? { loader: sanityLoader } : {}),
    ...(lcp ? { preload: true, fetchPriority: "high" as const } : { loading: "lazy" as const }),
  };
  return fill ? <Image {...common} fill /> : <Image {...common} width={image.width} height={image.height} />;
}
