import type { Metadata } from "next";

/**
 * Metadata carrier for the content-editor dashboard — same reason as the admin
 * one: the surrounding layout and page are client components.
 */
export const metadata: Metadata = {
  title: "Dashboard Media",
  robots: { index: false, follow: false, nocache: true },
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
