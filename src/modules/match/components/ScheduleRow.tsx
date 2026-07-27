import {
  sideName,
  type ScheduleMatch,
  type ScheduleStatus,
} from "@/lib/constants/matches";
import { CheckIcon, CourtIcon } from "@/components/ui/icons";

interface ScheduleRowProps {
  match: ScheduleMatch;
}

const statusBadge: Record<ScheduleStatus, { label: string; className: string }> =
  {
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

/** Player names for one side, joined the way the schedule list shows them. */
function SideName({
  players,
  won,
  align,
}: {
  players: string[];
  won: boolean;
  align: "left" | "right";
}) {
  return (
    <p
      className={`flex min-w-0 items-center gap-1.5 text-sm font-bold leading-tight ${
        align === "right" ? "justify-end text-right" : "justify-start"
      } ${won ? "text-[#34E5A6]" : "text-white"}`}
    >
      {won && align === "right" && (
        <CheckIcon className="shrink-0 text-[#34E5A6]" />
      )}
      <span className="truncate">{sideName(players)}</span>
      {won && align === "left" && (
        <CheckIcon className="shrink-0 text-[#34E5A6]" />
      )}
    </p>
  );
}

export function ScheduleRow({ match }: ScheduleRowProps) {
  const badge = statusBadge[match.status];
  const isLive = match.status === "live";

  return (
    <article className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] pl-6 pr-4 py-3.5 transition-colors hover:border-white/30 hover:cursor-pointer">
      {/* Left accent, red while the match is running */}
      {isLive && (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FB2C36]" />
      )}

      <div className="flex items-center gap-4">
        {/* Time */}
        <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-white">
          {match.time}
        </span>

        {/* Meta + players */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#C79A3B]/40 bg-[#C79A3B]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E3B24D]">
              {match.category}
            </span>
            <span className="text-[11px] font-medium text-[#7A7A83]">
              {match.level}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#7A7A83]">
              <CourtIcon />
              {match.court}
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <SideName
              players={match.home.players}
              won={match.winner === "home"}
              align="left"
            />

            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-[#5A5A63]">vs</span>
              {match.games && match.games.length > 0 && (
                <span className="mt-0.5 text-[10px] tabular-nums text-[#6B6B73]">
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
            />
          </div>
        </div>

        {/* Status — fixed width so the centre "vs" lines up across every row */}
        <div className="flex w-28 shrink-0 justify-end">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
          >
            {isLive && (
              <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
                {/* <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-80" /> */}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FB2C36]" />
              </span>
            )}
            {badge.label}
          </span>
        </div>
      </div>
    </article>
  );
}
