import Link from "next/link";
import {
  disciplineLabel,
  sideName,
  type LiveMatch,
} from "@/lib/constants/matches";
import { ArrowIcon, ChevronIcon, CourtIcon } from "@/components/ui/icons";

interface LiveScoreCardProps {
  match: LiveMatch;
  /** If true, renders the Figma Light Mode palette. */
  isLight?: boolean;
}

/** One live score box pair (home over away) shown under the main score. */
function GameBoxes({
  home,
  away,
  isLight,
}: {
  home: number;
  away: number;
  isLight: boolean;
}) {
  const homeWon = home >= away;
  const box =
    "flex h-6 w-7 items-center justify-center rounded-md text-xs font-bold tabular-nums";
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
  const homeLeading = match.live.home >= match.live.away;

  /** Leading score color — violet in light mode, mint in dark. */
  const leadingColor = isLight ? "text-[#8b5cf6]" : "text-[#34E5A6]";
  /** Trailing score color. */
  const trailingColor = isLight ? "text-[#94a3b8]" : "text-[#8A8A93]";

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      aria-label={`Statistik ${sideName(match.home.players)} vs ${sideName(match.away.players)}`}
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
          <span
            className={`truncate rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25px] ${
              isLight
                ? "border-[#fee685] bg-[#fffbeb] text-[#bb4d00]"
                : "border-[#C79A3B]/40 bg-[#C79A3B]/[0.08] text-[#E3B24D]"
            }`}
          >
            {disciplineLabel(match.categoryId)} {match.level}
          </span>
        </div>

        {/* Court badge */}
        <span
          className={`flex items-center gap-1.5 text-xs ${
            isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
          }`}
        >
          <CourtIcon />
          {match.court}
        </span>
      </div>

      {/* Main row: home · score · away */}
      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        {/* Home */}
        <div className="flex items-center justify-between gap-3 sm:block sm:min-w-0">
          <div className="min-w-0">
            {match.home.players.map((name) => (
              <p
                key={name}
                className={`truncate text-base font-bold leading-tight ${
                  isLight ? "text-[#1a162b]" : "text-white"
                }`}
              >
                {name}
              </p>
            ))}
            <p
              className={`mt-1 text-xs ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              {match.home.team}
            </p>
          </div>
          {/* Mobile score */}
          <span
            className={`shrink-0 text-3xl font-black tabular-nums sm:hidden ${
              homeLeading ? leadingColor : trailingColor
            }`}
          >
            {match.live.home}
          </span>
        </div>

        {/* Score — sm+ trio */}
        <div className="order-last flex flex-col items-center sm:order-0">
          <div className="hidden items-baseline gap-3 sm:flex">
            <span
              className={`text-4xl font-black tabular-nums ${
                homeLeading ? leadingColor : trailingColor
              }`}
            >
              {match.live.home}
            </span>
            <span
              className={`text-2xl font-light ${
                isLight ? "text-[rgba(128,128,128,0.5)]" : "text-[#5A5A63]"
              }`}
            >
              :
            </span>
            <span
              className={`text-4xl font-black tabular-nums ${
                !homeLeading ? leadingColor : trailingColor
              }`}
            >
              {match.live.away}
            </span>
          </div>

          {/* Game boxes + set label */}
          <div className="flex items-center gap-2 sm:mt-2">
            {match.games.map((game, i) => (
              <GameBoxes
                key={i}
                home={game.home}
                away={game.away}
                isLight={isLight}
              />
            ))}
            <span
              className={`ml-1 text-xs font-medium ${
                isLight ? "text-[#ef9f27]" : "text-[#7A7A83]"
              }`}
            >
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
                className={`flex items-center justify-start gap-1.5 truncate text-base font-bold leading-tight sm:justify-end ${
                  isLight ? "text-[#1a162b]" : "text-white"
                }`}
              >
                {name}
                {i === 0 && (
                  <ArrowIcon
                    className={`shrink-0 ${
                      isLight ? "text-[#8b5cf6]" : "text-[#34E5A6]"
                    }`}
                  />
                )}
              </p>
            ))}
            <p
              className={`mt-1 text-xs ${
                isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
              }`}
            >
              {match.away.team}
            </p>
          </div>
          {/* Mobile score */}
          <span
            className={`shrink-0 text-3xl font-black tabular-nums sm:hidden ${
              !homeLeading ? leadingColor : trailingColor
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
                    ? "bg-[#EF9F27]"
                    : played
                      ? isLight
                        ? "bg-[rgba(0,0,0,0.15)]"
                        : "bg-white/25"
                      : isLight
                        ? "bg-[rgba(0,0,0,0.06)]"
                        : "bg-white/[0.06]"
                }`}
              />
            );
          })}
        </div>
        <span
          className={`text-xs font-semibold ${
            isLight ? "text-[#ef9f27]" : "text-[#7A7A83]"
          }`}
        >
          Game {match.currentGame}
        </span>
      </div>

      {/* Tap affordance */}
      <div
        className={`mt-4 flex items-center justify-end gap-1 border-t pt-3 text-xs font-semibold ${
          isLight
            ? "border-[rgba(0,0,0,0.06)] text-[#8b5cf6]"
            : "border-white/[0.06] text-[#E3B24D]"
        }`}
      >
        Lihat statistik
        <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
