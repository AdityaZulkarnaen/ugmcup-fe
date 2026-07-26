import type { LiveMatch } from "@/lib/constants/matches";
import { ArrowIcon, CourtIcon } from "@/components/ui/icons";

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
    <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] transition-colors hover:border-white/10">
      {/* Top row: status + court */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            LIVE
          </span>
          <span className="text-white/25">·</span>
          <span className="rounded-full border border-[#C79A3B]/40 bg-[#C79A3B]/[0.08] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E3B24D]">
            {match.category}
          </span>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-[#7A7A83]">
          <CourtIcon />
          {match.court}
        </span>
      </div>

      {/* Main row: home · score · away */}
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Home */}
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

        {/* Score */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-3">
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

          <div className="mt-2 flex items-center gap-2">
            {match.games.map((game, i) => (
              <GameBoxes key={i} home={game.home} away={game.away} />
            ))}
            <span className="ml-1 text-xs font-medium text-[#7A7A83]">
              {match.setLabel}
            </span>
          </div>
        </div>

        {/* Away */}
        <div className="min-w-0 text-right">
          {match.away.players.map((name, i) => (
            <p
              key={`${name}-${i}`}
              className="flex items-center justify-end gap-1.5 truncate text-base font-bold leading-tight text-white"
            >
              {name}
              {i === 0 && <ArrowIcon className="shrink-0 text-[#34E5A6]" />}
            </p>
          ))}
          <p className="mt-1 text-xs text-[#7A7A83]">{match.away.team}</p>
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
    </article>
  );
}
