"use client";

import { useState } from "react";
import {
  buildRallyRows,
  sideName,
  type MatchDetail,
  type RallyRow,
} from "@/lib/constants/matches";
import  ShuttleIcon  from "../../../../public/images/match/ShuttleIcon.svg";
import Image from "next/image";

/**
 * Lead badge. The colour is about the direction of the lead, not about which
 * side holds it: teal while it grows, red once the trailing side starts closing
 * the gap.
 */
function LeadBadge({ margin, chased }: { margin: number; chased: boolean }) {
  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums ${
        chased
          ? "border-[#FB2C36]/35 bg-[#FB2C36]/15 text-[#FF8A90]"
          : "border-[#02F5D4]/35 bg-[#02F5D4]/15 text-[#5CFCE7]"
      }`}
    >
      +{margin}
    </span>
  );
}

/**
 * One recorded rally: the badge sits on the side that is ahead and shows by how
 * much, the shuttlecock on the side that served, and the score in the middle
 * with the point just won lit. A level score leaves both badges off.
 */
function RallyLine({ row }: { row: RallyRow }) {
  const scoredHome = row.scorer === "home";
  const lead = row.lead;

  return (
    <div className="px-3 py-2.5 odd:bg-white/[0.015] sm:px-4">
      {/* Capped and centred: the three groups stay together as the panel widens */}
      <div className="mx-auto grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center justify-end gap-2">
          {lead?.side === "home" && (
            <LeadBadge margin={lead.margin} chased={lead.chased} />
          )}
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
          {lead?.side === "away" && (
            <LeadBadge margin={lead.margin} chased={lead.chased} />
          )}
        </div>
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
        {/* Which side each column belongs to */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-bold text-white sm:px-4">
          <span className="min-w-0 truncate">
            {sideName(match.home.players)}
          </span>
          <span className="min-w-0 truncate text-right">
            {sideName(match.away.players)}
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {rows.map((row, index) => (
            <RallyLine key={index} row={row} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendItem>
          <LeadBadge margin={2} chased={false} />
          Keunggulan poin bertambah
        </LegendItem>
        <LegendItem>
          <LeadBadge margin={1} chased />
          Keunggulan mulai dikejar
        </LegendItem>
        <LegendItem>
          <Image src={ShuttleIcon} alt="Shuttle Icon" />
          Pemegang servis
        </LegendItem>
      </div>

      <p className="text-[11px] leading-relaxed text-[#6B6B73]">
        Badge menempel pada pihak yang unggul dan menunjukkan selisih poin saat
        itu — kosong di kedua sisi berarti skor sedang imbang.
      </p>
    </div>
  );
}
