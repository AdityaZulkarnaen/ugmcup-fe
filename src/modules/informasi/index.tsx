"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NewsCard } from "@/modules/landing/components/NewsCard";

import { getNews } from "@/lib/api/content";
import type { News } from "@/lib/types";

type FilterKey = "Semua" | "Sorotan" | "Informasi";

const FILTERS: FilterKey[] = ["Semua", "Sorotan", "Informasi"];

export function InformasiPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Semua");
  const [articles, setArticles] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0B0B0F]">
      <Navbar forceInverted />

      <section className="mx-auto flex w-[87.5%] max-w-7xl flex-col items-center pt-28 text-center sm:pt-32 lg:pt-36">
        <p
          data-aos="fade-down"
          className="text-sm font-medium text-[#6B6B73] sm:text-base"
        >
          Pusat informasi UGM CUP 2026
        </p>

        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="mt-4 max-w-5xl text-[clamp(3.2rem,6vw,5.7rem)] font-black italic leading-[0.9] tracking-[-0.06em] text-[#0B0B0F] sm:mt-5"
        >
          Tetap <span className="text-[#8352D9]">Update,</span>
          <br />
          <span className="text-[#8352D9]">Jangan</span> Ketinggalan!
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="240"
          className="mt-8 text-sm font-black italic text-[#0B0B0F] sm:mt-10 sm:text-base"
        >
          Filter by kategori
        </p>

        {/* The reveal rides on the row, not the pills: `[data-aos]` owns the
            transition and would swallow their own colour transition. */}
        <div
          data-aos="fade-up"
          data-aos-delay="330"
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
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
          {articles.map((article, index) => (
            <div
              key={article.id}
              data-aos="fade-up"
              data-aos-delay={`${(index % 3) * 110}`}
            >
              <NewsCard item={article} />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}