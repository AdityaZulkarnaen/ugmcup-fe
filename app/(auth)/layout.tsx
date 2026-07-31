import type { Metadata } from "next";

/**
 * Server layout that exists only to carry metadata: `login/page.tsx` is a
 * client component and so cannot export a `metadata` object of its own.
 *
 * `robots.txt` already asks crawlers not to fetch `/login`, but a link from
 * elsewhere can still get the page indexed — a disallowed URL can be indexed
 * from its anchor text alone. The meta tag is the part that actually keeps it
 * out of results.
 */
export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
