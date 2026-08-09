import Link from "next/link";
import type { Match } from "@/lib/types";
import { ChevronIcon, CourtIcon } from "@/components/ui/icons";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { resolveInstLabel } from "@/lib/utils/resolveInstLabel";

interface LiveScoreCardProps {
  match: Match;
  isLight?: boolean;
}

function GameBoxes({
  home,
  away,
  isLight = false,
}: {
  home: number;
  away: number;
  isLight?: boolean;
}) {
  const homeWon = home >= away;
  const box =
    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold tabular-nums transition-colors";
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`${box} ${
          homeWon
            ? isLight
              ? "bg-[#8b5cf6]/10 text-[#8b5cf6]"
              : "bg-[#02F5D4]/15 text-[#5CFCE7]"
            : isLight
              ? "bg-[rgba(0,0,0,0.04)] text-[#94a3b8]"
              : "bg-white/[0.04] text-[#8A8A93]"
        }`}
      >
        {home}
      </span>
      <span
        className={`${box} ${
          !homeWon
            ? isLight
              ? "bg-[#8b5cf6]/10 text-[#8b5cf6]"
              : "bg-[#02F5D4]/15 text-[#5CFCE7]"
            : isLight
              ? "bg-[rgba(0,0,0,0.04)] text-[#94a3b8]"
              : "bg-white/[0.04] text-[#8A8A93]"
        }`}
      >
        {away}
      </span>
    </div>
  );
}

