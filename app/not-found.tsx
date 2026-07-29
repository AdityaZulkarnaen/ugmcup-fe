import type { Metadata } from "next";
import NotFoundPage from "@/modules/not-found";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan | UGM CUP 2026",
  description: "Halaman yang kamu cari tidak ada di Rallyverse.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
