import Link from "next/link";
import {
  disciplineLabel,
  sideName,
  type LiveMatch,
} from "@/lib/constants/matches";
import { ArrowIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface LiveScoreCardProps {
  match: LiveMatch;
}

/** One live score box pair (home over away) shown under the main score. */
function GameBoxes({ home, away }: { home: number; away: number }) {
  const homeWon = home >= away;
  const box =
    "flex h-6 w-7 items-center justify-center rounded-md text-xs font-bold tabular-nums";
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`${box} ${
          homeWon
            ? "bg-[#02F5D4]/15 text-[#5CFCE7]"
            : "bg-white/[0.04] text-[#8A8A93]"
        }`}
      >
        {home}
      </span>
      <span
        className={`${box} ${
          !homeWon
            ? "bg-[#02F5D4]/15 text-[#5CFCE7]"
            : "bg-white/[0.04] text-[#8A8A93]"
        }`}
      >
        {away}
      </span>
    </div>
  );
}

export function LiveScoreCard({ match }: LiveScoreCardProps) {
  const homeLeading = match.live.home >= match.live.away;

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${sideName(match.home.players)} vs ${sideName(match.away.players)}`}
      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] transition-all hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.995] active:border-white/30 active:bg-white/[0.05] sm:px-6 sm:py-5"
    >
      {/* Top row: status + court — wraps rather than squeezing the long badges */}
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
            {disciplineLabel(match.categoryId)} {match.level}
          </span>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-[#7A7A83]">
          <CourtIcon />
          {match.court}
        </span>
      </div>

      {/*
        Main row. On mobile the two sides stack, each with its own score on the
        right, so the names keep the full width; from sm up it becomes the
        familiar home · score · away trio.
      */}
      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        {/* Home */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0">
          <div className="min-w-0">
            {match.home.players.map((name) => (
              <p
                key={name}
                className="truncate text-base font-bold leading-tight text-white"
              >
                {name}
              </p>
            ))}
            <p className="mt-1 text-xs text-[#7A7A83]">{match.home.team}</p>
          </div>
          <span
            className={`shrink-0 text-3xl font-black tabular-nums sm:hidden ${
              homeLeading ? "text-[#34E5A6]" : "text-[#8A8A93]"
            }`}
          >
            {match.live.home}
          </span>
        </div>

        {/* Score — the big pair belongs to the sm+ trio; games sit under it */}
        <div className="order-last flex flex-col items-center sm:order-0">
          <div className="hidden items-baseline gap-3 sm:flex">
            <span
              className={`text-4xl font-black tabular-nums ${
                homeLeading ? "text-[#34E5A6]" : "text-[#8A8A93]"
              }`}
            >
              {match.live.home}
            </span>
            <span className="text-2xl font-black text-[#5A5A63]">:</span>
            <span
              className={`text-4xl font-black tabular-nums ${
                !homeLeading ? "text-[#34E5A6]" : "text-[#8A8A93]"
              }`}
            >
              {match.live.away}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:mt-2">
            {match.games.map((game, i) => (
              <GameBoxes key={i} home={game.home} away={game.away} />
            ))}
            <span className="ml-1 text-xs font-medium text-[#7A7A83]">
              {match.setLabel}
            </span>
          </div>
        </div>

        {/* Away */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0 sm:text-right">
          <div className="min-w-0">
            {match.away.players.map((name, i) => (
              <p
                key={`${name}-${i}`}
                className="flex items-center justify-start gap-1.5 truncate text-base font-bold leading-tight text-white sm:justify-end"
              >
                {name}
                {i === 0 && <ArrowIcon className="shrink-0 text-[#34E5A6]" />}
              </p>
            ))}
            <p className="mt-1 text-xs text-[#7A7A83]">{match.away.team}</p>
          </div>
          <span
            className={`shrink-0 text-3xl font-black tabular-nums sm:hidden ${
              !homeLeading ? "text-[#34E5A6]" : "text-[#8A8A93]"
            }`}
          >
            {match.live.away}
          </span>
        </div>
      </div>

      {/* Game progress bar */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: match.totalGames }).map((_, i) => {
            const gameNumber = i + 1;
            const played = gameNumber < match.currentGame;
            const current = gameNumber === match.currentGame;
            return (
              <span
                key={i}
                className={`h-1 w-10 rounded-full ${
                  current
                    ? "bg-[#F5A524]"
                    : played
                      ? "bg-white/25"
                      : "bg-white/[0.06]"
                }`}
              />
            );
          })}
        </div>
        <span className="text-xs font-medium text-[#7A7A83]">
          Game {match.currentGame}
        </span>
      </div>

      {/* Always-visible tap affordance, so touch screens do not rely on hover */}
      <div className="mt-4 flex items-center justify-end gap-1 border-t border-white/[0.06] pt-3 text-xs font-semibold text-[#E3B24D]">
        Lihat statistik
        <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
