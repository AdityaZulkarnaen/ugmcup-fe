import Link from "next/link";
import type { Match } from "@/lib/types";
import { TrophyIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ScheduleRowProps {
  match: Match;
  isLight?: boolean;
}

/** Set score pill: "21 – 16" — winner score tinted, loser dimmed. */
function SetPip({
  scoreA,
  scoreB,
  isLight,
}: {
  scoreA: number;
  scoreB: number;
  isLight: boolean;
}) {
  const aWon = scoreA > scoreB;
  return (
    <div
      className={`flex items-center gap-[3px] rounded-[4px] px-1.5 py-0.5 ${isLight ? "bg-[rgba(0,0,0,0.04)]" : "bg-white/[0.05]"
        }`}
    >
      <span
        className={`text-[10px] font-semibold tabular-nums leading-[15px] ${aWon
          ? isLight
            ? "text-[#8b5cf6]"
            : "text-[#02F5D4]"
          : isLight
            ? "text-[rgba(26,22,43,0.55)]"
            : "text-white/40"
          }`}
      >
        {scoreA}
      </span>
      <span
        className={`text-[9px] leading-[14px] ${isLight ? "text-[rgba(26,22,43,0.2)]" : "text-white/20"
          }`}
      >
        –
      </span>
      <span
        className={`text-[10px] font-semibold tabular-nums leading-[15px] ${!aWon
          ? isLight
            ? "text-[#8b5cf6]"
            : "text-[#02F5D4]"
          : isLight
            ? "text-[rgba(26,22,43,0.55)]"
            : "text-white/40"
          }`}
      >
        {scoreB}
      </span>
    </div>
  );
}

export function ScheduleRow({ match, isLight = false }: ScheduleRowProps) {
  const isTeamMatch = match.matchType === "TEAM";
  const isLive = match.status === "ONGOING";
  const isScheduled = match.status === "SCHEDULED";

  // Team / Participant A
  const instA =
    match.participantA?.institution?.name ||
    match.teamA?.institution?.name ||
    "Tim A";
  const athleteNamesA =
    match.participantA?.athletes
      ?.map((a) => a.athlete?.name)
      .filter(Boolean)
      .join(" - ") || undefined;
  const mainA = athleteNamesA || instA;
  const subA = athleteNamesA ? instA : undefined;

  const wonA =
    (!!match.winnerParticipantId &&
      match.winnerParticipantId === match.participantAId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamAId);

  // Team / Participant B
  const instB =
    match.participantB?.institution?.name ||
    match.teamB?.institution?.name ||
    "Tim B";
  const athleteNamesB =
    match.participantB?.athletes
      ?.map((a) => a.athlete?.name)
      .filter(Boolean)
      .join(" - ") || undefined;
  const mainB = athleteNamesB || instB;
  const subB = athleteNamesB ? instB : undefined;

  const wonB =
    (!!match.winnerParticipantId &&
      match.winnerParticipantId === match.participantBId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamBId);

  // Team match child calculations
  const childMatches = match.childMatches ?? [];
  const finishedChildren = childMatches.filter(
    (c) => c.status === "FINISHED" || c.status === "RETIRED"
  );
  const winsA = finishedChildren.filter((c) => {
    if (c.winnerTeamId) return c.winnerTeamId === match.teamAId;
    if (c.winnerParticipantId) return c.winnerParticipantId === c.participantAId;
    const s = c.sets ?? [];
    const wA = s.filter((x) => x.scoreA > x.scoreB).length;
    const wB = s.filter((x) => x.scoreB > x.scoreA).length;
    return wA > wB || (c.status === "FINISHED" && wA >= wB && wA > 0);
  }).length;

  const winsB = finishedChildren.filter((c) => {
    if (c.winnerTeamId) return c.winnerTeamId === match.teamBId;
    if (c.winnerParticipantId) return c.winnerParticipantId === c.participantBId;
    const s = c.sets ?? [];
    const wA = s.filter((x) => x.scoreA > x.scoreB).length;
    const wB = s.filter((x) => x.scoreB > x.scoreA).length;
    return wB > wA || (c.status === "FINISHED" && wB >= wA && wB > 0);
  }).length;

  // Individual set calculations
  const sets = match.sets ?? [];
  let setsWonA = sets.filter((s) => s.scoreA > s.scoreB).length;
  let setsWonB = sets.filter((s) => s.scoreB > s.scoreA).length;

  if (
    (match.status === "FINISHED" || match.status === "RETIRED") &&
    setsWonA === 0 &&
    setsWonB === 0
  ) {
    if (wonA) setsWonA = 2;
    if (wonB) setsWonB = 2;
  }

  // Match score (sets won or team match wins)
  const matchScoreA = isScheduled ? 0 : isTeamMatch ? winsA : setsWonA;
  const matchScoreB = isScheduled ? 0 : isTeamMatch ? winsB : setsWonB;

  // Score center colors (per Figma: winner = #02F5D4, loser = white 60%)
  const scoreColorA = isScheduled
    ? isLight
      ? "text-[rgba(26,22,43,0.4)]"
      : "text-white/30"
    : wonA || matchScoreA > matchScoreB
      ? isLight
        ? "text-[#8b5cf6]"
        : "text-[#02F5D4]"
      : isLight
        ? "text-[rgba(26,22,43,0.55)]"
        : "text-white/60";

  const scoreColorB = isScheduled
    ? isLight
      ? "text-[rgba(26,22,43,0.4)]"
      : "text-white/30"
    : wonB || matchScoreB > matchScoreA
      ? isLight
        ? "text-[#8b5cf6]"
        : "text-[#02F5D4]"
      : isLight
        ? "text-[rgba(26,22,43,0.55)]"
        : "text-white/60";

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`${mainA} vs ${mainB}`}
      className={`group relative block overflow-hidden rounded-xl border transition-all ${isLight
        ? "border-[rgba(0,0,0,0.08)] bg-white pl-5 pr-4 py-3.5 hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
        : "border-white/[0.06] bg-white/[0.04] pl-6 pr-4 py-4 hover:border-white/30 hover:bg-white/[0.06] active:scale-[0.995]"
        }`}
    >
      {/* LIVE accent stripe */}
      {isLive && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FB2C36]" />
      )}

      {/* ── Top meta row ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2.5">
        {/* Left: discipline pill + round + court */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <CategoryPill isLight={isLight}>
            {match.discipline?.name || (isTeamMatch ? "Beregu" : "Badminton")}
          </CategoryPill>
          <span
            className={`text-[11px] font-medium ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
          >
            {match.roundName || match.stage}
          </span>
          <span
            className={`flex items-center gap-1 text-[11px] ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
          >
            <CourtIcon />
            {match.courtNumber ? `Lapangan ${match.courtNumber}` : "TBA"}
          </span>
        </div>

        {/* Right: status pill + chevron */}
        <div className="flex items-center gap-3">
          <StatusBadge status={match.status} isLight={isLight} />
          <ChevronIcon
            className={`shrink-0 transition-all ${isLight
              ? "text-[rgba(26,22,43,0.25)] group-hover:translate-x-0.5 group-hover:text-[#8b5cf6]"
              : "text-white/25 group-hover:translate-x-0.5 group-hover:text-[#02F5D4]"
              }`}
          />
        </div>
      </div>

      {/* ── Main score row: [Name A] [Score] [Name B] ── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-5">

        {/* Side A — left-aligned */}
        <div className={`min-w-0 transition-opacity ${wonB ? "opacity-50" : ""}`}>
          <div className="flex items-center gap-1.5">
            <span
              title={mainA}
              className={`truncate text-[14px] font-semibold leading-snug ${wonA
                ? isLight
                  ? "text-[#8b5cf6]"
                  : "text-[#02F5D4]"
                : isLight
                  ? "text-[#1a162b]"
                  : "text-white/90"
                }`}
            >
              {mainA}
            </span>
            {wonA && (
              <TrophyIcon
                className={`shrink-0 ${isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                  }`}
              />
            )}
          </div>
          {subA && (
            <p
              title={subA}
              className={`mt-0.5 truncate text-[11px] ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-white/50"
                }`}
            >
              {subA}
            </p>
          )}
        </div>

        {/* Center — big score + set pips */}
        <div className="flex flex-col items-center gap-1.5 px-1">
          {/* Big match score */}
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black tabular-nums leading-none sm:text-3xl lg:text-4xl ${scoreColorA}`}>
              {matchScoreA}
            </span>
            <span
              className={`text-lg font-light leading-none sm:text-xl lg:text-2xl ${isLight ? "text-[rgba(26,22,43,0.2)]" : "text-white/20"
                }`}
            >
              :
            </span>
            <span className={`text-2xl font-black tabular-nums leading-none sm:text-3xl lg:text-4xl ${scoreColorB}`}>
              {matchScoreB}
            </span>
          </div>

          {/* Set pips — only if not SCHEDULED and sets exist */}
          {!isScheduled && !isTeamMatch && sets.length > 0 && (
            <div className="flex items-center gap-1">
              {sets.map((s) => (
                <SetPip
                  key={s.id}
                  scoreA={s.scoreA}
                  scoreB={s.scoreB}
                  isLight={isLight}
                />
              ))}
            </div>
          )}

          {/* Team match progress text */}
          {!isScheduled && isTeamMatch && finishedChildren.length > 0 && (
            <span
              className={`text-[10px] font-medium ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
                }`}
            >
              {finishedChildren.length}/{childMatches.length || 5} match
            </span>
          )}
        </div>

        {/* Side B — right-aligned */}
        <div className={`min-w-0 text-right transition-opacity ${wonA ? "opacity-50" : ""}`}>
          <div className="flex items-center justify-end gap-1.5">
            {wonB && (
              <TrophyIcon
                className={`shrink-0 ${isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
                  }`}
              />
            )}
            <span
              title={mainB}
              className={`truncate text-[14px] font-semibold leading-snug ${wonB
                ? isLight
                  ? "text-[#8b5cf6]"
                  : "text-[#02F5D4]"
                : isLight
                  ? "text-[#1a162b]"
                  : "text-white"
                }`}
            >
              {mainB}
            </span>
          </div>
          {subB && (
            <p
              title={subB}
              className={`mt-0.5 truncate text-[11px] ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-white/50"
                }`}
            >
              {subB}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
