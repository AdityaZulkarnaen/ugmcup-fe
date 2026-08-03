import type { Match } from "@/lib/types";
import { getMatchSideDetails } from "./MatchScoreboard";


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
  isLight,
}: {
  name: string;
  subName?: string;
  logoUrl?: string;
  scores: number[];
  total: number;
  won: boolean;
  decided: boolean;
  opponentScores: number[];
  isLight: boolean;
}) {
  const winnerBg = isLight ? "bg-[#8B5CF6]/[0.07]" : "bg-[#02F5D4]/[0.07]";
  const winnerBar = isLight ? "bg-[#8B5CF6]" : "bg-[#02F5D4]";
  const winnerNameColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const defaultNameColor = isLight ? "text-[#1a162b]" : "text-white";
  const logoBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/10";
  const logoBg = isLight ? "bg-[rgba(0,0,0,0.02)]" : "bg-white/[0.04]";
  const logoFallback = isLight ? "text-[#9ca3af]" : "text-gray-400";
  const totalWon = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const totalLost = isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]";
  const scoreWin = isLight ? "text-[#1a162b] font-bold" : "text-white font-bold";
  const scoreLoss = isLight ? "text-[rgba(26,22,43,0.35)]" : "text-[#5A5A63]";

  return (
    <tr
      className={`border-t ${isLight ? "border-[rgba(0,0,0,0.05)]" : "border-white/[0.04]"} ${won ? winnerBg : ""}`}
    >
      <td className="relative px-3 py-3 sm:px-4">
        {won && (
          <span className={`absolute inset-y-0 left-0 w-0.5 ${winnerBar}`} />
        )}
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${logoBorder} ${logoBg}`}>
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              <span className={`text-xs font-bold ${logoFallback}`}>?</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`truncate text-xs font-semibold sm:text-sm ${won ? winnerNameColor : defaultNameColor}`}
              >
                {name}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td
        className={`${numberColumn} px-1.5 py-3 text-center text-sm font-bold tabular-nums sm:px-2 ${won ? totalWon : totalLost}`}
      >
        {total}
      </td>
      {scores.map((score, i) => (
        <td
          key={i}
          className={`${numberColumn} px-1.5 py-3 text-center text-sm tabular-nums sm:px-2 ${
            score > opponentScores[i] ? scoreWin : scoreLoss
          }`}
        >
          {score}
        </td>
      ))}
    </tr>
  );
}

export function ScoreTable({
  match,
  parentMatch,
  isLight = false,
}: {
  match: Match;
  parentMatch?: Match;
  isLight?: boolean;
}) {
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

  // Light/dark tokens
  const cardBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]";
  const headingBorder = isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.06]";
  const headingBg = isLight ? "bg-[rgba(0,0,0,0.02)]" : "bg-white/[0.03]";
  const headingColor = isLight ? "text-[#1a162b]" : "text-white";
  const colHeaderColor = isLight ? "text-[rgba(26,22,43,0.45)]" : "text-[#7A7A83]";
  const totalHeaderColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const emptyColor = isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]";

  const headCell = `px-1.5 py-2 text-[10px] font-bold uppercase tracking-wider sm:px-2 ${colHeaderColor}`;

  return (
    <section className={`overflow-hidden rounded-xl border ${cardBorder} transition-all duration-300`}>
      <h2 className={`border-b ${headingBorder} ${headingBg} px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${headingColor}`}>
        SKOR
      </h2>

      {sets.length === 0 ? (
        <p className={`px-4 py-6 text-center text-sm ${emptyColor}`}>
          Pertandingan belum dimulai, skor belum tersedia.
        </p>
      ) : (
        <div className="scrollbar-thumb-only overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className={`${headCell} text-center pl-4`}>TIM / ATLET</th>
                <th
                  className={`${headCell} ${numberColumn} text-center ${totalHeaderColor}`}
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
                isLight={isLight}
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
                isLight={isLight}
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
