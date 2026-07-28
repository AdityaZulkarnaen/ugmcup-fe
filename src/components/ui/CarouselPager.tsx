"use client";

import type { RefObject } from "react";
import { ChevronIcon } from "./icons";

const pagerButton =
  "flex h-11 w-11 items-center justify-center rounded-full transition-colors";

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
        onClick={() => page(-1)}
        aria-label={`${label} sebelumnya`}
        className={`${pagerButton} border border-black/10 bg-white text-[#6B6B73] hover:text-black`}
      >
        <ChevronIcon className="rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label={`${label} selanjutnya`}
        className={`${pagerButton} bg-[#0B0B0F] text-white hover:bg-black`}
      >
        <ChevronIcon />
      </button>
    </div>
  );
}
