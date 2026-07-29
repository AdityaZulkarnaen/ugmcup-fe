import {
  setsWon,
  sideName,
  type MatchDetail,
  type MatchSide,
} from "@/lib/constants/matches";
import { CheckIcon } from "@/components/ui/icons";
import { SideEmblem } from "./SideEmblem";

/** Gold caption under the score, phrased per match status. */
function statusLine(match: MatchDetail): string {
  if (match.status === "live") {
    return `Sedang berlangsung${match.setLabel ? ` — ${match.setLabel}` : ""}`;
  }
  if (match.status === "upcoming") return "Belum dimulai";

  const winner = match.winner ? match[match.winner] : undefined;
  return winner
    ? `Selesai / Berhenti — ${sideName(winner.players)}`
    : "Selesai / Berhenti";
}

function SideColumn({
  side,
  category,
  won,
}: {
  side: MatchSide;
  category: string;
  won: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <SideEmblem players={side.players} size="lg" />
      <div className="min-w-0">
        {/* Wrapping beats truncating here: the column is narrow on a phone and a
            half-cut name tells the reader nothing. */}
        <p
          className={`flex flex-wrap items-center justify-center gap-x-1.5 wrap-break-word text-sm font-bold sm:text-[15px] ${
            won ? "text-[#34E5A6]" : "text-white"
          }`}
        >
          {sideName(side.players)}
          {won && <CheckIcon className="shrink-0" />}
        </p>
        <p className="mt-0.5 text-xs text-[#8A8A93] sm:text-[13px]">
          {category}
        </p>
      </div>
    </div>
  );
}

export function MatchScoreboard({ match }: { match: MatchDetail }) {
  const home = setsWon(match.sets, "home");
  const away = setsWon(match.sets, "away");
  /** Nothing decided yet, so neither 0 should read as "leading". */
  const level = home === away;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 sm:px-6 sm:py-7">
      <p className="text-center text-[13px] font-bold text-white">
        {match.startsAt}
      </p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-8">
        <SideColumn
          side={match.home}
          category={match.category}
          won={match.winner === "home"}
        />

        <div className="flex flex-col items-center pt-3">
          <p className="flex items-baseline gap-2 sm:gap-2.5">
            <span
              className={`text-3xl font-black tabular-nums sm:text-4xl ${
                !level && home > away ? "text-[#34E5A6]" : "text-white"
              }`}
            >
              {home}
            </span>
            <span className="text-xl font-black text-[#5A5A63] sm:text-2xl">
              :
            </span>
            <span
              className={`text-3xl font-black tabular-nums sm:text-4xl ${
                !level && away > home ? "text-[#34E5A6]" : "text-white"
              }`}
            >
              {away}
            </span>
          </p>
          {/* Squeezed into the middle column this wraps one word per line, so on
              mobile it moves under the whole board instead. */}
          <p className="mt-2 hidden text-center text-[11px] font-bold uppercase tracking-wide text-[#34E5A6] sm:block">
            {statusLine(match)}
          </p>
        </div>

        <SideColumn
          side={match.away}
          category={match.category}
          won={match.winner === "away"}
        />
      </div>

      <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-wide text-[#34E5A6] sm:hidden">
        {statusLine(match)}
      </p>
    </section>
  );
}
