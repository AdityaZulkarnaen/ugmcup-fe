import type { Metadata } from "next";
import { DokumentasiPage } from "@/modules/dokumentasi";

export const metadata: Metadata = {
  title: "Dokumentasi | UGM CUP 2026",
  description: "Galeri dokumentasi UGM CUP 2026",
};

export default function DokumentasiRoute() {
  return <DokumentasiPage />;
}