export function LiveScoreCard({ match, isLight = false }: LiveScoreCardProps) {
  const isTeamMatch = match.matchType === "TEAM";

  // Calculations for Team Match
  const childMatches = match.childMatches ?? [];
  const finishedChildren = childMatches.filter(
    (c) => c.status === "FINISHED" || c.status === "RETIRED"
  );
  const winsA = finishedChildren.filter((c) => {
    if (c.winnerTeamId) return c.winnerTeamId === match.teamAId;
    if (c.winnerParticipantId) return c.winnerParticipantId === c.participantAId;
    const sets = c.sets ?? [];
    const wA = sets.filter((s) => s.scoreA > s.scoreB).length;
    const wB = sets.filter((s) => s.scoreB > s.scoreA).length;
    return wA > wB || (c.status === "FINISHED" && wA >= wB && wA > 0);
  }).length;

  const winsB = finishedChildren.filter((c) => {
    if (c.winnerTeamId) return c.winnerTeamId === match.teamBId;
    if (c.winnerParticipantId) return c.winnerParticipantId === c.participantBId;
    const sets = c.sets ?? [];
    const wA = sets.filter((s) => s.scoreA > s.scoreB).length;
    const wB = sets.filter((s) => s.scoreB > s.scoreA).length;
    return wB > wA || (c.status === "FINISHED" && wB >= wA && wB > 0);
  }).length;

  // Calculations for Individual Match
  const sets = match.sets ?? [];
  const activeSet = sets.length > 0 ? sets[sets.length - 1] : null;
  const activeSetNumber = activeSet ? activeSet.setNumber : 1;
  const liveScoreA = activeSet ? activeSet.scoreA : 0;
  const liveScoreB = activeSet ? activeSet.scoreB : 0;
  const finishedSets = sets.length > 1
    ? sets.slice(0, -1)
    : sets.filter((s) => s.isFinished);

  // Scores to display in center
  const displayScoreA = isTeamMatch ? winsA : liveScoreA;
  const displayScoreB = isTeamMatch ? winsB : liveScoreB;

  // Names
  const rawInstA = match.teamA?.institution?.name || "Tim A";
  const instA =
    resolveInstLabel(match.participantA, rawInstA, match.disciplineId) || rawInstA;
  const athletesA =
    match.participantA?.athletes?.map((a) => a.athlete?.name).filter(Boolean) ?? [];

  const rawInstB = match.teamB?.institution?.name || "Tim B";
  const instB =
    resolveInstLabel(match.participantB, rawInstB, match.disciplineId) || rawInstB;
  const athletesB =
    match.participantB?.athletes?.map((a) => a.athlete?.name).filter(Boolean) ?? [];

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${instA} vs ${instB}`}
      className={`group block rounded-2xl border px-4 py-4 transition-all sm:px-6 sm:py-5 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.04)] hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
          : "border-white/[0.06] bg-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05]"
      }`}
    >
      {/* Top row: status + court */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          {/* LIVE label */}
          <span
            className={`flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase ${
              isLight ? "text-[#FB2C36]" : "text-white"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FB2C36]" />
            </span>
            Live
          </span>

          <span
            className={`text-xs font-bold tracking-[-3px] ${
              isLight ? "text-[rgba(26,22,43,0.2)]" : "text-white/25"
            }`}
          >
            ·
          </span>

          {/* Category pill */}
          <CategoryPill isLight={isLight}>
            {match.discipline?.name || (isTeamMatch ? "Beregu" : "Badminton")}
          </CategoryPill>
        </div>

        {/* Court badge */}
        <span
          className={`flex items-center gap-1.5 text-xs ${
            isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
          }`}
        >
          <CourtIcon />
          {match.courtNumber ? `Lapangan ${match.courtNumber}` : "TBA"}
        </span>
      </div>

      {/* Main row */}
      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        {/* Home */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0">
          <div className="min-w-0">
            {!isTeamMatch && athletesA.length > 0 ? (
              athletesA.map((name, idx) => (
                <p key={idx} className={`truncate text-base font-bold leading-tight ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                  {name}
                </p>
              ))
            ) : (
              <p className={`truncate text-base font-bold leading-tight ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                {instA}
              </p>
            )}

            {!isTeamMatch && (
              <p className={`mt-1 truncate text-xs ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"}`}>
                {instA}
              </p>
            )}
            {isTeamMatch && (
              <p className="mt-1 text-xs font-medium text-emerald-400">
                {winsA} Match Dimenangkan
              </p>
            )}
          </div>
        </div>

        {/* Score & Progress Center */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span
              className={`text-4xl font-black tabular-nums sm:text-5xl ${
                displayScoreA > displayScoreB
                  ? isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                  : displayScoreA === displayScoreB && displayScoreA > 0
                    ? isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                    : isLight ? "text-[#1a162b]" : "text-white"
              }`}
            >
              {displayScoreA}
            </span>
            <span className={`text-2xl font-black sm:text-3xl ${isLight ? "text-[rgba(128,128,128,0.5)]" : "text-[#5A5A63]"}`}>:</span>
            <span
              className={`text-4xl font-black tabular-nums sm:text-5xl ${
                displayScoreB > displayScoreA
                  ? isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                  : displayScoreA === displayScoreB && displayScoreB > 0
                    ? isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                    : isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#8A8A93]"
              }`}
            >
              {displayScoreB}
            </span>
          </div>

          {!isTeamMatch ? (
            <div className="mt-3 flex flex-col items-center gap-3">
              {/* Set boxes + Active Set label */}
              <div className="flex items-center gap-2">
                {finishedSets.map((s) => (
                  <GameBoxes key={s.id} home={s.scoreA} away={s.scoreB} isLight={isLight} />
                ))}
                <span className={`ml-1 text-xs font-medium ${isLight ? "text-[#8b5cf6]" : "text-[#7A7A83]"}`}>
                  Set {activeSetNumber}
                </span>
              </div>

              {/* Progress Segment Bars (Game 1 / Game 2 / Game 3) */}
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-1 w-6 rounded-full transition-colors ${
                        step === activeSetNumber
                          ? isLight ? "bg-[#8b5cf6]" : "bg-[#02F5D4]"
                          : step < activeSetNumber
                            ? isLight ? "bg-[rgba(0,0,0,0.15)]" : "bg-white/25"
                            : isLight ? "bg-[rgba(0,0,0,0.06)]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-semibold ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#8A8A93]"}`}>
                  Game {activeSetNumber}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs font-semibold ${isLight ? "text-[#6C47D1]" : "text-[#5CFCE7]"}`}>
                {finishedChildren.length} / {childMatches.length || 5} Match Selesai
              </span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0 sm:text-right">
          <div className="min-w-0">
            {!isTeamMatch && athletesB.length > 0 ? (
              athletesB.map((name, idx) => (
                <p key={idx} className={`truncate text-base font-bold leading-tight sm:text-right ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                  {name}
                </p>
              ))
            ) : (
              <p className={`truncate text-base font-bold leading-tight sm:text-right ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                {instB}
              </p>
            )}

            {!isTeamMatch && (
              <p className={`mt-1 truncate text-xs sm:text-right ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"}`}>
                {instB}
              </p>
            )}
            {isTeamMatch && (
              <p className="mt-1 text-xs font-medium text-emerald-400">
                {winsB} Match Dimenangkan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Progress bar (for team match only) */}
      {isTeamMatch && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((idx) => {
              const isFinishedChild = idx <= finishedChildren.length;
              return (
                <span
                  key={idx}
                  className={`h-1 w-8 rounded-full ${
                    isFinishedChild
                      ? isLight ? "bg-[#8b5cf6]" : "bg-[#02F5D4]"
                      : isLight ? "bg-[rgba(0,0,0,0.08)]" : "bg-white/[0.08]"
                  }`}
                />
              );
            })}
          </div>
          <span className={`text-xs font-medium ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"}`}>
            Match {finishedChildren.length + 1}
          </span>
        </div>
      )}

      {/* Tap affordance */}
      <div
        className={`mt-4 flex items-center justify-end gap-1 border-t pt-3 text-xs font-semibold ${
          isLight
            ? "border-[rgba(0,0,0,0.06)] text-[#8b5cf6]"
            : "border-white/[0.06] text-[#02F5D4]"
        }`}
      >
        Lihat detail pertandingan
        <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
