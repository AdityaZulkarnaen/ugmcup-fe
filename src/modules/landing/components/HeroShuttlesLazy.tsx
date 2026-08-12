"use client";

import dynamic from "next/dynamic";

/**
 * Pembungkus pemuat-lambat untuk `HeroShuttles`.
 *
 * Kok tidak diimpor langsung? Karena shuttlecock-nya digerakkan GSAP beserta
 * plugin MotionPath dan ScrollTrigger — sekitar 130 KB JavaScript hanya untuk
 * hiasan. Kalau diimpor biasa, seluruh berkas itu ikut antre di jalur kritis
 * halaman depan: browser harus mengunduh dan mem-parse-nya sebelum halaman bisa
 * ditanggapi, padahal tidak ada satu pun teks atau tombol yang bergantung
 * padanya.
 *
 * Dengan `ssr: false`, GSAP diambil terpisah setelah halaman hidup. Hiasannya
 * memang datang sepersekian detik lebih lambat — dan itu tidak terlihat, karena
 * shuttlecock-nya toh mulai dari keadaan tersembunyi lalu diterbangkan masuk.
 */
const HeroShuttlesImpl = dynamic(
  () => import("./HeroShuttles").then((mod) => mod.HeroShuttles),
  { ssr: false },
);

export function HeroShuttlesLazy() {
  return <HeroShuttlesImpl />;
}
