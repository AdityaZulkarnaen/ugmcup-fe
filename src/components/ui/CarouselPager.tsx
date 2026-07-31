"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { ChevronIcon } from "./icons";

const pagerButton =
  "flex h-12 w-12 sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full transition-all shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

/**
 * Prev/next buttons for a snap-scroll track. The scroll position lives on the
 * element itself rather than in state, so swiping the track directly and using
 * these buttons can never disagree.
 */
export function CarouselPager({
  trackRef,
  label,
  className = "",
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  /** Names what is being paged, e.g. "Berita" -> "Berita sebelumnya". */
  label: string;
  className?: string;
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    // 2px threshold for sub-pixel browser calculations
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, [trackRef]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    checkScroll();
    track.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      track.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [trackRef, checkScroll]);

  /** Nudges the track along by one item, gap included. */
  function page(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const item = track.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = item ? item.offsetWidth + gap : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        disabled={!canScrollLeft}
        onClick={() => page(-1)}
        aria-label={`${label} sebelumnya`}
        className={`${pagerButton} bg-black text-white hover:bg-[#8B5CF6] hover:text-[#DAFA78]`}
      >
        <ChevronIcon className="rotate-180" />
      </button>
      <button
        type="button"
        disabled={!canScrollRight}
        onClick={() => page(1)}
        aria-label={`${label} selanjutnya`}
        className={`${pagerButton} bg-black text-white hover:bg-[#8B5CF6] hover:text-[#DAFA78]`}
      >
        <ChevronIcon />
      </button>
    </div>
  );
}
