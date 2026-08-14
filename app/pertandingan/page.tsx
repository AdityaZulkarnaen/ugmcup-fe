import type { Metadata } from "next";
import MatchPage from "@/modules/match";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Live Score & Jadwal Pertandingan",
  description:
    "Live score, jadwal, bracket, dan klasemen grup UGM CUP 2026 untuk semua nomor — tunggal, ganda, dan beregu, tingkat universitas maupun SMA/SMK.",
  alternates: { canonical: "/pertandingan" },
  openGraph: {
    url: "/pertandingan",
    title: "Live Score & Jadwal Pertandingan | UGM CUP 2026",
    description:
      "Pantau live score, jadwal, bracket, dan klasemen grup UGM CUP 2026 langsung dari GOR Nusantara UGM.",
  },
};

export default function Pertandingan() {
  return (
    <>
      <JsonLd
        data={schemaGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Pertandingan", path: "/pertandingan" },
          ])
        )}
      />
      {/* Filter state kini disimpan di sessionStorage — tidak perlu Suspense */}
      <MatchPage />
    </>
  );
}
