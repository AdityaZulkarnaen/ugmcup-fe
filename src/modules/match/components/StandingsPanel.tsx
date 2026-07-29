"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { DISCIPLINES } from "@/lib/constants";
import { getStandings } from "@/lib/api/admin";
import type { Standing } from "@/lib/types";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { StandingsGroupSkeleton } from "./MatchSkeletons";

interface StandingsPanelProps {
  isLight?: boolean;
}

function TeamBadge({
  logo,
  team,
  isLight = false,
}: {
  logo?: string;
  team: string;
  isLight?: boolean;
}) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
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
          className={`text-[11px] font-bold leading-none ${
            isLight ? "text-[#808080]" : "text-[#8A8A93]"
          }`}
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

function StandingRow({ entry, rank, isLight = false }: { entry: Standing; rank: number; isLight?: boolean }) {
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
    <tr
      className={`border-t ${
        isLight ? "border-[rgba(0,0,0,0.05)]" : "border-white/[0.04]"
      }`}
    >
      <td
        className={`px-3 py-3 text-center text-sm font-bold tabular-nums ${
          rank === 1
            ? isLight
              ? "text-[#8b5cf6]"
              : "text-[#34E5A6]"
            : isLight
              ? "text-[#808080]"
              : "text-[#6B6B73]"
        }`}
      >
        {rank}
      </td>
      <td className="py-3 pr-2">
        <div className="flex items-center gap-2.5">
          <TeamBadge logo={logo} team={mainName} isLight={isLight} />
          <div className="min-w-0">
            <p
              className={`truncate text-sm font-bold ${
                isLight ? "text-[#1a162b]" : "text-white"
              }`}
            >
              {mainName}
            </p>
            {subName && (
              <p
                className={`truncate text-[10px] uppercase tracking-wide ${
                  isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
                }`}
              >
                {subName}
              </p>
            )}
          </div>
        </div>
      </td>
      <td
        className={`px-2 py-3 text-center text-sm tabular-nums ${
          isLight ? "text-[#808080]" : "text-[#8A8A93]"
        }`}
      >
        {entry.played}
      </td>
      <td
        className={`px-2 py-3 text-center text-sm tabular-nums ${
          isLight ? "text-[#8b5cf6]" : "text-[#5CFCE7]"
        }`}
      >
        {entry.won}
      </td>
      <td
        className={`px-2 py-3 text-center text-sm tabular-nums ${
          isLight ? "text-[#FB2C36]" : "text-[#FF8A90]"
        }`}
      >
        {entry.lost}
      </td>
      <td
        className={`px-2 py-3 text-center text-sm font-bold tabular-nums ${
          isLight ? "text-[#1a162b]" : "text-white"
        }`}
      >
        {points}
      </td>
      <td className="px-3 py-3 text-center whitespace-nowrap">
        {formItems.length > 0 ? (
          <div className="flex items-center justify-center gap-1">
            {formItems.map((item, i) => (
              <span
                key={i}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  item === "W"
                    ? isLight
                      ? "bg-[#8b5cf6]/10 text-[#8b5cf6]"
                      : "bg-[#02F5D4]/15 text-[#5CFCE7]"
                    : isLight
                      ? "bg-[#FB2C36]/08 text-[#FB2C36]"
                      : "bg-[#FB2C36]/15 text-[#FF8A90]"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <span className={`text-xs ${isLight ? "text-[rgba(26,22,43,0.3)]" : "text-[#6B6B73]"}`}>-</span>
        )}
      </td>
    </tr>
  );
}

function GroupTable({ groupName, entries, isLight = false }: { groupName: string; entries: Standing[]; isLight?: boolean }) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const headCell = `px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider ${
    isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
  }`;

  return (
    <section
      className={`overflow-hidden rounded-xl border ${
        isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]"
      }`}
    >
      <h3
        className={`border-b px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
          isLight
            ? "border-[rgba(0,0,0,0.06)] bg-[rgba(0,0,0,0.02)] text-[#6C47D1]"
            : "border-white/[0.06] bg-white/[0.03] text-[#34E5A6]"
        }`}
      >
        Grup {groupName}
      </h3>

      <div className="overflow-x-auto">
        <table className={`w-full min-w-md ${isLight ? "bg-white" : ""}`}>
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
              <th className={`${headCell} w-14 text-center`}>Poin</th>
              <th className={`${headCell} w-28 text-center px-3`}>Form</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, index) => (
              <StandingRow key={entry.id} entry={entry} rank={index + 1} isLight={isLight} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function StandingsPanel({ isLight = false }: StandingsPanelProps) {
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
        className="w-full sm:w-56"
        isLight={isLight}
      />

      {loading ? (
        <SkeletonPanel label="Memuat klasemen…" isLight={isLight} className="gap-4">
          {[0, 1].map((i) => (
            <StandingsGroupSkeleton key={i} isLight={isLight} delay={i * 200} />
          ))}
        </SkeletonPanel>
      ) : groupKeys.length > 0 ? (
        groupKeys.map((gName) => (
          <GroupTable
            key={gName}
            groupName={gName}
            entries={groupedStandings[gName]}
            isLight={isLight}
          />
        ))
      ) : (
        <div
          className={`flex min-h-40 items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm ${
            isLight
              ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[rgba(26,22,43,0.4)]"
              : "border-white/10 bg-white/[0.01] text-[#7A7A83]"
          }`}
        >
          Klasemen belum disetup untuk kategori ini.
        </div>
      )}

      <p
        className={`text-center text-[11px] ${
          isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"
        }`}
      >
        Klasemen hanya untuk nomor beregu dan diurutkan otomatis sesuai regulasi
        PBSI — menang, poin game, poin shuttle.
      </p>
    </div>
  );
}
