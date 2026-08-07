"use client";

import { useEffect, useState, useCallback } from "react";
import type { Match } from "@/lib/types";
import { getPublicMatch } from "@/lib/api/matches";
import { MatchScoreboard } from "./MatchScoreboard";
import { ScoreTable } from "./ScoreTable";
import { MatchInfo } from "./MatchInfo";
import { BracketPanel } from "@/modules/match/components/BracketPanel";
import { ChevronIcon, ShareIcon } from "@/components/ui/icons";
import { ShareMatchModal } from "./ShareMatchModal";

const tabs = [
  { id: "pertandingan", label: "Pertandingan" },
  { id: "bracket", label: "Bracket" },
];

const subTabs = [
  { id: "ringkasan", label: "Ringkasan" },
];

export function formatSlotLabel(slotType?: string, index?: number): string {
  if (!slotType) return index !== undefined ? `Match ${index + 1}` : "Match";

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
  isLight,
}: {
  subMatch: Match;
  parentMatch: Match;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isLight: boolean;
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

  // Light / dark token helpers
  const accentColor = isLight ? "#6C47D1" : "#02F5D4";
  const accentBg = isLight ? "bg-[#8B5CF6]/10" : "bg-[#02F5D4]/10";
  const accentBorder = isLight ? "border-[#8B5CF6]/40" : "border-[#02F5D4]";
  const cardBase = isLight
    ? "border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)]"
    : "border-white/[0.06] bg-white/[0.02]";
  const cardHover = isLight
    ? "hover:border-[rgba(0,0,0,0.18)] hover:shadow-md"
    : "hover:border-white/20 hover:bg-white/[0.04]";
  const dividerColor = isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.06]";
  const labelColor = isLight ? `text-[${accentColor}]` : "text-[#02F5D4]";
  const tableHeaderBg = isLight ? "bg-[#F9F9FB]" : "bg-white/[0.02]";
  const tableHeaderText = isLight ? "text-[#6B6B73]" : "text-[#7A7A83]";
  const tableDivide = isLight ? "divide-[rgba(0,0,0,0.05)]" : "divide-white/[0.04]";
  const nameColor = isLight ? "text-[#1a162b]" : "text-white";
  const winnerNameColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const winnerBg = isLight ? "bg-[#8B5CF6]/[0.07]" : "bg-[#02F5D4]/[0.07]";
  const scoreDefault = isLight ? "text-[#1a162b]/60" : "text-white/60";
  const scoreWin = isLight ? "text-[#1a162b] font-bold" : "text-white font-bold";
  const detailLinkColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-4 transition-all ${
        isSelected
          ? `${accentBorder} ${accentBg}`
          : `${cardBase} ${cardHover}`
      }`}
    >
      <div className={`flex items-center justify-between border-b ${dividerColor} pb-2`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>
          {label}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isOngoing
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : isFinished
                ? "bg-emerald-500/20 text-emerald-400"
                : isLight
                  ? "bg-[rgba(0,0,0,0.06)] text-[#6B6B73]"
                  : "bg-white/10 text-gray-400"
          }`}
        >
          {isOngoing ? "LIVE" : isFinished ? "SELESAI" : "MENDATANG"}
        </span>
      </div>

      <div
        className={`mt-3 overflow-hidden rounded-lg border ${dividerColor} ${
          isLight ? "bg-[#F9F9FB]" : "bg-white/[0.02]"
        }`}
      >
        <table className="w-full text-[11px]">
          <thead>
            <tr className={`border-b ${dividerColor} ${tableHeaderBg}`}>
              <th className={`py-2 pl-3 text-left font-bold uppercase tracking-wider ${tableHeaderText}`}>Tim / Atlet</th>
              <th className={`w-7 py-2 text-center font-bold ${tableHeaderText}`}>1</th>
              <th className={`w-7 py-2 text-center font-bold ${tableHeaderText}`}>2</th>
              <th className={`w-7 py-2 text-center font-bold ${tableHeaderText}`}>3</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tableDivide}`}>
            <tr className={`${teamAWon ? winnerBg : ""}`}>
              <td className="py-2 pl-3 pr-2">
                <span
                  className={`block max-w-[140px] truncate font-semibold ${
                    teamAWon ? winnerNameColor : nameColor
                  }`}
                  title={namesA}
                >
                  {namesA}
                </span>
              </td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[0]?.scoreA > sets[0]?.scoreB ? scoreWin : scoreDefault}`}>{sets[0]?.scoreA ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[1]?.scoreA > sets[1]?.scoreB ? scoreWin : scoreDefault}`}>{sets[1]?.scoreA ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[2]?.scoreA > sets[2]?.scoreB ? scoreWin : scoreDefault}`}>{sets[2]?.scoreA ?? "-"}</td>
            </tr>
            <tr className={`${teamBWon ? winnerBg : ""}`}>
              <td className="py-2 pl-3 pr-2">
                <span
                  className={`block max-w-[140px] truncate font-semibold ${
                    teamBWon ? winnerNameColor : nameColor
                  }`}
                  title={namesB}
                >
                  {namesB}
                </span>
              </td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[0]?.scoreB > sets[0]?.scoreA ? scoreWin : scoreDefault}`}>{sets[0]?.scoreB ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[1]?.scoreB > sets[1]?.scoreA ? scoreWin : scoreDefault}`}>{sets[1]?.scoreB ?? "-"}</td>
              <td className={`w-7 py-2 text-center font-mono font-bold ${sets[2]?.scoreB > sets[2]?.scoreA ? scoreWin : scoreDefault}`}>{sets[2]?.scoreB ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`mt-3 flex items-center justify-end gap-1 text-[10px] font-bold ${detailLinkColor} group-hover:underline`}>
        <span>Detail</span>
        <ChevronIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function MatchDetailTabs({
  initialMatch,
  isLight,
}: {
  initialMatch: Match;
  isLight: boolean;
}) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [tab, setTab] = useState(tabs[0].id);
  const [subTab, setSubTab] = useState(subTabs[0].id);
  const [selectedSubMatchId, setSelectedSubMatchId] = useState<string | null>(
    null
  );
  const [shareOpen, setShareOpen] = useState(false);

  const isTeamMatch = match.matchType === "TEAM";

  const childMatches = match.childMatches ?? [];
  const selectedSubMatch = childMatches.find((c) => c.id === selectedSubMatchId);

  // Active match to render detail for
  const activeMatchForDetail = selectedSubMatch || match;

  const refreshMatch = useCallback(async () => {
    try {
      const updated = await getPublicMatch(match.id);
      if (updated) setMatch(updated);
    } catch (e) {
      console.error("Gagal me-refresh match detail:", e);
    }
  }, [match.id]);

  // Polling fallback every 2 seconds to stream real-time updates seamlessly.
  // Dijeda selagi modal share terbuka supaya kartu yang sedang diatur user
  // tidak digambar ulang tiap dua detik.
  useEffect(() => {
    if (shareOpen) return;
    const interval = setInterval(refreshMatch, 2000);
    return () => clearInterval(interval);
  }, [refreshMatch, shareOpen]);

  // Light/dark token helpers for MatchDetailTabs shell
  const headingColor = isLight ? "text-[#1a162b]" : "text-white";
  const subheadingColor = isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#8A8A93]";
  const cardBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]";
  const cardBg = isLight ? "bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)]" : "bg-white/[0.02]";
  const tabBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]";
  const activeTabColor = isLight ? "border-[#8B5CF6] text-[#6C47D1]" : "border-[#02F5D4] text-[#02F5D4]";
  const inactiveTabColor = isLight ? "text-[#6B6B73] hover:text-[#1a162b]" : "text-[#6B6B73] hover:text-white";
  const pillActive = isLight
    ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#6C47D1]"
    : "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#C4B5FD]";
  const pillInactive = isLight
    ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[#6B6B73] hover:text-[#1a162b]"
    : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white";
  const bereguHeadingColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const shareButtonColor = isLight
    ? "border-[rgba(0,0,0,0.1)] bg-white text-[#6C47D1] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/[0.06]"
    : "border-white/[0.08] bg-white/[0.03] text-[#02F5D4] hover:border-[#02F5D4]/50 hover:bg-[#02F5D4]/[0.08]";

  return (
    <div className="flex flex-col gap-4">
      <header className="text-center">
        <h1 className={`text-4xl font-black italic sm:text-6xl lg:text-7xl transition-colors duration-300 ${headingColor}`}>
          Statistik Pertandingan
        </h1>
        <p className={`mt-3 text-sm sm:text-base transition-colors duration-300 ${subheadingColor}`}>
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
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
              selectedSubMatchId === null ? pillActive : pillInactive
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
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  isSelected ? pillActive : pillInactive
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${shareButtonColor}`}
          >
            <ShareIcon className="h-3.5 w-3.5" />
            Bagikan
          </button>
        </div>
        <MatchScoreboard match={activeMatchForDetail} parentMatch={selectedSubMatch ? match : undefined} isLight={isLight} />
      </div>

      {shareOpen && (
        <ShareMatchModal
          match={activeMatchForDetail}
          parentMatch={selectedSubMatch ? match : undefined}
          isLight={isLight}
          onClose={() => setShareOpen(false)}
        />
      )}

      <div className={`overflow-hidden rounded-xl border ${cardBorder} ${cardBg}`}>
        {/* Primary tabs */}
        <div
          role="tablist"
          aria-label="Bagian statistik"
          className={`flex border-b ${tabBorder}`}
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
                  isActive ? activeTabColor : `border-transparent ${inactiveTabColor}`
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
                  className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isActive ? pillActive : pillInactive
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
            isLight={isLight}
          />
        </div>
      ) : subTab === "ringkasan" ? (
        <>
          {/* If Team Match and viewing overall Beregu summary, show the 5 Submatch Cards Grid */}
          {isTeamMatch && selectedSubMatchId === null ? (
            <div className="flex flex-col gap-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${bereguHeadingColor}`}>
                Daftar Match Beregu
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
                    isLight={isLight}
                  />
                ))}
              </div>
              <MatchInfo match={match} isLight={isLight} />
            </div>
          ) : (
            <>
              <ScoreTable match={activeMatchForDetail} parentMatch={match} isLight={isLight} />
              <MatchInfo match={activeMatchForDetail} isLight={isLight} />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
