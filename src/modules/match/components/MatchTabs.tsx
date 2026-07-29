"use client";

import { useState } from "react";
import { matchTabs } from "@/lib/constants/matches";
import { LiveScorePanel } from "./LiveScorePanel";
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

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-3 text-center transition-all duration-200 ${
                isActive && isLight
                  ? "border border-[#fee685] bg-[#fffbeb] shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]"
                  : isActive
                    ? "border border-[#EF9F27]/35 bg-[#EF9F27]/15"
                    : isLight
                      ? "border border-transparent hover:bg-[rgba(0,0,0,0.03)]"
                      : "border border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex items-center gap-1.5 text-sm font-bold tracking-wide transition-colors duration-200 ${
                  isActive && isLight
                    ? "text-[#bb4d00]"
                    : isActive
                      ? "text-[#FAC775]"
                      : isLight
                        ? "text-[#808080]"
                        : "text-[#8A8A93]"
                }`}
              >
                {isActive && tab.id === "livescore" && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FB2C36]" />
                  </span>
                )}
                {tab.label.toUpperCase()}
              </span>

              {tab.caption ? (
                <span
                  className={`text-xs leading-tight transition-colors duration-200 ${
                    isActive && isLight
                      ? "text-[rgba(225,113,0,0.7)]"
                      : isActive
                        ? "text-[#FAC775]/70"
                        : isLight
                          ? "text-[rgba(128,128,128,0.5)]"
                          : "text-[#8A8A93]/50"
                  }`}
                >
                  {tab.caption}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-4">
        {active === "livescore" ? (
          <LiveScorePanel isLight={isLight} />
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
