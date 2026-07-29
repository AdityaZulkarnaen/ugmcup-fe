import type { Metadata } from "next";
import { InformasiPage } from "@/modules/informasi";

export const metadata: Metadata = {
  title: "Informasi | UGM CUP 2026",
  description: "Pusat informasi terbaru UGM CUP 2026",
};

export default function InformasiRoute() {
  return <InformasiPage />;
}