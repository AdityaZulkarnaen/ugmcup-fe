/** Satu foto di slider galeri dokumentasi. */
export interface DocumentationPhoto {
  id: string;
  /** Path dari `public/`. */
  src: string;
  alt: string;
}

/** Folder Drive berisi dokumentasi lengkap — tujuan CTA di bawah slider. */
export const driveFolderUrl = "#";

/**
 * Isi slider, urut kiri ke kanan. Jumlahnya bebas: garis indikator di bawah
 * slider menghitung sendiri dari posisi scroll, bukan dari panjang array ini.
 *
 * Foto di bawah masih pinjaman dari set berita sampai dokumentasi asli masuk
 * ke `public/images/dokumentasi/` — cukup tukar `src` dan `alt`-nya.
 */
export const documentationPhotos: DocumentationPhoto[] = [
  {
    id: "doc-1",
    src: "/images/news/news-1.webp",
    alt: "Atlet melakukan servis di partai tunggal UGM CUP 2026",
  },
  {
    id: "doc-2",
    src: "/images/news/news-2.webp",
    alt: "Duel net pada laga ganda putri UGM CUP 2026",
  },
  {
    id: "doc-3",
    src: "/images/news/news-3.webp",
    alt: "Selebrasi tim setelah memenangkan gim penentu UGM CUP 2026",
  },
  {
    id: "doc-4",
    src: "/images/news/news-1.webp",
    alt: "Suasana tribun penonton di GOR Nusantara UGM",
  },
  {
    id: "doc-5",
    src: "/images/news/news-2.webp",
    alt: "Pemain bersiap menerima servis lawan di UGM CUP 2026",
  },
  {
    id: "doc-6",
    src: "/images/news/news-3.webp",
    alt: "Sesi pemanasan atlet sebelum pertandingan UGM CUP 2026",
  },
];
