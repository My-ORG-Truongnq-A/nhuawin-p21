import { serializeJsonLd } from "@/lib/seo/jsonld";

/** Một thẻ JSON-LD mỗi trang (dạng @graph). Trang 404 không render component này. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
