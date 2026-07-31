import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo";

/**
 * Served at `/sitemap.xml`, built from the public route list in `@/lib/seo`.
 *
 * Only pages whose content is in the server-rendered HTML are listed. Match
 * detail pages (`/pertandingan/[id]`) are deliberately absent: their body is
 * filled in on the client from the live-score API, so a crawler would find an
 * empty shell — those routes are marked `noindex` at the page instead.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
