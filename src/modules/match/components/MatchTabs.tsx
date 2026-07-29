"use client";

import { useState } from "react";
import { liveMatches, matchTabs } from "@/lib/constants/matches";
import { LiveScoreCard } from "./LiveScoreCard";
import { SchedulePanel } from "./SchedulePanel";
import { BracketPanel } from "./BracketPanel";
import { StandingsPanel } from "./StandingsPanel";

interface MatchTabsProps {
  /** If true, renders the Figma Light Mode palette. */
  isLight?: boolean;
}

export function MatchTabs({ isLight = false }: MatchTabsProps) {
  const [active, setActive] = useState(matchTabs[0].id);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Kategori pertandingan"
        className={`grid grid-cols-2 gap-1.5 rounded-2xl border p-1.5 sm:grid-cols-4 transition-colors duration-300 ${
          isLight
            ? "border-[rgba(0,0,0,0.07)] bg-[rgba(0,0,0,0.03)]"
            : "border-white/[0.06] bg-white/[0.02]"
        }`}
      >
        {matchTabs.map((tab) => {
          const isActive = tab.id === active;
          const isLiveTab = tab.id === "livescore";
          const hasLive = liveMatches.length > 0;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-3 text-center transition-all duration-200 ${
                isActive && isLight
                  ? "border border-[#D9D3FF] bg-[#F3F0FF] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]"
                  : isActive
                    ? "border border-[#8b5cf6]/60 bg-[#8b5cf6]/40"
                    : isLight
                      ? "border border-transparent hover:bg-[rgba(0,0,0,0.03)]"
                      : "border border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex items-center gap-1.5 text-sm font-bold tracking-wide transition-colors duration-200 ${
                  isActive && isLight
                    ? "text-[#6C47D1]"
                    : isActive
                      ? "text-[#ffffff]"
                      : isLight
                        ? "text-[#808080]"
                        : "text-[#8A8A93]"
                }`}
              >
                {/* Live dot — only shown on the active Live Score tab */}
                {isActive && isLiveTab && hasLive && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FB2C36]" />
                  </span>
                )}
                {tab.label.toUpperCase()}
              </span>

              {/* Caption sub-label */}
              <span
                className={`text-xs leading-tight transition-colors duration-200 ${
                  isActive && isLight
                    ? "text-[rgba(108,71,209,0.7)]"
                    : isActive
                      ? "text-[#5CFCE7]/70"
                      : isLight
                        ? "text-[rgba(128,128,128,0.5)]"
                        : "text-[#8A8A93]/50"
                }`}
              >
                {tab.caption}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-4">
        {active === "livescore" ? (
          <div className="flex flex-col gap-4">
            {liveMatches.map((match) => (
              <LiveScoreCard key={match.id} match={match} isLight={isLight} />
            ))}
          </div>
        ) : active === "jadwal" ? (
          <SchedulePanel isLight={isLight} />
        ) : active === "bracket" ? (
          <BracketPanel isLight={isLight} />
        ) : (
          <StandingsPanel isLight={isLight} />
        )}
      </div>
    </div>
  );
}
