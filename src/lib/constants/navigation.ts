export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Pertandingan", href: "/pertandingan" },
  { label: "Informasi", href: "#" },
  { label: "Tentang kami", href: "/tentang-kami" },
  { label: "Dokumentasi", href: "#" },
];
