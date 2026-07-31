import type { Metadata } from "next";
import NotFoundPage from "@/modules/not-found";

export const metadata: Metadata = {
  // Suffix dropped — the root layout's `title.template` supplies it.
  title: "404 — Halaman Tidak Ditemukan",
  description: "Halaman yang kamu cari tidak ada di Rallyverse.",
  // The 404 status already tells a crawler not to keep this URL; the meta tag
  // covers the case where the page is reached without one.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundPage />;
}
