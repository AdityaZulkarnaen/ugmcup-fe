/**
 * Single source of truth for everything a crawler or a link preview reads.
 *
 * Nothing here is rendered to the user — it feeds `metadata` exports,
 * `app/sitemap.ts`, `app/robots.ts` and the JSON-LD blocks. Keeping it in one
 * file means the canonical host is written down once, so a new page can never
 * disagree with the sitemap about where it lives.
 */

/**
 * Canonical origin, no trailing slash. `NEXT_PUBLIC_SITE_URL` lets a preview
 * deployment describe itself with its own host instead of claiming to be
 * production; without it we fall back to the real domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ugmcup2026.com"
).replace(/\/+$/, "");

export const SITE_NAME = "UGM CUP 2026";

export const SITE_TAGLINE = "Rallyverse — Power in every motion";

/**
 * Default `<title>`. Leads with the exact phrase people search for and stays
 * under ~60 characters, which is roughly where Google starts truncating.
 */
export const SITE_TITLE = "UGM CUP 2026 — Turnamen Bulutangkis UGM";

/**
 * Default meta description. Kept under ~160 characters so Google shows it whole
 * instead of truncating mid-sentence.
 */
export const SITE_DESCRIPTION =
  "UGM CUP 2026 — turnamen bulutangkis Universitas Gadjah Mada bertema Rallyverse. Pantau live score, jadwal, bracket, dan klasemen dari GOR Nusantara UGM.";

export const SITE_KEYWORDS = [
  "UGM CUP",
  "UGM CUP 2026",
  "Rallyverse",
  "turnamen bulutangkis UGM",
  "badminton UGM",
  "live score bulutangkis",
  "UKM Bulutangkis UGM",
  "Universitas Gadjah Mada",
  "GOR Nusantara UGM",
  "jadwal pertandingan bulutangkis",
];

export const SITE_LOCALE = "id_ID";

/** First day of the tournament, mirroring the landing-page countdown target. */
export const EVENT_START_DATE = "2026-08-09";

/** Builds an absolute URL from a root-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The public routes, in the order the navbar lists them. `app/sitemap.ts` reads
 * this, so adding a page to the nav and forgetting the sitemap is one less
 * mistake available.
 */
export const PUBLIC_ROUTES: ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pertandingan", priority: 0.9, changeFrequency: "daily" },
  { path: "/informasi", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tentang-kami", priority: 0.7, changeFrequency: "monthly" },
  { path: "/dokumentasi", priority: 0.7, changeFrequency: "weekly" },
];

/** Routes that must never reach an index — auth walls and the dashboards. */
export const PRIVATE_ROUTES = ["/login", "/admin", "/media"];
