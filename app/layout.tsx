import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { ScrollAnimator } from "@/components/layout/ScrollAnimator";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, schemaGraph, websiteSchema } from "@/lib/schema";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

/**
 * Site-wide metadata. Every page inherits from here and overrides only what it
 * needs — `title.template` slots a page's own title into the shared suffix, and
 * the `openGraph`/`twitter` blocks carry over unless a page replaces them.
 *
 * `metadataBase` is what makes the relative URLs below (and every page's
 * `alternates.canonical`) resolve to absolute ones; without it Next throws at
 * build time, and social crawlers would get relative image paths they cannot
 * fetch.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "UKM Bulutangkis Universitas Gadjah Mada" }],
  creator: "UKM Bulutangkis Universitas Gadjah Mada",
  publisher: "UKM Bulutangkis Universitas Gadjah Mada",
  category: "sports",
  // Deliberately no `alternates.canonical` here: it would be inherited by every
  // route that doesn't set its own, and the `noindex` pages would end up naming
  // the homepage as their canonical — a contradictory pair of signals. Each
  // public page declares its own instead.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    // The card image already shouts the tagline, so the title line carries the
    // searchable name instead of repeating it.
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length text snippets, large image previews and
      // untruncated video — the defaults are conservative and cost us clicks.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Wired to env vars so claiming the site in Search Console / Bing Webmaster
  // Tools is a dashboard setting, not a code change. Unset means the tag is
  // simply omitted. Both are read at build time, so a redeploy is needed after
  // setting them.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
  formatDetection: {
    // Stops iOS Safari from rewriting scores and dates as tappable phone links.
    telephone: false,
    date: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#14183B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Who runs this site and what the site is, stated once for the whole
          app. Page-level graphs (the event on the landing page, breadcrumbs on
          the inner pages) reference these nodes by `@id` instead of restating
          them.
        */}
        <JsonLd data={schemaGraph(organizationSchema, websiteSchema)} />
        {/*
          Scroll-reveal targets start invisible, so without JS they would never
          come back — this puts them straight on screen instead. Written as raw
          HTML because React would otherwise hoist the <style> out of the
          <noscript> and into the head, where it applies to everyone.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>[data-aos]{opacity:1!important;transform:none!important;filter:none!important}</style>`,
          }}
        />
        <ScrollAnimator />
        {children}
      </body>
    </html>
  );
}
