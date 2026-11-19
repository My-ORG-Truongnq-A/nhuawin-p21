import "server-only";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { indexingAllowed } from "@/lib/indexing";
import { SITE_URL } from "@/lib/site-url";
import { buildMetadata, type MetaInput } from "./metadata";

/** Dùng trong `generateMetadata` của mọi route: thương hiệu + ảnh OG mặc định đọc từ siteSettings. */
export async function pageMetadata(input: MetaInput): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(input, {
    brandName: settings.brandName,
    siteUrl: SITE_URL,
    indexable: indexingAllowed(),
    defaultOgImage: settings.defaultOgImage,
  });
}
