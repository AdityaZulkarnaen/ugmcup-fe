"use client";

import { useState, useMemo } from "react";
import { getAthletes } from "@/lib/api/admin";
import { getPublicMatches } from "@/lib/api/matches";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import { DISCIPLINES } from "@/lib/constants";
import type { Athlete, Match } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Search } from "lucide-react";

const PAGE_SIZE = 10;

// BWF standard discipline codes
const BWF_CODE: Record<string, string> = {
  TUNGGAL_PUTRA:   "MS", // Men's Singles
  TUNGGAL_PUTRI:   "WS", // Women's Singles
  GANDA_PUTRA:     "MD", // Men's Doubles
  GANDA_PUTRI:     "WD", // Women's Doubles
  GANDA_CAMPURAN:  "XD", // Mixed Doubles
};

// Map disciplineId → BWF code
const DISCIPLINE_CODE_MAP: Record<string, string> = Object.fromEntries(
  DISCIPLINES.filter((d) => !d.isTeamEvent).map((d) => [d.id, BWF_CODE[d.type] ?? d.type])
);

interface PlayerStats {
  athlete: Athlete;
  win: number;
  lose: number;
  pointsScored: number;
  pointsConceded: number;
  pointDiff: number;
  totalMatches: number;
}

interface PlayerPanelProps {
  isLight?: boolean;
}

const INDIVIDUAL_DISCIPLINES = DISCIPLINES.filter((d) => !d.isTeamEvent);

