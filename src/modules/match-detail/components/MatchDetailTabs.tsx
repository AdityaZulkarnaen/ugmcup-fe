"use client";

import { useState } from "react";
import {
  findBracketAthlete,
  sideName,
  type MatchDetail,
} from "@/lib/constants/matches";
import { BracketPanel } from "@/modules/match/components/BracketPanel";
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

  /** The home side's bracket entry, so the bracket tab opens on their path. */
  const athlete = findBracketAthlete(match.categoryId, match.home.players);

  return (
    <div className="flex flex-col gap-4">
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
                    ? "border-[#EF9F27] text-[#E3B24D]"
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
                      ? "border-[#C79A3B]/50 bg-[#C79A3B]/15 text-[#E3B24D]"
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
        <BracketPanel
          initialCategoryId={match.categoryId}
          initialParticipantId={athlete?.participant.id}
        />
      ) : subTab === "ringkasan" ? (
        <>
          <ScoreTable match={match} />
          <MatchInfo match={match} />
        </>
      ) : (
        <EmptyState>
          Belum ada riwayat pertemuan antara {sideName(match.home.players)} dan{" "}
          {sideName(match.away.players)}.
        </EmptyState>
      )}
    </div>
  );
}
