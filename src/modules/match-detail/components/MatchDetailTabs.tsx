"use client";

import { useEffect, useState, useCallback } from "react";
import type { Match } from "@/lib/types";
import { getMatch } from "@/lib/api/matches";
import { useMatchRoom, useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";
import { MatchScoreboard } from "./MatchScoreboard";
import { PointHistory } from "./PointHistory";
import { ScoreTable } from "./ScoreTable";
import { MatchInfo } from "./MatchInfo";
import { BracketPanel } from "@/modules/match/components/BracketPanel";
import { ChevronIcon } from "@/components/ui/icons";

const tabs = [
  { id: "pertandingan", label: "Pertandingan" },
  { id: "bracket", label: "Bracket" },
];

const subTabs = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "sejarah", label: "Sejarah Pertandingan" },
];

export function formatSlotLabel(slotType?: string, index?: number): string {
  if (!slotType) return index !== undefined ? `Partai ${index + 1}` : "Partai";

  const customMap: Record<string, string> = {
    TUNGGAL_1: "Tunggal 1",
    GANDA_1: "Ganda 1",
    TUNGGAL_2: "Tunggal 2",
    GANDA_2: "Ganda 2",
    TUNGGAL_3: "Tunggal 3",
    GANDA_PUTRA: "Ganda Putra",
    GANDA_PUTRI: "Ganda Putri",
    TRIPLE_MIX: "Triple Mix",
    TUNGGAL_PUTRA: "Tunggal Putra",
    TUNGGAL_PUTRI: "Tunggal Putri",
    GANDA_CAMPURAN: "Ganda Campuran",
  };

  const name =
    customMap[slotType] ||
    slotType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return index !== undefined ? `${name}` : name;
}

