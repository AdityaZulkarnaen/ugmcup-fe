"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CarouselPager } from "@/components/ui/CarouselPager";
import { getMedia } from "@/lib/api/content";
import type { Media } from "@/lib/types";

export function AboutGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Media[]>([]);

  useEffect(() => {
    getMedia()
      .then(setPhotos)
      .catch(console.error);
  }, []);

  return (
    <section className="bg-white py-8 sm:py-12">
      {/*
        Full-bleed strip: the padding matches the 6.25% page gutter so the first
        photo lines up with everything else while the rest run off the edge.
        `scrollbar-none` alone only sets scrollbar-width, which older iOS Safari
        ignores — the webkit rule covers it.
      */}
      <div
        ref={trackRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-[6.25%] pb-2 [&::-webkit-scrollbar]:hidden"
      >
        {/*
          Fixed height, `w-auto`: each photo keeps its own proportions, so
          portrait and landscape shots of any size sit side by side untouched.
        */}
        {photos.map((photo, index) => (
          <Image
            key={photo.id}
            src={photo.imageUrl}
            alt={photo.caption || "About UGM CUP"}
            width={0}
            height={0}
            sizes="100vw"
            // Y-only reveal: a sideways offset inside a snap scroller would
            // stretch the track and let the page scroll horizontally.
            data-aos="fade-up"
            data-aos-delay={`${index * 110}`}
            className="h-56 w-auto shrink-0 snap-start rounded-2xl object-cover sm:h-96 lg:h-132"
          />
        ))}
      </div>

      <CarouselPager trackRef={trackRef} label="Foto" className="mt-8" />
    </section>
  );
}
