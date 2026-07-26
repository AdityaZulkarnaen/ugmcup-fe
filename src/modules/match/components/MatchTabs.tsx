"use client";

import { useState } from "react";
import { liveMatches, matchTabs } from "@/lib/constants/matches";
import { LiveScoreCard } from "./LiveScoreCard";

export function MatchTabs() {
  const [active, setActive] = useState(matchTabs[0].id);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Kategori pertandingan"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2 sm:grid-cols-4"
      >
        {matchTabs.map((tab) => {
          const isActive = tab.id === active;
          const isLive = tab.id === "livescore" && liveMatches.length > 0;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 text-center transition-colors ${
                isActive
                  ? "border border-[#EF9F27]/35 bg-[#EF9F27]/15"
                  : "border border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex items-center gap-1.5 text-sm font-bold tracking-wide ${
                  isActive ? "text-[#FAC775]" : "text-[#8A8A93]"
                }`}
              >
                {isActive && isLive && (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
                {tab.label.toUpperCase()}
              </span>
              <span className={`text-xs text-[#6B6B73] ${
                  isActive ? "text-[#FAC775]" : "text-[#8A8A93]"
                }`}>{tab.caption}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-6">
        {active === "livescore" ? (
          <div className="flex flex-col gap-5">
            {liveMatches.map((match) => (
              <LiveScoreCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center">
            <p className="text-lg font-bold italic text-white">
              {matchTabs.find((t) => t.id === active)?.label}
            </p>
            <p className="max-w-sm text-sm text-[#7A7A83]">
              Bagian ini akan segera hadir. Nantikan{" "}
              {matchTabs.find((t) => t.id === active)?.caption.toLowerCase()} di
              sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
