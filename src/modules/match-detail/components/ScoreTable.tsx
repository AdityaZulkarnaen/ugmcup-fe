import {
  setsWon,
  sideName,
  type MatchDetail,
  type MatchSide,
} from "@/lib/constants/matches";
import { SideEmblem } from "./SideEmblem";

const headCell =
  "px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83]";

/** One competitor row: name, sets won, then the score of each set. */
function ScoreRow({
  side,
  scores,
  total,
  won,
  opponentScores,
}: {
  side: MatchSide;
  scores: number[];
  total: number;
  won: boolean;
  opponentScores: number[];
}) {
  return (
    <tr className="border-t border-white/[0.04]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <SideEmblem players={side.players} />
          <span className="truncate text-sm font-medium text-white">
            {sideName(side.players)}
          </span>
        </div>
      </td>
      <td
        className={`px-2 py-3 text-center text-sm font-bold tabular-nums ${
          won ? "text-[#02F5D4]" : "text-[#6B6B73]"
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
              />
              <ScoreRow
                side={match.away}
                scores={awayScores}
                opponentScores={homeScores}
                total={awayTotal}
                won={awayTotal > homeTotal}
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
