"use client";

import Image from "next/image";
import { useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type FilterKey = "Semua" | "Sorotan" | "Informasi";

interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
}

const FILTERS: FilterKey[] = ["Semua", "Sorotan", "Informasi"];

const ARTICLES: Article[] = [
  {
    id: "ginting-1",
    title: "Ginting: Jalan Baru Menuju Kemenangan? tunggal putra andalan Indonesia!",
    date: "12. August 2025",
    category: "Informasi",
    image: "/images/news/news-1.webp",
  },
  {
    id: "ginting-2",
    title: "Ginting: Jalan Baru Menuju Kemenangan? tunggal putra andalan Indonesia!",
    date: "12. August 2025",
    category: "Informasi",
    image: "/images/news/news-1.webp",
  },
  {
    id: "ginting-3",
    title: "Ginting: Jalan Baru Menuju Kemenangan? tunggal putra andalan Indonesia!",
    date: "12. August 2025",
    category: "Informasi",
    image: "/images/news/news-1.webp",
  },
  {
    id: "axelsen-1",
    title: "Axelsen: Kekuatan yang Tak Terbendung di Puncak Dunia",
    date: "07. August 2025",
    category: "Informasi",
    image: "/images/news/news-3.webp",
  },
  {
    id: "axelsen-2",
    title: "Axelsen: Kekuatan yang Tak Terbendung di Puncak Dunia",
    date: "07. August 2025",
    category: "Informasi",
    image: "/images/news/news-3.webp",
  },
  {
    id: "shida-1",
    title: "Kelincahan Shida: Standar Baru dalam Laga Ganda Putri!",
    date: "06. August 2025",
    category: "Informasi",
    image: "/images/news/news-2.webp",
  },
  {
    id: "shida-2",
    title: "Kelincahan Shida: Standar Baru dalam Laga Ganda Putri!",
    date: "06. August 2025",
    category: "Informasi",
    image: "/images/news/news-2.webp",
  },
];

function InfoCard({ article }: { article: Article }) {
  return (
    <a href="#" className="flex flex-col text-left">
      <div className="relative aspect-35/36 w-full overflow-hidden rounded-[1.8rem] bg-neutral-200 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#02F5D4] px-3 py-1 text-[11px] font-semibold text-[#8352D9]">
          {article.category}
        </span>
      </div>

      <p className="mt-4 text-[11px] font-normal uppercase tracking-[0.02em] text-[#7C7C8A]">
        {article.date}
      </p>
      <h3 className="mt-2 max-w-[20rem] text-[1.15rem] font-black italic leading-[0.92] tracking-tighter text-[#0B0B0F] sm:text-[1.25rem]">
        {article.title}
      </h3>
    </a>
  );
}

export function InformasiPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Semua");

  return (
    <main className="min-h-screen bg-white text-[#0B0B0F]">
      <Navbar forceInverted />

      <section className="mx-auto flex w-[87.5%] max-w-7xl flex-col items-center pt-28 text-center sm:pt-32 lg:pt-36">
        <p className="text-sm font-medium text-[#6B6B73] sm:text-base">
          Pusat informasi UGM CUP 2026
        </p>

        <h1 className="mt-4 max-w-5xl text-[clamp(3.2rem,6vw,5.7rem)] font-black italic leading-[0.9] tracking-[-0.06em] text-[#0B0B0F] sm:mt-5">
          Tetap <span className="text-[#8352D9]">Update,</span>
          <br />
          <span className="text-[#8352D9]">Jangan</span> Ketinggalan!
        </h1>

        <p className="mt-8 text-sm font-black italic text-[#0B0B0F] sm:mt-10 sm:text-base">
          Filter by kategori
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:px-5 ${
                  isActive
                    ? "bg-[#8352D9] text-white shadow-[0_10px_22px_rgba(131,82,217,0.24)]"
                    : "bg-[#F2F2F5] text-[#23232B] hover:bg-[#EAEAF0]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-[87.5%] max-w-7xl pb-20 pt-10 sm:pb-24 sm:pt-14">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {ARTICLES.map((article) => (
            <InfoCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}