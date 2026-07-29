"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { DISCIPLINES } from "@/lib/constants";
import { getStandings } from "@/lib/api/admin";
import type { Standing } from "@/lib/types";
import { FilterSelect } from "@/components/ui/FilterSelect";

const headCell =
  "px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7A83]";

function TeamBadge({ logo, team }: { logo?: string; team: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          aria-hidden
          className="text-xs font-bold leading-none text-[#8A8A93]"
          title={team}
        >
          ?
        </span>
      )}
    </span>
  );
}

function getFormBadges(entry: Standing): Array<"W" | "L"> {
  if (entry.form && entry.form.length > 0) {
    return entry.form;
  }
  const items: Array<"W" | "L"> = [];
  for (let i = 0; i < entry.won; i++) items.push("W");
  for (let i = 0; i < entry.lost; i++) items.push("L");
  return items;
}

function StandingRow({ entry, rank }: { entry: Standing; rank: number }) {
  const mainName =
    entry.team?.institution?.name ||
    entry.participant?.institution?.name ||
    "Tim";

  const subName =
    entry.participant?.athletes?.length
      ? entry.participant.athletes.map((a) => a.athlete?.name).filter(Boolean).join(" - ")
      : undefined;

  const logo = entry.team?.institution?.logoUrl || entry.participant?.institution?.logoUrl;
  const points = entry.won * 3;
  const formItems = getFormBadges(entry);

  return (
    <tr className="border-t border-white/[0.04]">
      <td
        className={`px-3 py-3 text-center text-sm font-bold tabular-nums ${rank === 1 ? "text-[#E3B24D]" : "text-[#6B6B73]"
          }`}
      >
        {rank}
      </td>
      <td className="py-3 pr-2">
        <div className="flex items-center gap-2.5">
          <TeamBadge logo={logo} team={mainName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{mainName}</p>
            {subName && (
              <p className="truncate text-[11px] font-medium uppercase text-[#7A7A83]">
                {subName}
              </p>
            )}
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
        {points}
      </td>
      <td className="px-3 py-3 text-center whitespace-nowrap">
        {formItems.length > 0 ? (
          <div className="flex items-center justify-center gap-1">
            {formItems.map((item, i) => (
              <span
                key={i}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${item === "W"
                  ? "bg-[#02F5D4]/15 text-[#5CFCE7]"
                  : "bg-[#3E1A24] text-[#FF4D6D]"
                  }`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-[#6B6B73]">-</span>
        )}
      </td>
    </tr>
  );
}

function GroupTable({ groupName, entries }: { groupName: string; entries: Standing[] }) {
  // Sort entries: rank ascending
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06]">
      <h3 className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#E3B24D]">
        Grup {groupName}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-md">
          <thead>
            <tr>
              <th className={`${headCell} w-10 text-center`}>#</th>
              <th className={`${headCell} text-left pl-4`}>TIM / PESERTA</th>
              <th className={`${headCell} w-10 text-center`} title="Main">
                M
              </th>
              <th className={`${headCell} w-10 text-center`} title="Menang">
                W
              </th>
              <th className={`${headCell} w-10 text-center`} title="Kalah">
                L
              </th>
              <th className={`${headCell} w-10 text-center`}>POIN</th>
              <th className={`${headCell} w-1 text-center whitespace-nowrap px-3`}>FORM</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, index) => (
              <StandingRow key={entry.id} entry={entry} rank={index + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function StandingsPanel() {
  const teamDisciplines = useMemo(
    () => DISCIPLINES.filter((d) => d.isTeamEvent),
    []
  );

  const [disciplineId, setDisciplineId] = useState(
    teamDisciplines[0]?.id || ""
  );
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!disciplineId) return;
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getStandings(disciplineId);
        if (isMounted) setStandings(data || []);
      } catch (err) {
        console.error("Gagal mengambil data klasemen:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [disciplineId]);

  // Group standings by groupName
  const groupedStandings = useMemo(() => {
    const groups: Record<string, Standing[]> = {};
    standings.forEach((s) => {
      const gName = s.groupName || "A";
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(s);
    });
    return groups;
  }, [standings]);

  const groupKeys = Object.keys(groupedStandings).sort();

  return (
    <div className="flex flex-col gap-4">
      <FilterSelect
        options={teamDisciplines.map((d) => ({ id: d.id, label: d.name }))}
        value={disciplineId}
        onChange={setDisciplineId}
        label="Filter kategori beregu"
        accent="violet"
        className="w-full sm:w-64"
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
      ) : groupKeys.length > 0 ? (
        groupKeys.map((gName) => (
          <GroupTable
            key={gName}
            groupName={gName}
            entries={groupedStandings[gName]}
          />
        ))
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-sm text-[#7A7A83]">
          Klasemen belum disetup untuk kategori ini.
        </div>
      )}

      <p className="text-center text-[11px] text-[#6B6B73]">
        Klasemen hanya untuk nomor beregu dan diurutkan otomatis sesuai regulasi
        PBSI — menang, poin game, poin shuttle.
      </p>
    </div>
  );
}
