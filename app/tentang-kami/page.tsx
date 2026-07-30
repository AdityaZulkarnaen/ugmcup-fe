import type { Metadata } from "next";
import AboutUsPage from "@/modules/about-us";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Kenali penyelenggara UGM CUP 2026 — UKM Bulutangkis Universitas Gadjah Mada, visi turnamen Rallyverse, dan orang-orang di baliknya.",
  alternates: { canonical: "/tentang-kami" },
  openGraph: {
    url: "/tentang-kami",
    title: "Tentang Kami | UGM CUP 2026",
    description:
      "Kenali penyelenggara UGM CUP 2026 — UKM Bulutangkis Universitas Gadjah Mada dan visi turnamen Rallyverse.",
  },
};

export default function TentangKami() {
  return (
    <>
      <JsonLd
        data={schemaGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Tentang Kami", path: "/tentang-kami" },
          ])
        )}
      />
      <AboutUsPage />
    </>
  );
}
