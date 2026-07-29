"use client";

import { useEffect, useState } from "react";
import { getMatchHistory } from "@/lib/api/matches";
import type { Match, MatchHistoryEntry } from "@/lib/types";
import { getMatchSideDetails } from "./MatchScoreboard";

function formatTimer(seconds: number | null) {
  if (seconds === null || seconds === undefined) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export function PointHistory({ match, parentMatch }: { match: Match; parentMatch?: Match }) {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState<number>(1);

  const { nameA, nameB } = getMatchSideDetails(match, parentMatch);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getMatchHistory(match.id);
        if (isMounted) {
          setHistory(data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat poin:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [match.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.02]"
          />
        ))}
      </div>
    );
  }

  // 1. Filter out invalid/undone score logs
  const validHistory = history.filter(
    (h) => h.action !== "UNDO_SCORE" && !h.isUndone
  );

  if (validHistory.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-sm text-[#7A7A83]">
        Riwayat perolehan poin belum dicatat untuk pertandingan ini.
      </div>
    );
  }

  // Get set numbers present in valid history
  const setNumbers = Array.from(new Set(validHistory.map((h) => h.setNumber || 1))).sort(
    (a, b) => a - b
  );

  const filteredHistory = validHistory.filter(
    (h) => (h.setNumber || 1) === activeSet
  );

  // Map metadata in chronological order first
  const rows = filteredHistory.map((item, index) => {
    const timerFormatted = formatTimer(item.elapsedSeconds);
    const prevItem = index > 0 ? filteredHistory[index - 1] : null;
    const prevA = prevItem ? (prevItem.scoreA ?? 0) : 0;
    const prevB = prevItem ? (prevItem.scoreB ?? 0) : 0;
    const currA = item.scoreA ?? 0;
    const currB = item.scoreB ?? 0;

    const scoredByA = currA > prevA;
    const scoredByB = currB > prevB;

    let serverSide: "A" | "B" | null = null;
    if (index > 0 && prevItem) {
      const prevPrevItem = index > 1 ? filteredHistory[index - 2] : null;
      const ppA = prevPrevItem ? (prevPrevItem.scoreA ?? 0) : 0;
      const ppB = prevPrevItem ? (prevPrevItem.scoreB ?? 0) : 0;
      if (prevA > ppA) {
        serverSide = "A";
      } else if (prevB > ppB) {
        serverSide = "B";
      }
    }

    const diff = Math.abs(currA - currB);
    let showPillA = false;
    let showPillB = false;
    const pillText = `+${diff}`;
    let isGreenPill = true;

    if (diff > 0) {
      if (currA > currB) {
        showPillA = true;
        isGreenPill = scoredByA;
      } else {
        showPillB = true;
        isGreenPill = scoredByB;
      }
    }

    return {
      id: item.id,
      currA,
      currB,
      timerFormatted,
      showPillA,
      showPillB,
      pillText,
      isGreenPill,
      serverSide,
    };
  });

  // Reverse so latest score is at the top
  const displayRows = [...rows].reverse();

  return (
    <div className="flex flex-col gap-4">
      {/* Set selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {setNumbers.map((setNum) => {
          const isActive = setNum === activeSet;
          return (
            <button
              key={setNum}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveSet(setNum)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${isActive
                ? "border-[#C79A3B]/50 bg-[#C79A3B]/15 text-[#E3B24D]"
                : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white"
                }`}
            >
              Set {setNum}
            </button>
          );
        })}
      </div>

      <h3 className="text-center text-[13px] font-bold uppercase tracking-wider text-[#E3B24D]">
        POIN DEMI POIN — SET {activeSet}
      </h3>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.01]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-6 py-2.5 text-[11px] font-bold text-white">
          <span className="min-w-0 truncate">{nameA}</span>
          <span className="min-w-0 truncate text-right">{nameB}</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {displayRows.map((item) => (
            <div
              key={item.id}
              className="px-4 py-2.5 transition-colors odd:bg-white/[0.015]"
            >
              <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3">
                {/* Left Side (Side A) */}
                <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
                  {item.showPillA && (
                    <span
                      className={`rounded-md px-2 text-[10px] font-bold ${item.isGreenPill
                        ? "border border-[#34E5A6]/40 bg-[#0D3B38] text-[#34E5A6]"
                        : "border border-[#FF4D6D]/40 bg-[#3E1A24] text-[#FF4D6D]"
                        }`}
                    >
                      {item.pillText}
                    </span>
                  )}
                  {item.serverSide === "A" && (
                    <img
                      src="/images/match/ShuttleIcon.svg"
                      className="h-4 w-4 shrink-0"
                      alt="Pemegang servis"
                    />
                  )}
                  <span
                    className="text-sm font-bold tabular-nums text-white"
                  >
                    {item.currA}
                  </span>
                </div>

                {/* Center: Small gray timer replacing '-' */}
                <span className="shrink-0 text-[10px] font-mono font-bold text-[#7A7A83]">
                  {item.timerFormatted || "00:00"}
                </span>

                {/* Right Side (Side B) */}
                <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
                  <span
                    className="text-sm font-bold tabular-nums text-white"
                  >
                    {item.currB}
                  </span>
                  {item.serverSide === "B" && (
                    <img
                      src="/images/match/ShuttleIcon.svg"
                      className="h-4 w-4 shrink-0"
                      alt="Pemegang servis"
                    />
                  )}
                  {item.showPillB && (
                    <span
                      className={`rounded-md px-2 text-[10px] font-bold ${item.isGreenPill
                        ? "border border-[#34E5A6]/40 bg-[#0D3B38] text-[#34E5A6]"
                        : "border border-[#FF4D6D]/40 bg-[#3E1A24] text-[#FF4D6D]"
                        }`}
                    >
                      {item.pillText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-start gap-6 pt-2 text-xs text-[#8A8A93]">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[#34E5A6]/40 bg-[#0D3B38] px-2 py-0.5 text-[10px] font-bold text-[#34E5A6]">
            +2
          </span>
          <span>Keunggulan poin bertambah</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[#FF4D6D]/40 bg-[#3E1A24] px-2 py-0.5 text-[10px] font-bold text-[#FF4D6D]">
            +1
          </span>
          <span>Keunggulan mulai dikejar</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="/images/match/ShuttleIcon.svg" className="h-4 w-4" alt="Pemegang servis" />
          <span>Pemegang servis</span>
        </div>
      </div>

      <p className="text-start text-xs text-[#6B6B73]">
        Catatan waktu berdasarkan detik timer saat poin ditambahkan oleh panitia.
      </p>
    </div>
  );
}
