import type { Metadata } from "next";

/**
 * Metadata carrier for the admin dashboard. The route's own `layout.tsx` and
 * `page.tsx` are client components, so the `noindex` has to live in a server
 * layout of its own.
 */
export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
