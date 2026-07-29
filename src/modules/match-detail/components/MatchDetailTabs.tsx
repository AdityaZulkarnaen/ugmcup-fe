"use client";

import { useState } from "react";
import {
  disciplineLabel,
  findBracketAthlete,
  findBracketForMatch,
  tierLabel,
  type MatchDetail,
} from "@/lib/constants/matches";
import { BracketBoard } from "@/modules/match/components/BracketBoard";
import { MatchScoreboard } from "./MatchScoreboard";
import { PointHistory } from "./PointHistory";
import { ScoreTable } from "./ScoreTable";
import { MatchInfo } from "./MatchInfo";

const tabs = [
  { id: "pertandingan", label: "Pertandingan" },
  { id: "bracket", label: "Bracket" },
];

const subTabs = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "sejarah", label: "Sejarah Pertandingan" },
];

/** The page subtitle follows whatever view is open. */
const subtitles: Record<string, string> = {
  ringkasan: "Ringkasan hasil akhir, skor per set, dan lokasi pertandingan.",
  sejarah: "Alur perolehan poin dan riwayat pergerakan servis sepanjang laga.",
  bracket: "Posisi pertandingan ini pada bagan knockout kategorinya.",
};

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-sm text-[#7A7A83]">
      {children}
    </div>
  );
}

export function MatchDetailTabs({ match }: { match: MatchDetail }) {
  const [tab, setTab] = useState(tabs[0].id);
  const [subTab, setSubTab] = useState(subTabs[0].id);

  /** The draw this match belongs to, with the home side's path lit. */
  const bracket = findBracketForMatch(match.categoryId, match.tier);
  const athlete = bracket
    ? findBracketAthlete(bracket.id, match.home.players)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-4xl font-black italic text-white sm:text-6xl lg:text-7xl">
          Statistik Pertandingan
        </h1>
        <p className="mt-3 text-sm text-[#8A8A93] sm:text-base">
          {subtitles[tab === "bracket" ? "bracket" : subTab]}
        </p>
      </header>

      <div className="mt-8">
        <MatchScoreboard match={match} />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        {/* Primary tabs */}
        <div
          role="tablist"
          aria-label="Bagian statistik"
          className="flex border-b border-white/[0.06]"
        >
          {tabs.map((item) => {
            const isActive = item.id === tab;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(item.id)}
                className={`-mb-px border-b-2 px-5 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-[#02F5D4] text-[#34E5A6]"
                    : "border-transparent text-[#6B6B73] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sub tabs, only meaningful under the match tab */}
        {tab === "pertandingan" && (
          <div className="flex flex-wrap gap-2 p-3">
            {subTabs.map((item) => {
              const isActive = item.id === subTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSubTab(item.id)}
                  className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#C4B5FD]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tab === "bracket" ? (
        bracket ? (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A83]">
              Bagan {disciplineLabel(match.categoryId)} ·{" "}
              {tierLabel(match.tier)}
            </p>
            <BracketBoard
              bracket={bracket}
              pinnedId={athlete?.participant.id}
              interactive={false}
            />
          </div>
        ) : (
          <EmptyState>
            Bagan {disciplineLabel(match.categoryId)} belum tersedia.
          </EmptyState>
        )
      ) : subTab === "ringkasan" ? (
        <>
          <ScoreTable match={match} />
          <MatchInfo match={match} />
        </>
      ) : (
        <PointHistory match={match} />
      )}
    </div>
  );
}
