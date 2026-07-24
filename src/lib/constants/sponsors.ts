export interface Sponsor {
  id: string;
  name: string;
  logo: string;
}

const SPONSOR_DIR = "/images/hero/sponsor";

export const sponsors: Sponsor[] = [
  { id: "suna", name: "Suna", logo: `${SPONSOR_DIR}/suna.webp` },
  { id: "clandestin", name: "Clandestin", logo: `${SPONSOR_DIR}/clandestin.webp` },
  { id: "every-print", name: "Every Print", logo: `${SPONSOR_DIR}/every-print.webp` },
  { id: "yup", name: "Yup", logo: `${SPONSOR_DIR}/yup.webp` },
  { id: "pop", name: "Pop", logo: `${SPONSOR_DIR}/pop.webp` },
  { id: "bebek-rakyat", name: "Bebek Rakyat", logo: `${SPONSOR_DIR}/bebek-rakyat.webp` },
  { id: "happy-puppy", name: "Happy Puppy", logo: `${SPONSOR_DIR}/happy-puppy.webp` },
  { id: "ornaminc", name: "OrnaminC", logo: `${SPONSOR_DIR}/ornaminc.webp` },
];
