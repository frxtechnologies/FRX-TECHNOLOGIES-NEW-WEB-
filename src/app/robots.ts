import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Everything public is crawlable; the admin panel and API routes are not (they are
 * also behind authentication — this just keeps crawlers from wasting requests there).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
