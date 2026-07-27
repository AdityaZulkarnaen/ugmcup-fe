import {
  setsWon,
  sideName,
  type MatchDetail,
  type MatchSide,
} from "@/lib/constants/matches";
import { CheckIcon } from "@/components/ui/icons";
import { SideEmblem } from "./SideEmblem";

const headCell =
  "px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83]";

/** One competitor row: name, sets won, then the score of each set. */
function ScoreRow({
  side,
  scores,
  total,
  won,
  decided,
  opponentScores,
}: {
  side: MatchSide;
  scores: number[];
  total: number;
  /** Leading, or the winner once the match is over. */
  won: boolean;
  /** Match is finished, so the lead can be marked with a check. */
  decided: boolean;
  opponentScores: number[];
}) {
  return (
    <tr
      className={`border-t border-white/[0.04] ${won ? "bg-[#34E5A6]/[0.07]" : ""}`}
    >
      <td className="relative px-4 py-3">
        {/* Green accent + tint marks the winning side */}
        {won && (
          <span className="absolute inset-y-0 left-0 w-0.5 bg-[#34E5A6]" />
        )}
        <div className="flex items-center gap-2.5">
          <SideEmblem players={side.players} />
          <span
            className={`truncate text-sm font-medium ${
              won ? "font-bold text-[#34E5A6]" : "text-white"
            }`}
          >
            {sideName(side.players)}
          </span>
          {won && decided && (
            <CheckIcon className="shrink-0 text-[#34E5A6]" />
          )}
        </div>
      </td>
      <td
        className={`px-2 py-3 text-center text-sm font-bold tabular-nums ${
          won ? "text-[#34E5A6]" : "text-[#6B6B73]"
        }`}
      >
        {total}
      </td>
      {scores.map((score, i) => (
        <td
          key={i}
          className={`px-2 py-3 text-center text-sm tabular-nums ${
            score > opponentScores[i] ? "text-white" : "text-[#5A5A63]"
          }`}
        >
          {score}
        </td>
      ))}
    </tr>
  );
}

export function ScoreTable({ match }: { match: MatchDetail }) {
  const homeScores = match.sets.map((set) => set.home);
  const awayScores = match.sets.map((set) => set.away);
  const homeTotal = setsWon(match.sets, "home");
  const awayTotal = setsWon(match.sets, "away");
  const decided = match.status === "done";

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06]">
      <h2 className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
        Skor
      </h2>

      {match.sets.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-[#7A7A83]">
          Pertandingan belum dimulai, skor belum tersedia.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-md">
            <thead>
              <tr>
                <th className={`${headCell} text-center`}>Tim / Atlet</th>
                <th className={`${headCell} w-14 text-center text-[#E3B24D]`}>
                  Total
                </th>
                {match.sets.map((set, i) => (
                  <th key={i} className={`${headCell} w-14 text-center`}>
                    Set {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ScoreRow
                side={match.home}
                scores={homeScores}
                opponentScores={awayScores}
                total={homeTotal}
                won={homeTotal > awayTotal}
                decided={decided}
              />
              <ScoreRow
                side={match.away}
                scores={awayScores}
                opponentScores={homeScores}
                total={awayTotal}
                won={awayTotal > homeTotal}
                decided={decided}
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
