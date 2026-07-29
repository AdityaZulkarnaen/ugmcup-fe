import Link from "next/link";
import type { Match } from "@/lib/types";
import { ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface LiveScoreCardProps {
  match: Match;
}

function GameBoxes({ home, away }: { home: number; away: number }) {
  const homeWon = home >= away;
  const box =
    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold tabular-nums transition-colors";
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`${box} ${homeWon
          ? "bg-[#02F5D4]/15 text-[#34E5A6]"
          : "bg-white/[0.04] text-[#8A8A93]"
          }`}
      >
        {home}
      </span>
      <span
        className={`${box} ${!homeWon
          ? "bg-[#02F5D4]/15text-[#34E5A6]"
          : "bg-white/[0.04] text-[#8A8A93]"
          }`}
      >
        {away}
      </span>
    </div>
  );
}

export function LiveScoreCard({ match }: LiveScoreCardProps) {
  const isTeamMatch = match.matchType === "TEAM";

  // Calculations for Team Match
  const childMatches = match.childMatches ?? [];
  const finishedChildren = childMatches.filter(
    (c) => c.status === "FINISHED" || c.status === "RETIRED"
  );
  const winsA = finishedChildren.filter(
    (c) => c.winnerTeamId && c.winnerTeamId === match.teamAId
  ).length;
  const winsB = finishedChildren.filter(
    (c) => c.winnerTeamId && c.winnerTeamId === match.teamBId
  ).length;

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

  const homeLeading = displayScoreA >= displayScoreB;

  // Names
  const instA =
    match.participantA?.institution?.name ||
    match.teamA?.institution?.name ||
    "Tim A";
  const athletesA =
    match.participantA?.athletes?.map((a) => a.athlete?.name).filter(Boolean) ?? [];

  const instB =
    match.participantB?.institution?.name ||
    match.teamB?.institution?.name ||
    "Tim B";
  const athletesB =
    match.participantB?.athletes?.map((a) => a.athlete?.name).filter(Boolean) ?? [];

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${instA} vs ${instB}`}
      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] transition-all hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05] sm:px-6 sm:py-5"
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            LIVE
          </span>
          <span className="text-white/25">·</span>
          <span className="truncate rounded-full border border-[#C79A3B]/40 bg-[#C79A3B]/[0.08] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E3B24D]">
            {match.discipline?.name || (isTeamMatch ? "Beregu" : "Badminton")}
          </span>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-[#7A7A83]">
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
                <p key={idx} className="truncate text-base font-bold leading-tight text-white">
                  {name}
                </p>
              ))
            ) : (
              <p className="truncate text-base font-bold leading-tight text-white">
                {instA}
              </p>
            )}

            {!isTeamMatch && (
              <p className="mt-1 truncate text-xs text-[#7A7A83]">
                {instA}
              </p>
            )}
            {isTeamMatch && (
              <p className="mt-1 text-xs font-medium text-emerald-400">
                {winsA} Partai Dimenangkan
              </p>
            )}
          </div>
        </div>

        {/* Score & Progress Center */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span
              className={`text-4xl font-black tabular-nums sm:text-5xl ${displayScoreA > displayScoreB
                ? "text-[#34E5A6]"
                : displayScoreA === displayScoreB && displayScoreA > 0
                  ? "text-[#34E5A6]"
                  : "text-white"
                }`}
            >
              {displayScoreA}
            </span>
            <span className="text-2xl font-black text-[#5A5A63] sm:text-3xl">:</span>
            <span
              className={`text-4xl font-black tabular-nums sm:text-5xl ${displayScoreB > displayScoreA
                ? "text-[#34E5A6]"
                : displayScoreA === displayScoreB && displayScoreB > 0
                  ? "text-[#34E5A6]"
                  : "text-[#8A8A93]"
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
                  <GameBoxes key={s.id} home={s.scoreA} away={s.scoreB} />
                ))}
                <span className="ml-1 text-xs font-medium text-[#7A7A83]">
                  Set {activeSetNumber}
                </span>
              </div>

              {/* Progress Segment Bars (Game 1 / Game 2 / Game 3) */}
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-1 w-6 rounded-full transition-colors ${step === activeSetNumber
                        ? "bg-[#EF9F27]"
                        : step < activeSetNumber
                          ? "bg-white/25"
                          : "bg-white/10"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#8A8A93]">
                  Game {activeSetNumber}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#FAC775]">
                {finishedChildren.length} / {childMatches.length || 5} Partai Selesai
              </span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0 sm:text-right">
          <div className="min-w-0">
            {!isTeamMatch && athletesB.length > 0 ? (
              athletesB.map((name, idx) => (
                <p key={idx} className="truncate text-base font-bold leading-tight text-white sm:text-right">
                  {name}
                </p>
              ))
            ) : (
              <p className="truncate text-base font-bold leading-tight text-white sm:text-right">
                {instB}
              </p>
            )}

            {!isTeamMatch && (
              <p className="mt-1 truncate text-xs text-[#7A7A83] sm:text-right">
                {instB}
              </p>
            )}
            {isTeamMatch && (
              <p className="mt-1 text-xs font-medium text-emerald-400">
                {winsB} Partai Dimenangkan
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
                  className={`h-1 w-8 rounded-full ${isFinishedChild ? "bg-[#34E5A6]" : "bg-white/[0.08]"
                    }`}
                />
              );
            })}
          </div>
          <span className="text-xs font-medium text-[#7A7A83]">
            Partai {finishedChildren.length + 1}
          </span>
        </div>
      )}

      {/* Tap affordance */}
      <div className="mt-4 flex items-center justify-end gap-1 border-t border-white/[0.06] pt-3 text-xs font-semibold text-[#E3B24D]">
        Lihat detail pertandingan
        <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
