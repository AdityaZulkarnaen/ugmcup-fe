export interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  /** Path to the cover image, e.g. "/images/news/ginting.jpg". */
  image: string;
  href: string;
}

export const news: NewsItem[] = [
  {
    id: "news-1",
    category: "Highlights",
    date: "12. August 2025",
    title:
      "Ginting: Jalan Baru Menuju Kemenangan? tunggal putra andalan Indonesia!",
    image: "/images/news/news-1.webp",
    href: "#",
  },
  {
    id: "news-2",
    category: "Highlights",
    date: "07. August 2025",
    title: "Axelsen: Kekuatan yang Tak Terbendung di Puncak Dunia",
    image: "/images/news/news-3.webp",
    href: "#",
  },
  {
    id: "news-3",
    category: "Highlights",
    date: "06. August 2025",
    title: "Kelincahan Shida: Standar Baru dalam Laga Ganda Putri!",
    image: "/images/news/news-2.webp",
    href: "#",
  },
];
