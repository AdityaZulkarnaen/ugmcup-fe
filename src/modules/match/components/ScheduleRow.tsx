import Link from "next/link";
import {
  disciplineLabel,
  sideName,
  type ScheduleMatch,
  type ScheduleStatus,
} from "@/lib/constants/matches";
import { CheckIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface ScheduleRowProps {
  match: ScheduleMatch;
  isLight?: boolean;
}

/** Status badge styles for both themes. */
const statusBadgeDark: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  live: {
    label: "LIVE",
    className: "border-[#FB2C36]/40 bg-[#FB2C36]/15 text-[#FF8A90]",
  },
  upcoming: {
    label: "MENDATANG",
    className: "border-[#7C6BFF]/35 bg-[#7C6BFF]/15 text-[#B4A9FF]",
  },
  done: {
    label: "SELESAI",
    className: "border-white/10 bg-white/[0.04] text-[#8A8A93]",
  },
};

const statusBadgeLight: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  live: {
    label: "LIVE",
    className:
      "border-[#FB2C36]/30 bg-[#FB2C36]/08 text-[#FB2C36]",
  },
  upcoming: {
    label: "MENDATANG",
    className: "border-[#8b5cf6]/30 bg-[#8b5cf6]/08 text-[#8b5cf6]",
  },
  done: {
    label: "SELESAI",
    className:
      "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[#808080]",
  },
};

/** Player names for one side. */
function SideName({
  players,
  won,
  align,
  isLight,
}: {
  players: string[];
  won: boolean;
  align: "left" | "right";
  isLight: boolean;
}) {
  return (
    <p
      className={`flex min-w-0 items-center gap-1.5 text-sm font-bold leading-tight ${
        align === "right"
          ? "justify-start text-left sm:justify-end sm:text-right"
          : "justify-start"
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
      <span className="truncate">{sideName(players)}</span>
      {won && align === "left" && (
        <CheckIcon
          className={`shrink-0 ${isLight ? "text-[#8b5cf6]" : "text-[#34E5A6]"}`}
        />
      )}
    </p>
  );
}

export function ScheduleRow({ match, isLight = false }: ScheduleRowProps) {
  const badge = isLight
    ? statusBadgeLight[match.status]
    : statusBadgeDark[match.status];
  const isLive = match.status === "live";

  const statusPill = (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
    >
      {isLive && (
        <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FB2C36]" />
        </span>
      )}
      {badge.label}
    </span>
  );

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${sideName(match.home.players)} vs ${sideName(match.away.players)}`}
      className={`group relative block overflow-hidden rounded-xl border py-3 pl-4 pr-3 transition-all sm:py-3.5 sm:pl-6 sm:pr-4 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05]"
      }`}
    >
      {/* Left accent stripe while live */}
      {isLive && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FB2C36]" />
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Time */}
        <span
          className={`hidden w-12 shrink-0 text-sm font-bold tabular-nums sm:block ${
            isLight ? "text-[#1a162b]" : "text-white"
          }`}
        >
          {match.time}
        </span>

        {/* Meta + players */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`text-sm font-bold tabular-nums sm:hidden ${
                isLight ? "text-[#1a162b]" : "text-white"
              }`}
            >
              {match.time}
            </span>
            {/* Category pill */}
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isLight
                  ? "border-[#D9D3FF] bg-[#F3F0FF] text-[#6C47D1]"
                  : "border-[#8B5CF6]/40 bg-[#8B5CF6]/12 text-[#C4B5FD]"
              }`}
            >
              {disciplineLabel(match.categoryId)}
            </span>
            <span
              className={`text-[11px] font-medium ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              {match.level}
            </span>
            <span
              className={`flex items-center gap-1 text-[11px] ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              <CourtIcon />
              {match.court}
            </span>
            <span className="ml-auto sm:hidden">{statusPill}</span>
          </div>

          {/* Names */}
          <div className="mt-1.5 flex flex-col gap-0.5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
            <SideName
              players={match.home.players}
              won={match.winner === "home"}
              align="left"
              isLight={isLight}
            />

            <div className="order-last flex items-center gap-2 sm:order-none sm:flex-col sm:gap-0">
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  isLight ? "text-[rgba(26,22,43,0.25)]" : "text-[#5A5A63]"
                }`}
              >
                vs
              </span>
              {match.games && match.games.length > 0 && (
                <span
                  className={`text-[10px] tabular-nums sm:mt-0.5 ${
                    isLight ? "text-[rgba(26,22,43,0.35)]" : "text-[#6B6B73]"
                  }`}
                >
                  {match.games
                    .map((game) => `${game.home}-${game.away}`)
                    .join(" · ")}
                </span>
              )}
            </div>

            <SideName
              players={match.away.players}
              won={match.winner === "away"}
              align="right"
              isLight={isLight}
            />
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
