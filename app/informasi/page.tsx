import type { Metadata } from "next";
import { InformasiPage } from "@/modules/informasi";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";

// The title is just the section name — the root layout's `title.template`
// appends "| UGM CUP 2026".
export const metadata: Metadata = {
  title: "Informasi & Berita",
  description:
    "Berita, pengumuman, dan informasi terbaru UGM CUP 2026 — dari pendaftaran dan technical meeting sampai hasil pertandingan.",
  alternates: { canonical: "/informasi" },
  openGraph: {
    url: "/informasi",
    title: "Informasi & Berita | UGM CUP 2026",
    description:
      "Berita, pengumuman, dan informasi terbaru seputar turnamen bulutangkis UGM CUP 2026.",
  },
};

export default function InformasiRoute() {
  return (
    <>
      <JsonLd
        data={schemaGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Informasi", path: "/informasi" },
          ])
        )}
      />
      <InformasiPage />
    </>
  );
}
