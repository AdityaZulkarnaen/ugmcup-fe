"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { CarouselPager } from "@/components/ui/CarouselPager";
import { news } from "@/lib/constants/news";
import { NewsCard } from "./NewsCard";

export function News() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-[#F5F5F5] py-20 text-center text-[#0B0B0F] sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <p className="text-sm font-medium tracking-wide text-[#6B6B73] sm:text-base">
          Kabar Terkini Seputar UGM CUP
        </p>

        <h2 className="mt-3 text-4xl font-black italic sm:text-6xl">
          Berita &amp; Informasi
        </h2>

        {/*
          One card at a time with the next one peeking, on a plain snap scroller
          so a swipe works and the arrows only have to nudge it. From sm up the
          very same children fall back into the three-column grid.
        */}
        {/* `scrollbar-none` alone only sets scrollbar-width, which older iOS
            Safari ignores — the webkit rule covers it. */}
        <div
          id="news-track"
          ref={trackRef}
          className="scrollbar-none mt-12 flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {news.map((item) => (
            <div
              key={item.id}
              className="w-[86%] shrink-0 snap-start sm:w-auto"
            >
              <NewsCard item={item} />
            </div>
          ))}
        </div>

        {/* Pager — the desktop grid shows everything at once and needs none */}
        <CarouselPager
          trackRef={trackRef}
          label="Berita"
          className="mt-6 sm:hidden"
        />

        <Button
          href="#"
          variant="solid"
          className="mt-12 px-6 py-3 text-base font-black italic"
        >
          Baca Berita Lainnya
        </Button>
      </div>
    </section>
  );
}
