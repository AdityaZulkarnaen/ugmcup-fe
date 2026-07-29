"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { documentationPhotos, driveFolderUrl } from "@/lib/constants/dokumentasi";
import { ProgressArc } from "./ProgressArc";

/** Kemiringan kartu yang sedang tidak di tengah, dalam derajat. */
const TILT = 11;

/**
 * Slider foto dokumentasi: kartu yang berada di tengah berdiri tegak dan
 * terang, tetangganya miring dan meredup. Posisi scroll-nya juga yang menyetir
 * busur indikator di bawah slider.
 */
export function GallerySlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollable = track.scrollWidth - track.clientWidth;
    setProgress(scrollable > 0 ? track.scrollLeft / scrollable : 0);

    // Kartu yang titik tengahnya paling dekat dengan tengah track adalah kartu
    // yang sedang dilihat — dibaca dari posisi elemennya, bukan dari hitungan
    // lebar kartu, supaya tetap benar di semua breakpoint.
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - trackCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  /**
   * Snap mandatory menarik track balik ke kartu terdekat tiap kali
   * `scrollLeft` disetel dari kode, yang membuat geseran manual tersendat.
   * Jadi snap dimatikan selagi menggeser dan dihidupkan lagi saat dilepas —
   * di situ slider mendarat rapi di kartu terdekat.
   */
  const suspendSnap = useCallback(() => {
    if (trackRef.current) trackRef.current.style.scrollSnapType = "none";
  }, []);

  const restoreSnap = useCallback(() => {
    if (trackRef.current) trackRef.current.style.scrollSnapType = "";
  }, []);

  /** Menyetir slider dari geseran busur indikator. */
  const scrubTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track) return;
      suspendSnap();
      track.scrollLeft = next * (track.scrollWidth - track.clientWidth);
    },
    [suspendSnap],
  );

  // Sentuh dan trackpad sudah menggeser track secara native; yang belum adalah
  // mouse, jadi hanya pointer mouse yang dibajak jadi drag-to-scroll.
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || event.pointerType !== "mouse") return;
    drag.current = { active: true, startX: event.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    suspendSnap();
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    track.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!drag.current.active) return;
    drag.current.active = false;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    restoreSnap();
  }

  return (
    <div className="mt-4">
      {/*
        Padding kiri-kanan menyisakan tepat setengah layar dikurangi setengah
        kartu, jadi kartu pertama dan terakhir pun bisa berhenti di tengah.
        Padding atas-bawahnya bukan sekadar jarak: memiringkan kartu itu
        transform, yang tidak menambah tinggi layout, sementara `overflow-x`
        di sini memaksa sumbu Y ikut terpotong — tanpa ruang itu sudut kartu
        yang miring hilang tergunting.
      */}
      <div
        ref={trackRef}
        role="group"
        aria-label="Galeri foto dokumentasi"
        tabIndex={0}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative flex cursor-grab snap-x snap-mandatory gap-10 overflow-x-auto overscroll-x-contain px-[calc(50%-35vw)] py-12 select-none [scrollbar-width:none] active:cursor-grabbing sm:gap-14 sm:px-[calc(50%-190px)] sm:py-16 lg:gap-16 lg:px-[calc(50%-210px)] [&::-webkit-scrollbar]:hidden"
      >
        {documentationPhotos.map((photo, index) => {
          const isActive = index === activeIndex;
          const tilt = isActive ? 0 : index < activeIndex ? -TILT : TILT;
          return (
            <figure
              key={photo.id}
              style={{
                transform: `translateY(${isActive ? 0 : 5}%) rotate(${tilt}deg) scale(${isActive ? 1 : 0.95})`,
              }}
              className={`relative aspect-3/2 w-[70vw] shrink-0 snap-center overflow-hidden rounded-[1.4rem] bg-neutral-200 transition-[transform,opacity,box-shadow] duration-500 ease-out sm:w-[380px] lg:w-[420px] ${
                isActive
                  ? "shadow-[0_26px_60px_rgba(17,17,17,0.18)]"
                  : "opacity-45 shadow-[0_18px_40px_rgba(17,17,17,0.10)]"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                draggable={false}
                // Dua kartu pertama sudah terlihat sebelum user menggeser
                // apa pun, jadi keduanya ikut antrean muat awal.
                priority={index < 2}
                sizes="(max-width: 640px) 70vw, 420px"
                className="object-cover"
              />
            </figure>
          );
        })}
      </div>

      {/*
        Busur naik lebih tinggi dari tumpukan kartu, jadi ditarik ke atas agar
        pangkalnya menyelip di bawah slider seperti di desain. Tombol duduk di
        cekungan busur, dipatok ke persentase tinggi busur supaya ikut bergeser
        saat busur menyusut di layar kecil.
      */}
      <div className="relative -mt-14 overflow-hidden sm:-mt-18">
        <ProgressArc progress={progress} onScrub={scrubTo} onScrubEnd={restoreSnap} />

        <Button
          href={driveFolderUrl}
          variant="solid"
          className="absolute top-[72%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 text-sm font-black italic sm:text-base"
        >
          Lihat Semua di Google Drive
        </Button>
      </div>
    </div>
  );
}
