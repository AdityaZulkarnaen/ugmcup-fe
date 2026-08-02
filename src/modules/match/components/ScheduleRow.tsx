import Link from "next/link";
import type { Match, MatchStatus } from "@/lib/types";
import { CheckIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface ScheduleRowProps {
  match: Match;
  isLight?: boolean;
}

const statusBadgeDark: Record<MatchStatus, { label: string; className: string }> = {
  ONGOING: {
    label: "LIVE",
    className: "border-[#FB2C36]/40 bg-[#FB2C36]/15 text-[#FF8A90]",
  },
  SCHEDULED: {
    label: "MENDATANG",
    className: "border-[#7C6BFF]/35 bg-[#7C6BFF]/15 text-[#B4A9FF]",
  },
  FINISHED: {
    label: "SELESAI",
    className: "border-white/10 bg-white/[0.04] text-[#8A8A93]",
  },
  RETIRED: {
    label: "RETIRED",
    className: "border-white/10 bg-white/[0.04] text-[#8A8A93]",
  },
  WALK_OVER: {
    label: "WALK OVER",
    className: "border-white/10 bg-white/[0.04] text-[#8A8A93]",
  },
};

const statusBadgeLight: Record<MatchStatus, { label: string; className: string }> = {
  ONGOING: {
    label: "LIVE",
    className: "border-[#FB2C36]/30 bg-[#FB2C36]/08 text-[#FB2C36]",
  },
  SCHEDULED: {
    label: "MENDATANG",
    className: "border-[#8b5cf6]/30 bg-[#8b5cf6]/08 text-[#8b5cf6]",
  },
  FINISHED: {
    label: "SELESAI",
    className: "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[#808080]",
  },
  RETIRED: {
    label: "RETIRED",
    className: "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[#808080]",
  },
  WALK_OVER: {
    label: "WALK OVER",
    className: "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[#808080]",
  },
};

function SideName({
  name,
  subName,
  won,
  align,
  isLight = false,
}: {
  name: string;
  subName?: string;
  won: boolean;
  align: "left" | "right";
  isLight?: boolean;
}) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col ${
        align === "right" ? "items-start sm:items-end text-left sm:text-right" : "items-start text-left"
      }`}
    >
      <p
        title={name}
        className={`flex w-full min-w-0 items-center gap-1.5 text-sm font-bold leading-tight ${
          align === "right" ? "justify-start sm:justify-end" : "justify-start"
        } ${
          won
            ? isLight
              ? "text-[#8b5cf6]"
              : "text-[#34E5A6]"
            : isLight
              ? "text-[#1a162b]"
              : "text-white"
        }`}
      >
        {won && align === "right" && (
          <CheckIcon
            className={`shrink-0 ${isLight ? "text-[#8b5cf6]" : "text-[#34E5A6]"}`}
          />
        )}
        <span className="min-w-0 truncate">{name}</span>
        {won && align === "left" && (
          <CheckIcon
            className={`shrink-0 ${isLight ? "text-[#8b5cf6]" : "text-[#34E5A6]"}`}
          />
        )}
      </p>
      {subName && (
        <span
          title={subName}
          className={`block w-full min-w-0 truncate text-[11px] ${
            isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
          }`}
        >
          {subName}
        </span>
      )}
    </div>
  );
}

export function ScheduleRow({ match, isLight = false }: ScheduleRowProps) {
  const isTeamMatch = match.matchType === "TEAM";
  const badgeMap = isLight ? statusBadgeLight : statusBadgeDark;
  const badge = badgeMap[match.status] || badgeMap.SCHEDULED;
  const isLive = match.status === "ONGOING";

  // Team / Participant A
  const nameA =
    match.participantA?.institution?.name ||
    match.teamA?.institution?.name ||
    "Tim A";
  const subA =
    match.participantA?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ") || undefined;
  const wonA =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantAId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamAId);

  // Team / Participant B
  const nameB =
    match.participantB?.institution?.name ||
    match.teamB?.institution?.name ||
    "Tim B";
  const subB =
    match.participantB?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ") || undefined;
  const wonB =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantBId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamBId);

  // Team calculations
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

  const sets = match.sets ?? [];
  const setScoreSummary = isTeamMatch
    ? finishedChildren.length > 0
      ? `${winsA} - ${winsB}`
      : "5 Match Beregu"
    : sets.length > 0
      ? sets.map((s) => `${s.scoreA}-${s.scoreB}`).join(" · ")
      : null;

  const statusPill = (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
    >
      {isLive && (
        <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FB2C36] animate-pulse" />
        </span>
      )}
      {badge.label}
    </span>
  );

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${nameA} vs ${nameB}`}
      className={`group relative block overflow-hidden rounded-xl border py-3 pl-4 pr-3 transition-all sm:py-3.5 sm:pl-6 sm:pr-4 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05]"
      }`}
    >
      {isLive && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FB2C36]" />
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Meta + players — jam tidak dicetak di sini, sudah jadi header grup */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isLight
                  ? "border-[#D9D3FF] bg-[#F3F0FF] text-[#6C47D1]"
                  : "border-[#8B5CF6]/40 bg-[#8B5CF6]/12 text-[#C4B5FD]"
              }`}
            >
              {match.discipline?.name || (isTeamMatch ? "Beregu" : "Badminton")}
            </span>
            <span
              className={`text-[11px] font-medium ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              {match.roundName || match.stage}
            </span>
            <span
              className={`flex items-center gap-1 text-[11px] ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              <CourtIcon />
              {match.courtNumber ? `Lapangan ${match.courtNumber}` : "TBA"}
            </span>
            <span className="ml-auto sm:hidden">{statusPill}</span>
          </div>

          {/* Names */}
          <div className="mt-1.5 flex flex-col gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
            <SideName name={nameA} subName={isTeamMatch ? undefined : subA} won={wonA} align="left" isLight={isLight} />

            <div className="order-last flex items-center gap-2 sm:order-none sm:flex-col sm:gap-0">
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  isLight ? "text-[rgba(26,22,43,0.25)]" : "text-[#5A5A63]"
                }`}
              >
                vs
              </span>
              {setScoreSummary && (
                <span
                  className={`text-[10px] font-medium tabular-nums sm:mt-0.5 ${
                    isLight ? "text-[rgba(26,22,43,0.35)]" : "text-[#6B6B73]"
                  }`}
                >
                  {setScoreSummary}
                </span>
              )}
            </div>

            <SideName name={nameB} subName={isTeamMatch ? undefined : subB} won={wonB} align="right" isLight={isLight} />
          </div>
        </div>

        {/* Status column */}
        <div className="hidden w-28 shrink-0 justify-end sm:flex">
          {statusPill}
        </div>

        {/* Chevron */}
        <ChevronIcon
          className={`shrink-0 transition-all ${
            isLight
              ? "text-[rgba(26,22,43,0.25)] group-hover:translate-x-0.5 group-hover:text-[#8b5cf6]"
              : "text-[#5A5A63] group-hover:translate-x-0.5 group-hover:text-[#34E5A6]"
          }`}
        />
      </div>
    </Link>
  );
}
