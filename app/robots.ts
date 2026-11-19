import type { MetadataRoute } from "next";
import { indexingAllowed } from "@/lib/indexing";
import { buildRobots } from "@/lib/seo/robots";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ indexable: indexingAllowed(), siteUrl: SITE_URL });
}
