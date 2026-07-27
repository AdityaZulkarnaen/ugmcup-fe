"use client";

import Image from "next/image";
import { useState } from "react";
import {
  sortStandings,
  standingPoints,
  teamStandings,
  type FormResult,
  type StandingEntry,
  type StandingGroup,
} from "@/lib/constants/standings";
import { FilterSelect } from "@/components/ui/FilterSelect";

const headCell =
  "px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83]";

/** Team badge, or the neutral placeholder while none has been uploaded. */
function TeamBadge({ logo, team }: { logo?: string; team: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          aria-hidden
          className="text-[11px] font-bold leading-none text-[#8A8A93]"
          title={team}
        >
          ?
        </span>
      )}
    </span>
  );
}

/** Last results, oldest first. */
function FormChips({ form }: { form: FormResult[] }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {form.map((result, index) => (
        <span
          key={index}
          title={result === "W" ? "Menang" : "Kalah"}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            result === "W"
              ? "bg-[#02F5D4]/15 text-[#5CFCE7]"
              : "bg-[#FB2C36]/15 text-[#FF8A90]"
          }`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function StandingRow({ entry, rank }: { entry: StandingEntry; rank: number }) {
  return (
    <tr className="border-t border-white/[0.04]">
      <td
        className={`px-3 py-3 text-center text-sm font-bold tabular-nums ${
          rank === 1 ? "text-[#E3B24D]" : "text-[#6B6B73]"
        }`}
      >
        {rank}
      </td>
      <td className="py-3 pr-2">
        <div className="flex items-center gap-2.5">
          <TeamBadge logo={entry.logo} team={entry.team} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {entry.team}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wide text-[#6B6B73]">
              {entry.fullName}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-center text-sm tabular-nums text-[#8A8A93]">
        {entry.played}
      </td>
      <td className="px-2 py-3 text-center text-sm tabular-nums text-[#5CFCE7]">
        {entry.won}
      </td>
      <td className="px-2 py-3 text-center text-sm tabular-nums text-[#FF8A90]">
        {entry.lost}
      </td>
      <td className="px-2 py-3 text-center text-sm font-bold tabular-nums text-white">
        {standingPoints(entry)}
      </td>
      <td className="hidden px-3 py-3 sm:table-cell">
        <FormChips form={entry.form} />
      </td>
    </tr>
  );
}

function GroupTable({ group }: { group: StandingGroup }) {
  const entries = sortStandings(group.entries);

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06]">
      <h3 className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#E3B24D]">
        {group.label}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-md">
          <thead>
            <tr>
              <th className={`${headCell} w-10 text-center`}>#</th>
              <th className={`${headCell} text-center`}>Tim / Atlet</th>
              <th className={`${headCell} w-10 text-center`} title="Main">
                M
              </th>
              <th className={`${headCell} w-10 text-center`} title="Menang">
                W
              </th>
              <th className={`${headCell} w-10 text-center`} title="Kalah">
                L
              </th>
              <th className={`${headCell} w-14 text-center`}>Poin</th>
              <th className={`${headCell} hidden w-28 text-center sm:table-cell`}>
                Form
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <StandingRow key={entry.team} entry={entry} rank={index + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Group standings, shown per team category. Only the "beregu" events have a
 * group stage — the individual disciplines go straight to the bracket.
 */
export function StandingsPanel() {
  const [categoryId, setCategoryId] = useState(teamStandings[0].id);

  const category =
    teamStandings.find((item) => item.id === categoryId) ?? teamStandings[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Team categories — options follow the data, so the backend list drives them */}
      <FilterSelect
        options={teamStandings.map(({ id, label }) => ({ id, label }))}
        value={category.id}
        onChange={setCategoryId}
        label="Filter kategori beregu"
        accent="violet"
        className="w-full sm:w-56"
      />

      {category.groups.map((group) => (
        <GroupTable key={group.id} group={group} />
      ))}

      <p className="text-center text-[11px] text-[#6B6B73]">
        Klasemen hanya untuk nomor beregu dan diurutkan otomatis sesuai regulasi
        PBSI — menang, poin game, poin shuttle.
      </p>
    </div>
  );
}
