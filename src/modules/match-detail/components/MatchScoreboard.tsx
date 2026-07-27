import {
  setsWon,
  sideName,
  type MatchDetail,
  type MatchSide,
} from "@/lib/constants/matches";
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

function SideColumn({ side, category }: { side: MatchSide; category: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <SideEmblem players={side.players} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-white">
          {sideName(side.players)}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-[#8A8A93]">{category}</p>
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
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-7">
      <p className="text-center text-[13px] font-bold text-white">
        {match.startsAt}
      </p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-4 sm:gap-8">
        <SideColumn side={match.home} category={match.category} />

        <div className="flex flex-col items-center pt-3">
          <p className="flex items-baseline gap-2.5">
            <span
              className={`text-4xl font-black tabular-nums ${
                !level && home > away ? "text-[#02F5D4]" : "text-white"
              }`}
            >
              {home}
            </span>
            <span className="text-2xl font-black text-[#5A5A63]">:</span>
            <span
              className={`text-4xl font-black tabular-nums ${
                !level && away > home ? "text-[#02F5D4]" : "text-white"
              }`}
            >
              {away}
            </span>
          </p>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#E3B24D]">
            {statusLine(match)}
          </p>
        </div>

        <SideColumn side={match.away} category={match.category} />
      </div>
    </section>
  );
}
