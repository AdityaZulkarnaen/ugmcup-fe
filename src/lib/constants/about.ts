import type { StaticImageData } from "next/image";
import galeri1 from "../../../public/images/about/about1.png";
import galeri2 from "../../../public/images/about/about2.png";
import galeri3 from "../../../public/images/about/about3.png";
import galeri4 from "../../../public/images/about/about4.png";
import galeri5 from "../../../public/images/about/about5.png";
import galeri6 from "../../../public/images/about/about6.png";

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
 * entry, nothing else needs adjusting.
 */
export const aboutGallery: GalleryPhoto[] = [
  {
    id: "galeri-1",
    src: galeri1,
    alt: "Deskripsi foto 1",
  },
  {
    id: "galeri-2",
    src: galeri2,
    alt: "Deskripsi foto 2",
  },
  {
    id: "galeri-3",
    src: galeri3,
    alt: "Deskripsi foto 3",
  },
  {
    id: "galeri-4",
    src: galeri4,
    alt: "Deskripsi foto 4",
  },
  {
    id: "galeri-5",
    src: galeri5,
    alt: "Deskripsi foto 5",
  },
  {
    id: "galeri-6",
    src: galeri6,
    alt: "Deskripsi foto 6",
  },
];
