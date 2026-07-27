"use client";

import { useState } from "react";
import {
  buildRallyRows,
  sideName,
  type MatchDetail,
  type MatchSideKey,
  type RallyRow,
} from "@/lib/constants/matches";
import  ShuttleIcon  from "../../../../public/images/match/ShuttleIcon.svg";
import Image from "next/image";

/** Point badge; the two sides keep their own colour throughout the list. */
const badgeTheme: Record<MatchSideKey, string> = {
  home: "border-[#02F5D4]/35 bg-[#02F5D4]/15 text-[#5CFCE7]",
  away: "border-[#FB2C36]/35 bg-[#FB2C36]/15 text-[#FF8A90]",
};

function PointBadge({ side, value }: { side: MatchSideKey; value: string }) {
  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums ${badgeTheme[side]}`}
    >
      {value}
    </span>
  );
}

/**
 * One recorded rally: the badge sits on the scoring side, the shuttlecock on the
 * side that served it, and the score in the middle with the point just won lit.
 */
function RallyLine({ row }: { row: RallyRow }) {
  const scoredHome = row.scorer === "home";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 odd:bg-white/[0.015]">
      <div className="flex items-center justify-end gap-2">
        {scoredHome && <PointBadge side="home" value={`+${row.gained}`} />}
        {row.server === "home" && (
          <Image src={ShuttleIcon} alt="Shuttle Icon" />
        )}
      </div>

      <p className="flex items-baseline gap-1.5 text-sm font-bold tabular-nums">
        <span className={scoredHome ? "text-[#02F5D4]" : "text-white"}>
          {row.home}
        </span>
        <span className="text-[#5A5A63]">–</span>
        <span className={!scoredHome ? "text-[#02F5D4]" : "text-white"}>
          {row.away}
        </span>
      </p>

      <div className="flex items-center justify-start gap-2">
        {row.server === "away" && (
          <Image src={ShuttleIcon} alt="Shuttle Icon" />
        )}
        {!scoredHome && <PointBadge side="away" value={`+${row.gained}`} />}
      </div>
    </div>
  );
}

function LegendItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#7A7A83]">
      {children}
    </span>
  );
}

/**
 * "Sejarah Pertandingan": the rally-by-rally log the admin dashboard records
 * live, one set at a time.
 */
export function PointHistory({ match }: { match: MatchDetail }) {
  const [set, setSet] = useState(0);

  if (match.history.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-sm text-[#7A7A83]">
        Riwayat poin belum dicatat untuk pertandingan ini.
      </div>
    );
  }

  const current = match.history[Math.min(set, match.history.length - 1)];
  const rows = buildRallyRows(current);

  return (
    <div className="flex flex-col gap-4">
      {/* Set selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {match.history.map((_, index) => {
          const isActive = index === set;
          return (
            <button
              key={index}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSet(index)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-[#C79A3B]/50 bg-[#C79A3B]/15 text-[#E3B24D]"
                  : "border-white/[0.06] bg-white/[0.03] text-[#8A8A93] hover:text-white"
              }`}
            >
              Set {index + 1}
            </button>
          );
        })}
      </div>

      <h3 className="text-center text-[13px] font-bold uppercase tracking-wider text-[#E3B24D]">
        Poin demi poin — Set {set + 1}
      </h3>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <div className="divide-y divide-white/[0.04]">
          {rows.map((row, index) => (
            <RallyLine key={index} row={row} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendItem>
          <PointBadge side="home" value="+N" />
          Poin {sideName(match.home.players)}
        </LegendItem>
        <LegendItem>
          <PointBadge side="away" value="+N" />
          Poin {sideName(match.away.players)}
        </LegendItem>
        <LegendItem>
          <Image src={ShuttleIcon} alt="Shuttle Icon" />
          Pemegang servis
        </LegendItem>
      </div>
    </div>
  );
}
