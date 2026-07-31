import { socialLinks } from "@/lib/constants/social";
import { tournamentVenue } from "@/lib/constants/matches";
import {
  EVENT_START_DATE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

/**
 * schema.org nodes describing the tournament to search engines.
 *
 * These are what let Google show the event, the site name and the breadcrumb
 * trail as something richer than a blue link. Rendered through
 * `<JsonLd>` in the layout and the pages that need them.
 *
 * Every node carries an `@id` so the graph can cross-reference instead of
 * repeating itself, and so two pages describing the same organization are
 * understood as one entity rather than two.
 */
type SchemaNode = Record<string, unknown>;

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");
const EVENT_ID = absoluteUrl("/#event");

/** Placeholder hrefs (`#`) are not profiles — only real URLs belong in `sameAs`. */
const socialProfiles = socialLinks
  .map((link) => link.href)
  .filter((href) => href.startsWith("http"));

export const organizationSchema: SchemaNode = {
  "@type": "SportsOrganization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: "UGM CUP",
  url: SITE_URL,
  logo: absoluteUrl("/images/global/logo.png"),
  sport: "Badminton",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Universitas Gadjah Mada",
    url: "https://ugm.ac.id",
  },
  sameAs: socialProfiles,
};

export const websiteSchema: SchemaNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "id-ID",
  publisher: { "@id": ORGANIZATION_ID },
};

export const eventSchema: SchemaNode = {
  "@type": "SportsEvent",
  "@id": EVENT_ID,
  name: `${SITE_NAME} — Rallyverse`,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  startDate: EVENT_START_DATE,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  sport: "Badminton",
  image: [absoluteUrl("/images/global/logo.png")],
  location: {
    "@type": "Place",
    name: `${tournamentVenue.name} ${tournamentVenue.org}`,
    hasMap: tournamentVenue.mapsUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yogyakarta",
      addressRegion: "Daerah Istimewa Yogyakarta",
      addressCountry: "ID",
    },
  },
  organizer: { "@id": ORGANIZATION_ID },
};

/**
 * Trail shown under the result in search. Positions are 1-based and the last
 * crumb is the current page, so callers pass the path from home downwards.
 */
export function breadcrumbSchema(
  trail: ReadonlyArray<{ name: string; path: string }>
): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Wraps nodes into a single `@graph` document so one script tag carries them all. */
export function schemaGraph(...nodes: SchemaNode[]): SchemaNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
