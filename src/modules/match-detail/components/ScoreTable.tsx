import {
  setsWon,
  sideName,
  type MatchDetail,
  type MatchSide,
} from "@/lib/constants/matches";
import { CheckIcon } from "@/components/ui/icons";
import { SideEmblem } from "./SideEmblem";

const headCell =
  "px-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83] sm:px-2";

/** Narrow enough that two sides and three sets fit a 360px screen unscrolled. */
const numberColumn = "w-10 sm:w-14";

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
      <td className="relative px-3 py-3 sm:px-4">
        {/* Green accent + tint marks the winning side */}
        {won && (
          <span className="absolute inset-y-0 left-0 w-0.5 bg-[#34E5A6]" />
        )}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dropped on phones so the name keeps the width it needs */}
          <span className="hidden shrink-0 sm:block">
            <SideEmblem players={side.players} />
          </span>
          <span
            className={`min-w-0 truncate text-xs font-medium sm:text-sm ${
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
        className={`px-1.5 py-3 text-center text-sm font-bold tabular-nums sm:px-2 ${
          won ? "text-[#34E5A6]" : "text-[#6B6B73]"
        }`}
      >
        {total}
      </td>
      {scores.map((score, i) => (
        <td
          key={i}
          className={`px-1.5 py-3 text-center text-sm tabular-nums sm:px-2 ${
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
        <div className="scrollbar-thumb-only overflow-x-auto">
          {/* Fixed layout so the name column absorbs the leftover width and
              truncates rather than pushing the set columns out of view; the
              scroll wrapper only kicks in once a long match adds set columns */}
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className={`${headCell} text-center`}>Tim / Atlet</th>
                <th
                  className={`${headCell} ${numberColumn} text-center text-[#E3B24D]`}
                >
                  Total
                </th>
                {match.sets.map((set, i) => (
                  <th
                    key={i}
                    className={`${headCell} ${numberColumn} text-center`}
                  >
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
