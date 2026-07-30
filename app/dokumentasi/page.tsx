import type { Metadata } from "next";
import { DokumentasiPage } from "@/modules/dokumentasi";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";

// The title is just the section name — the root layout's `title.template`
// appends "| UGM CUP 2026".
export const metadata: Metadata = {
  title: "Dokumentasi & Galeri Foto",
  description:
    "Galeri foto dan dokumentasi UGM CUP 2026 — momen-momen dari lapangan GOR Nusantara UGM, setiap gerak punya cerita.",
  alternates: { canonical: "/dokumentasi" },
  openGraph: {
    url: "/dokumentasi",
    title: "Dokumentasi & Galeri Foto | UGM CUP 2026",
    description:
      "Galeri foto dan dokumentasi turnamen bulutangkis UGM CUP 2026 dari GOR Nusantara UGM.",
  },
};

export default function DokumentasiRoute() {
  return (
    <>
      <JsonLd
        data={schemaGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Dokumentasi", path: "/dokumentasi" },
          ])
        )}
      />
      <DokumentasiPage />
    </>
  );
}
