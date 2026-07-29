import type { Match } from "@/lib/types";
import { getMatchSideDetails } from "./MatchScoreboard";


const headCell =
  "px-1.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83] sm:px-2";
const numberColumn = "w-10 sm:w-14";

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function ScoreRow({
  name,
  subName,
  logoUrl,
  scores,
  total,
  won,
  decided,
  opponentScores,
}: {
  name: string;
  subName?: string;
  logoUrl?: string;
  scores: number[];
  total: number;
  won: boolean;
  decided: boolean;
  opponentScores: number[];
}) {
  return (
    <tr
      className={`border-t border-white/[0.04] ${won ? "bg-[#34E5A6]/[0.07]" : ""}`}
    >
      <td className="relative px-3 py-3 sm:px-4">
        {won && (
          <span className="absolute inset-y-0 left-0 w-0.5 bg-[#34E5A6]" />
        )}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-400">?</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`truncate text-xs font-semibold sm:text-sm ${won ? "text-[#34E5A6]" : "text-white"
                  }`}
              >
                {name}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td
        className={`px-1.5 py-3 text-center text-sm font-bold tabular-nums sm:px-2 ${won ? "text-[#34E5A6]" : "text-[#6B6B73]"
          }`}
      >
        {total}
      </td>
      {scores.map((score, i) => (
        <td
          key={i}
          className={`px-1.5 py-3 text-center text-sm tabular-nums sm:px-2 ${score > opponentScores[i] ? "text-white font-bold" : "text-[#5A5A63]"
            }`}
        >
          {score}
        </td>
      ))}
    </tr>
  );
}

export function ScoreTable({ match, parentMatch }: { match: Match; parentMatch?: Match }) {
  const sets = match.sets ?? [];

  const homeScores = sets.map((s) => s.scoreA);
  const awayScores = sets.map((s) => s.scoreB);

  let homeTotal = sets.filter((s) => s.scoreA > s.scoreB).length;
  let awayTotal = sets.filter((s) => s.scoreB > s.scoreA).length;

  const decided = match.status === "FINISHED" || match.status === "RETIRED";

  const { nameA, subA, logoA, nameB, subB, logoB } = getMatchSideDetails(match, parentMatch);
  const wonA =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantAId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamAId);

  const wonB =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantBId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamBId);

  if (decided && homeTotal === 0 && awayTotal === 0) {
    if (wonA) homeTotal = 2;
    if (wonB) awayTotal = 2;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06]">
      <h2 className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
        SKOR
      </h2>

      {sets.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-[#7A7A83]">
          Pertandingan belum dimulai, skor belum tersedia.
        </p>
      ) : (
        <div className="scrollbar-thumb-only overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className={`${headCell} text-center pl-4`}>TIM / ATLET</th>
                <th
                  className={`${headCell} ${numberColumn} text-center text-[#34E5A6]`}
                >
                  TOTAL
                </th>
                {sets.map((set, i) => (
                  <th
                    key={i}
                    className={`${headCell} ${numberColumn} text-center`}
                  >
                    SET {set.setNumber}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ScoreRow
                name={nameA}
                subName={subA}
                logoUrl={logoA}
                scores={homeScores}
                opponentScores={awayScores}
                total={homeTotal}
                won={wonA}
                decided={decided}
              />
              <ScoreRow
                name={nameB}
                subName={subB}
                logoUrl={logoB}
                scores={awayScores}
                opponentScores={homeScores}
                total={awayTotal}
                won={wonB}
                decided={decided}
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
