import Link from "next/link";
import type { Match, MatchStatus } from "@/lib/types";
import { CheckIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface ScheduleRowProps {
  match: Match;
}

const statusBadge: Record<MatchStatus, { label: string; className: string }> = {
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
};

function SideName({
  name,
  subName,
  won,
  align,
}: {
  name: string;
  subName?: string;
  won: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-col ${align === "right" ? "items-start sm:items-end text-left sm:text-right" : "items-start text-left"
        }`}
    >
      <p
        className={`flex items-center gap-1.5 text-sm font-bold leading-tight ${won ? "text-[#34E5A6]" : "text-white"
          }`}
      >
        {won && align === "right" && <CheckIcon className="shrink-0 text-[#34E5A6]" />}
        <span className="truncate">{name}</span>
        {won && align === "left" && <CheckIcon className="shrink-0 text-[#34E5A6]" />}
      </p>
      {subName && <span className="truncate text-[11px] text-[#7A7A83]">{subName}</span>}
    </div>
  );
}

export function ScheduleRow({ match }: ScheduleRowProps) {
  const isTeamMatch = match.matchType === "TEAM";
  const badge = statusBadge[match.status] || statusBadge.SCHEDULED;
  const isLive = match.status === "ONGOING";

  // Time format
  let timeStr = "TBA";
  if (match.scheduledTime) {
    try {
      const d = new Date(match.scheduledTime);
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      timeStr = `${hours}:${minutes}`;
    } catch {
      timeStr = "TBA";
    }
  }

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
      : "5 Partai Beregu"
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
      className="group relative block overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-4 pr-3 transition-all hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05] sm:py-3.5 sm:pl-6 sm:pr-4"
    >
      {isLive && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FB2C36]" />
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Time */}
        <span className="hidden w-12 shrink-0 text-sm font-bold tabular-nums text-white sm:block">
          {timeStr}
        </span>

        {/* Meta + players */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold tabular-nums text-white sm:hidden">
              {timeStr}
            </span>
            <span className="rounded-full border border-[#C79A3B]/40 bg-[#C79A3B]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E3B24D]">
              {match.discipline?.name || (isTeamMatch ? "Beregu" : "Badminton")}
            </span>
            <span className="text-[11px] font-medium text-[#7A7A83]">
              {match.roundName || match.stage}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#7A7A83]">
              <CourtIcon />
              {match.courtNumber ? `Lapangan ${match.courtNumber}` : "TBA"}
            </span>
            <span className="ml-auto sm:hidden">{statusPill}</span>
          </div>

          {/* Names */}
          <div className="mt-1.5 flex flex-col gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
            <SideName name={nameA} subName={isTeamMatch ? undefined : subA} won={wonA} align="left" />

            <div className="order-last flex items-center gap-2 sm:order-none sm:flex-col sm:gap-0">
              <span className="hidden text-[11px] font-medium text-[#5A5A63] sm:block">
                vs
              </span>
              {setScoreSummary && (
                <span className="text-[10px] font-medium tabular-nums text-[#FAC775] sm:mt-0.5">
                  {setScoreSummary}
                </span>
              )}
            </div>

            <SideName name={nameB} subName={isTeamMatch ? undefined : subB} won={wonB} align="right" />
          </div>
        </div>

        {/* Status */}
        <div className="hidden w-28 shrink-0 justify-end sm:flex">
          {statusPill}
        </div>

        <ChevronIcon className="shrink-0 text-[#5A5A63] transition-all group-hover:translate-x-0.5 group-hover:text-[#E3B24D]" />
      </div>
    </Link>
  );
}
