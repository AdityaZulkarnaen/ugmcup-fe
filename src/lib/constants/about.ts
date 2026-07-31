import type { StaticImageData } from "next/image";
// Stand-ins until the event photos land in `public/images/about-us/`.
import galeri1 from "../../../public/images/news/news-1.webp";
import galeri2 from "../../../public/images/news/news-2.webp";
import galeri3 from "../../../public/images/news/news-3.webp";

/**
 * One of the three purple cards under "Di Balik UGM CUP" — the bodies behind
 * the tournament, each with the mark that identifies it.
 */
export interface AboutPillar {
  id: string;
  /** Mark shown on the purple card; a path under `public/`. */
  logo: string;
  /**
   * True when the asset is coloured and has to be forced to white to sit on the
   * purple card. Assets that are already white leave this off.
   */
  forceWhite?: boolean;
  title: string;
  caption: string;
}

export const aboutPillars: AboutPillar[] = [
  {
    id: "ugm-cup",
    logo: "/images/global/logo-ugmcup.webp",
    forceWhite: true,
    title: "UGM CUP 2026",
    caption: "Identitas Resmi Turnamen",
  },
  {
    id: "ugm",
    logo: "/images/global/logo-ugm.webp",
    title: "Universitas Gadjah Mada",
    caption: "Perguruan Tinggi Naungan",
  },
  {
    id: "ukm",
    // TODO: ganti dengan lambang UKM Bulutangkis UGM begitu asetnya tersedia.
    logo: "/images/global/logo-ukm.webp",
    title: "UKM Bulutangkis UGM",
    caption: "Pelaksana & Penanggung Jawab Event",
  },
];

/** One photo in the gallery strip. */
export interface GalleryPhoto {
  id: string;
  /**
   * Imported rather than referenced by path, so its real dimensions travel with
   * it. The strip renders at a fixed height and lets the width follow, which is
   * what keeps portrait and landscape photos side by side without any per-photo
   * setting.
   */
  src: StaticImageData;
  alt: string;
}

/**
 * Gallery strip. Photos of any size can be dropped in — add the import and an
 * entry, nothing else needs adjusting. The ones below are stand-ins borrowed
 * from the news set; swap them for the real shots in `public/images/about-us/`.
 */
export const aboutGallery: GalleryPhoto[] = [
  {
    id: "galeri-1",
    src: galeri1,
    alt: "Atlet UGM CUP bersiap sebelum pertandingan",
  },
  {
    id: "galeri-2",
    src: galeri2,
    alt: "Peserta dan panitia UGM CUP di dalam gedung olahraga",
  },
  {
    id: "galeri-3",
    src: galeri3,
    alt: "Suasana pertandingan UGM CUP",
  },
];