function SubMatchCard({
  subMatch,
  parentMatch,
  index,
  isSelected,
  onSelect,
}: {
  subMatch: Match;
  parentMatch: Match;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const label = formatSlotLabel(subMatch.slotType, index);

  const sets = subMatch.sets ?? [];
  const isFinished = subMatch.status === "FINISHED" || subMatch.status === "RETIRED";
  const isOngoing = subMatch.status === "ONGOING";

  // Winner logic
  const setsWonA = sets.filter((s) => s.scoreA > s.scoreB).length;
  const setsWonB = sets.filter((s) => s.scoreB > s.scoreA).length;
  const winnerTeamId = subMatch.winnerTeamId;

  const teamAWon =
    (winnerTeamId && winnerTeamId === parentMatch.teamAId) ||
    (subMatch.winnerParticipantId && subMatch.winnerParticipantId === subMatch.participantAId) ||
    (isFinished && setsWonA > setsWonB);

  const teamBWon =
    (winnerTeamId && winnerTeamId === parentMatch.teamBId) ||
    (subMatch.winnerParticipantId && subMatch.winnerParticipantId === subMatch.participantBId) ||
    (isFinished && setsWonB > setsWonA);

  const instA =
    parentMatch.teamA?.institution?.name ||
    subMatch.teamA?.institution?.name ||
    parentMatch.participantA?.institution?.name ||
    subMatch.participantA?.institution?.name ||
    "Tim A";
  const instB =
    parentMatch.teamB?.institution?.name ||
    subMatch.teamB?.institution?.name ||
    parentMatch.participantB?.institution?.name ||
    subMatch.participantB?.institution?.name ||
    "Tim B";

  const namesA = instA;
  const namesB = instB;

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-4 transition-all ${isSelected
        ? "border-[#EF9F27] bg-[#EF9F27]/10"
        : "border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        }`}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E3B24D]">
          {label}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isOngoing
            ? "bg-red-500/20 text-red-400 animate-pulse"
            : isFinished
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-white/10 text-gray-400"
            }`}
        >
          {isOngoing ? "LIVE" : isFinished ? "SELESAI" : "MENDATANG"}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="py-2 pl-3 text-left font-bold uppercase tracking-wider text-[#7A7A83]">Tim / Atlet</th>
              <th className="w-7 py-2 text-center font-bold text-[#7A7A83]">1</th>
              <th className="w-7 py-2 text-center font-bold text-[#7A7A83]">2</th>
              <th className="w-7 py-2 text-center font-bold text-[#7A7A83]">3</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr className={`${teamAWon ? "bg-[#34E5A6]/[0.07]" : ""}`}>
              <td className="py-2 pl-3 pr-2">
                <span
                  className={`block max-w-[140px] truncate font-semibold ${teamAWon ? "text-[#34E5A6]" : "text-white"
                    }`}
                  title={namesA}
                >
                  {namesA}
                </span>
              </td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[0]?.scoreA > sets[0]?.scoreB ? "text-white" : "text-white/60"}`}>{sets[0]?.scoreA ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[1]?.scoreA > sets[1]?.scoreB ? "text-white" : "text-white/60"}`}>{sets[1]?.scoreA ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[2]?.scoreA > sets[2]?.scoreB ? "text-white" : "text-white/60"}`}>{sets[2]?.scoreA ?? "-"}</td>
            </tr>
            <tr className={`${teamBWon ? "bg-[#34E5A6]/[0.07]" : ""}`}>
              <td className="py-2 pl-3 pr-2">
                <span
                  className={`block max-w-[140px] truncate font-semibold ${teamBWon ? "text-[#34E5A6]" : "text-white"
                    }`}
                  title={namesB}
                >
                  {namesB}
                </span>
              </td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[0]?.scoreB > sets[0]?.scoreA ? "text-white" : "text-white/60"}`}>{sets[0]?.scoreB ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[1]?.scoreB > sets[1]?.scoreA ? "text-white" : "text-white/60"}`}>{sets[1]?.scoreB ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[2]?.scoreB > sets[2]?.scoreA ? "text-white" : "text-white/60"}`}>{sets[2]?.scoreB ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] font-bold text-[#E3B24D] group-hover:underline">
        <span>Detail</span>
        <ChevronIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function MatchDetailTabs({ initialMatch }: { initialMatch: Match }) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [tab, setTab] = useState(tabs[0].id);
  const [subTab, setSubTab] = useState(subTabs[0].id);
  const [selectedSubMatchId, setSelectedSubMatchId] = useState<string | null>(
    null
  );

  const isTeamMatch = match.matchType === "TEAM";

  const childMatches = match.childMatches ?? [];
  const selectedSubMatch = childMatches.find((c) => c.id === selectedSubMatchId);

  // Active match to render detail for
  const activeMatchForDetail = selectedSubMatch || match;

  const { lastScore: activeScore, isFinished: activeFinished } = useMatchRoom(activeMatchForDetail.id);
  const { lastScore: parentScore, isFinished: parentFinished } = useMatchRoom(match.id);
  const { lastUpdate } = useGlobalPanitiaRoom();

  const refreshMatch = useCallback(async () => {
    try {
      const updated = await getMatch(match.id);
      if (updated) setMatch(updated);
    } catch (e) {
      console.error("Gagal me-refresh match detail:", e);
    }
  }, [match.id]);

  useEffect(() => {
    refreshMatch();
  }, [activeScore, activeFinished, parentScore, parentFinished, lastUpdate, refreshMatch]);

  // Polling fallback every 4 seconds to stream real-time updates seamlessly
  useEffect(() => {
    const interval = setInterval(refreshMatch, 4000);
    return () => clearInterval(interval);
  }, [refreshMatch]);

  return (
    <div className="flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-4xl font-black italic text-white sm:text-6xl lg:text-7xl">
          Statistik Pertandingan
        </h1>
        <p className="mt-3 text-sm text-[#8A8A93] sm:text-base">
          {tab === "bracket"
            ? "Posisi pertandingan ini pada bagan knockout kategorinya."
            : subTab === "sejarah"
              ? "Alur perolehan poin dan riwayat pergerakan servis sepanjang laga."
              : "Ringkasan hasil akhir, skor per set, dan lokasi pertandingan."}
        </p>
      </header>

      {/* Submatch Selector for Team Matches */}
      {isTeamMatch && childMatches.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedSubMatchId(null)}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${selectedSubMatchId === null
              ? "border-[#EF9F27] bg-[#EF9F27]/20 text-[#FAC775]"
              : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white"
              }`}
          >
            Ringkasan
          </button>
          {childMatches.map((child, index) => {
            const isSelected = child.id === selectedSubMatchId;
            const label = formatSlotLabel(child.slotType, index);
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedSubMatchId(child.id)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${isSelected
                  ? "border-[#EF9F27] bg-[#EF9F27]/20 text-[#FAC775]"
                  : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <MatchScoreboard match={activeMatchForDetail} parentMatch={selectedSubMatch ? match : undefined} />
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
                className={`-mb-px border-b-2 px-5 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${isActive
                  ? "border-[#EF9F27] text-[#E3B24D]"
                  : "border-transparent text-[#6B6B73] hover:text-white"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sub tabs */}
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
                  className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${isActive
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
        <div className="mt-2">
          <BracketPanel
            initialDisciplineId={match.disciplineId}
            initialLevel={
              match.participantA?.institution?.type === "SMA" || match.teamA?.institution?.type === "SMA"
                ? "sma"
                : "univ"
            }
            highlightParticipantId={match.participantAId || match.participantBId || match.teamAId || match.teamBId}
          />
        </div>
      ) : subTab === "ringkasan" ? (
        <>
          {/* If Team Match and viewing overall Beregu summary, show the 5 Submatch Cards Grid */}
          {isTeamMatch && selectedSubMatchId === null ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E3B24D]">
                Daftar Partai Beregu
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {childMatches.map((child, index) => (
                  <SubMatchCard
                    key={child.id}
                    subMatch={child}
                    parentMatch={match}
                    index={index}
                    isSelected={child.id === selectedSubMatchId}
                    onSelect={() => setSelectedSubMatchId(child.id)}
                  />
                ))}
              </div>
              <MatchInfo match={match} />
            </div>
          ) : (
            <>
              <ScoreTable match={activeMatchForDetail} parentMatch={match} />
              <MatchInfo match={activeMatchForDetail} />
            </>
          )}
        </>
      ) : (
        <PointHistory match={activeMatchForDetail} parentMatch={match} />
      )}
    </div>
  );
}
