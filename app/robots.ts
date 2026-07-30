import type { MetadataRoute } from "next";
import { PRIVATE_ROUTES, absoluteUrl } from "@/lib/seo";

/**
 * Served at `/robots.txt`.
 *
 * Everything public is open; the dashboards and the login wall are closed off.
 * Those pages are already behind an auth check, but a crawler that follows a
 * link to them gets a redirect to `/login` and would otherwise spend crawl
 * budget on it — and an indexed `/login` is a result nobody wants to click.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Bare paths, no trailing slash — `Disallow` is a prefix match, so
      // `/admin` covers `/admin` itself and everything under it.
      disallow: [...PRIVATE_ROUTES],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