export function PlayerPanel({ isLight = false }: PlayerPanelProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const athletesQuery = useCachedQuery<Athlete[]>(cacheKeys.athletes, () =>
    getAthletes()
  );
  const matchesQuery = useCachedQuery<Match[]>(cacheKeys.matches, () =>
    getPublicMatches()
  );

  const isLoading = athletesQuery.isLoading || matchesQuery.isLoading;
  const athletes = useMemo(() => athletesQuery.data ?? [], [athletesQuery.data]);
  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data]);

  // Filter matches by selected discipline
  const filteredMatches = useMemo(() => {
    if (disciplineFilter === "ALL") return matches;
    return matches.filter((m) => m.disciplineId === disciplineFilter);
  }, [matches, disciplineFilter]);

  // Build seed map from participant data in matches: athleteId → { code, seedNumber }
  const athleteSeedMap = useMemo(() => {
    const map = new Map<string, { code: string; seedNumber: number }>();
    filteredMatches.forEach((m) => {
      const code = DISCIPLINE_CODE_MAP[m.disciplineId] ?? "";
      [m.participantA, m.participantB].forEach((p) => {
        if (!p || !p.seedNumber) return;
        p.athletes?.forEach((pa) => {
          const athId = pa.athleteId || pa.athlete?.id;
          if (athId && !map.has(athId)) {
            map.set(athId, { code, seedNumber: p.seedNumber! });
          }
        });
      });
    });
    return map;
  }, [filteredMatches]);

  const statsList = useMemo(() => {
    // Map athleteId -> Stats — only athletes appearing in filtered matches
    const map = new Map<string, PlayerStats>();

    // Collect athlete IDs from matches first (for discipline filter)
    const relevantAthleteIds = new Set<string>();
    if (disciplineFilter !== "ALL") {
      filteredMatches.forEach((m) => {
        [m.participantA, m.participantB].forEach((p) => {
          p?.athletes?.forEach((pa) => {
            const id = pa.athleteId || pa.athlete?.id;
            if (id) relevantAthleteIds.add(id);
          });
        });
      });
    }

    athletes.forEach((ath) => {
      // If a discipline is selected, only include athletes in that discipline
      if (disciplineFilter !== "ALL" && !relevantAthleteIds.has(ath.id)) return;
      map.set(ath.id, {
        athlete: ath,
        win: 0,
        lose: 0,
        pointsScored: 0,
        pointsConceded: 0,
        pointDiff: 0,
        totalMatches: 0,
      });
    });

    filteredMatches.forEach((m) => {
      if (m.status === "SCHEDULED") return;

      const hasSideA = !!(m.participantA || m.teamA);
      const hasSideB = !!(m.participantB || m.teamB);
      if (!hasSideA || !hasSideB) return;

      const sets = m.sets || [];
      let totalA = 0;
      let totalB = 0;
      sets.forEach((s) => {
        totalA += s.scoreA || 0;
        totalB += s.scoreB || 0;
      });

      const wonA =
        (!!m.winnerParticipantId && m.winnerParticipantId === m.participantAId) ||
        (!!m.winnerTeamId && m.winnerTeamId === m.teamAId);
      const wonB =
        (!!m.winnerParticipantId && m.winnerParticipantId === m.participantBId) ||
        (!!m.winnerTeamId && m.winnerTeamId === m.teamBId);

      const athletesA: string[] = [];
      if (m.participantA?.athletes) {
        m.participantA.athletes.forEach((pa) => {
          const aId = pa.athleteId || pa.athlete?.id;
          if (aId) athletesA.push(aId);
        });
      }

      const athletesB: string[] = [];
      if (m.participantB?.athletes) {
        m.participantB.athletes.forEach((pb) => {
          const bId = pb.athleteId || pb.athlete?.id;
          if (bId) athletesB.push(bId);
        });
      }

      athletesA.forEach((athId) => {
        const st = map.get(athId);
        if (st) {
          st.totalMatches += 1;
          st.pointsScored += totalA;
          st.pointsConceded += totalB;
          if (wonA) st.win += 1;
          else if (wonB) st.lose += 1;
        }
      });

      athletesB.forEach((athId) => {
        const st = map.get(athId);
        if (st) {
          st.totalMatches += 1;
          st.pointsScored += totalB;
          st.pointsConceded += totalA;
          if (wonB) st.win += 1;
          else if (wonA) st.lose += 1;
        }
      });
    });

    const list: PlayerStats[] = Array.from(map.values()).map((st) => ({
      ...st,
      pointDiff: st.pointsScored - st.pointsConceded,
    }));

    return list.sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      if (b.pointsScored !== a.pointsScored) return b.pointsScored - a.pointsScored;
      return b.totalMatches - a.totalMatches;
    });
  }, [athletes, filteredMatches, disciplineFilter]);

  const filteredStats = useMemo(() => {
    return statsList.filter((st) => {
      const instType = st.athlete.institution?.type;
      if (levelFilter === "UNIVERSITAS" && instType !== "UNIVERSITAS") return false;
      if (levelFilter === "SMA" && instType !== "SMA") return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const nameMatch = st.athlete.name.toLowerCase().includes(q);
      const instMatch = (st.athlete.institution?.name || "").toLowerCase().includes(q);
      return nameMatch || instMatch;
    });
  }, [statsList, search, levelFilter]);

  const hasActiveFilter = search.trim() !== "" || levelFilter !== "ALL" || disciplineFilter !== "ALL";

  const totalPages = Math.max(1, Math.ceil(filteredStats.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedStats = filteredStats.slice(pageStart, pageStart + PAGE_SIZE);

  if (isLoading) {
    return (
      <div
        className={`py-12 text-center text-sm ${
          isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#7A7A83]"
        }`}
      >
        Memuat statistik pemain...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Row */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
            }`}
          />
          <input
            type="text"
            placeholder="Cari nama atlet atau institusi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition ${isLight
              ? "bg-black/5 text-gray-900 focus:bg-black/10"
              : "bg-white/5 text-white focus:bg-white/10"
            }`}
          />
        </div>

        {/* Discipline Dropdown + Level Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          {/* Discipline select */}
          <select
            value={disciplineFilter}
            onChange={(e) => { setDisciplineFilter(e.target.value); setPage(1); }}
            className={`flex-1 sm:flex-none sm:w-56 rounded-xl px-3 py-2 text-sm outline-none transition cursor-pointer ${
              isLight
                ? "bg-black/5 text-gray-900 border border-black/10 focus:bg-black/10"
                : "bg-white/5 text-white border border-white/10 focus:bg-white/10"
            }`}
          >
            <option value="ALL">Semua Cabang</option>
            <optgroup label="Universitas">
              {INDIVIDUAL_DISCIPLINES.filter((d) => d.level === "univ").map((d) => (
                <option key={d.id} value={d.id}>
                  {BWF_CODE[d.type] ?? d.type} — {d.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="SMA/SMK">
              {INDIVIDUAL_DISCIPLINES.filter((d) => d.level === "sma").map((d) => (
                <option key={d.id} value={d.id}>
                  {BWF_CODE[d.type] ?? d.type} — {d.label}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Level filter pills */}
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "Semua" },
              { id: "UNIVERSITAS", label: "Universitas" },
              { id: "SMA", label: "SMA/SMK" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setLevelFilter(item.id); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${levelFilter === item.id
                  ? isLight
                    ? "bg-[#6C47D1] text-white shadow-sm"
                    : "bg-[#8b5cf6] text-white shadow-sm"
                  : isLight
                    ? "bg-black/5 text-gray-600 hover:bg-black/10"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Table */}
      {filteredStats.length === 0 ? (
        <EmptyState
          title="Statistik pemain belum tersedia"
          description={
            hasActiveFilter
              ? "Tidak ada atlet yang cocok dengan pencarian atau filter yang dipilih."
              : "Statistik akan muncul setelah pertandingan pertama selesai dimainkan."
          }
          isLight={isLight}
        />
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden ${isLight
            ? "border-black/10 bg-white"
            : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className={`border-b text-xs font-semibold uppercase tracking-wider ${isLight
                    ? "border-black/10 bg-black/5 text-gray-600"
                    : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  <th className="py-3 px-3 w-14 text-center whitespace-nowrap">Rank</th>
                  <th className="py-3 px-4 min-w-[180px]">Atlet & Institusi</th>
                  <th className="py-3 px-2 w-16 text-center whitespace-nowrap">Win</th>
                  <th className="py-3 px-2 w-16 text-center whitespace-nowrap">Lose</th>
                  <th className="py-3 px-3 w-28 text-center whitespace-nowrap">Poin</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${isLight ? "divide-black/5" : "divide-white/5"}`}
              >
                {pagedStats.map((st, i) => {
                  const idx = pageStart + i;
                  const isTop1 = idx === 0 && st.win > 0;
                  const isTop2 = idx === 1 && st.win > 0;
                  const isTop3 = idx === 2 && st.win > 0;
                  const seedInfo = athleteSeedMap.get(st.athlete.id);

                  return (
                    <tr
                      key={st.athlete.id}
                      className={`transition ${
                        isLight ? "hover:bg-black/3" : "hover:bg-white/5"
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 w-14 text-center font-bold text-sm whitespace-nowrap">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-500 font-extrabold text-xs">1</span>
                        ) : isTop2 ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 font-extrabold text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>2</span>
                        ) : isTop3 ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 font-extrabold text-xs ${isLight ? "text-amber-700" : "text-amber-500"}`}>3</span>
                        ) : (
                          <span className={isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#6B6B73]"}>{idx + 1}</span>
                        )}
                      </td>

                      {/* Atlet & Institusi */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-semibold ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                            {st.athlete.name}
                          </span>
                          {/* Seed badge: show BWF code + seed number from participant data */}
                          {seedInfo && (
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold shrink-0 ${
                                isLight
                                  ? "bg-[#6C47D1]/15 text-[#6C47D1]"
                                  : "bg-purple-500/25 text-purple-300"
                              }`}
                              title={`Unggulan ${seedInfo.code} ${seedInfo.seedNumber}`}
                            >
                              {seedInfo.code} {seedInfo.seedNumber}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${isLight ? "text-[rgba(26,22,43,0.55)]" : "text-[#7A7A83]"}`}>
                          {st.athlete.institution?.name || "—"}
                        </div>
                      </td>

                      {/* Win */}
                      <td className={`py-3.5 px-2 w-16 text-center font-bold whitespace-nowrap ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
                        {st.win}
                      </td>

                      {/* Lose */}
                      <td className={`py-3.5 px-2 w-16 text-center font-semibold whitespace-nowrap ${isLight ? "text-[#FB2C36]" : "text-rose-400"}`}>
                        {st.lose}
                      </td>

                      {/* Poin */}
                      <td className="py-3.5 px-3 w-28 text-center font-bold whitespace-nowrap tabular-nums">
                        <span
                          className={`inline-block text-sm font-bold ${
                            st.pointDiff > 0
                              ? isLight ? "text-emerald-600" : "text-emerald-400"
                              : st.pointDiff < 0
                              ? isLight ? "text-[#FB2C36]" : "text-rose-400"
                              : isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#6B6B73]"
                          }`}
                        >
                          {st.pointsScored}
                        </span>
                        <span className={`text-[10px] opacity-50 ml-0.5 ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                          /{st.pointsConceded}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStats.length > 0 && totalPages > 1 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          summary={`Menampilkan ${pageStart + 1}–${pageStart + pagedStats.length} dari ${filteredStats.length} atlet`}
          isLight={isLight}
        />
      )}
    </div>
  );
}
