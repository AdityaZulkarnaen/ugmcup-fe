"use client";

import { useState, useMemo } from "react";
import { getAthletes } from "@/lib/api/admin";
import { getPublicMatches } from "@/lib/api/matches";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import type { Athlete, Match } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Search } from "lucide-react";

const PAGE_SIZE = 10;

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

export function PlayerPanel({ isLight = false }: PlayerPanelProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
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

  // Pre-compute seed rank: seeded athletes sorted alphabetically get seed numbers 1,2,3...
  const seededRankMap = useMemo(() => {
    const ranked = new Map<string, number>();
    const seeded = [...athletes]
      .filter((a) => a.isSeeded)
      .sort((a, b) => a.name.localeCompare(b.name));
    seeded.forEach((a, i) => ranked.set(a.id, i + 1));
    return ranked;
  }, [athletes]);

  const statsList = useMemo(() => {
    // Map athleteId -> Stats
    const map = new Map<string, PlayerStats>();

    athletes.forEach((ath) => {
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

    matches.forEach((m) => {
      if (m.status === "SCHEDULED") return;

      // BYE = auto-advance karena salah satu sisi kosong — bukan pertandingan
      // nyata, jadi tidak boleh menambah win/lose maupun statistik apa pun.
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

      // Collect athlete IDs for Side A
      const athletesA: string[] = [];
      if (m.participantA?.athletes) {
        m.participantA.athletes.forEach((pa) => {
          const aId = pa.athleteId || pa.athlete?.id;
          if (aId) athletesA.push(aId);
        });
      }

      // Collect athlete IDs for Side B
      const athletesB: string[] = [];
      if (m.participantB?.athletes) {
        m.participantB.athletes.forEach((pb) => {
          const bId = pb.athleteId || pb.athlete?.id;
          if (bId) athletesB.push(bId);
        });
      }

      // Update Side A athletes
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

      // Update Side B athletes
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

    // Compute pointDiff
    const list: PlayerStats[] = Array.from(map.values()).map((st) => ({
      ...st,
      pointDiff: st.pointsScored - st.pointsConceded,
    }));

    // Sort by win DESC, total poin DESC, totalMatches DESC
    return list.sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      if (b.pointsScored !== a.pointsScored) return b.pointsScored - a.pointsScored;
      return b.totalMatches - a.totalMatches;
    });
  }, [athletes, matches]);

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

  const hasActiveFilter = search.trim() !== "" || levelFilter !== "ALL";

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
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
            }`}
          />
          <input
            type="text"
            placeholder="Cari nama atlet atau institusi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition ${isLight
              ? "bg-black/5 text-gray-900 focus:bg-black/10"
              : "bg-white/5 text-white focus:bg-white/10"
              }`}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { id: "ALL", label: "Semua" },
            { id: "UNIVERSITAS", label: "Universitas" },
            { id: "SMA", label: "SMA/SMK" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setLevelFilter(item.id);
                setPage(1);
              }}
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
                className={`divide-y ${isLight ? "divide-black/5" : "divide-white/5"
                  }`}
              >
                {pagedStats.map((st, i) => {
                    const idx = pageStart + i;
                    const isTop1 = idx === 0 && st.win > 0;
                    const isTop2 = idx === 1 && st.win > 0;
                    const isTop3 = idx === 2 && st.win > 0;

                    return (
                      <tr
                        key={st.athlete.id}
                        className={`transition ${
                          isLight ? "hover:bg-black/3" : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3.5 px-3 w-14 text-center font-bold text-sm whitespace-nowrap">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-500 font-extrabold text-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 font-extrabold text-xs ${
                                isLight ? "text-slate-600" : "text-slate-300"
                              }`}
                            >
                              2
                            </span>
                          ) : isTop3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 font-extrabold text-xs ${
                                isLight ? "text-amber-700" : "text-amber-500"
                              }`}
                            >
                              3
                            </span>
                          ) : (
                            <span
                              className={
                                isLight
                                  ? "text-[rgba(26,22,43,0.5)]"
                                  : "text-[#6B6B73]"
                              }
                            >
                              {idx + 1}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`font-semibold ${
                                isLight ? "text-[#1a162b]" : "text-white"
                              }`}
                            >
                              {st.athlete.name}
                            </span>
                            {st.athlete.isSeeded && seededRankMap.has(st.athlete.id) && (
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold shrink-0 ${
                                  isLight
                                    ? "bg-[#6C47D1]/15 text-[#6C47D1]"
                                    : "bg-purple-500/25 text-purple-300"
                                }`}
                                title="Unggulan"
                              >
                                {seededRankMap.get(st.athlete.id)}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs ${
                              isLight
                                ? "text-[rgba(26,22,43,0.55)]"
                                : "text-[#7A7A83]"
                            }`}
                          >
                            {st.athlete.institution?.name || "—"}
                          </div>
                        </td>

                        <td
                          className={`py-3.5 px-2 w-16 text-center font-bold whitespace-nowrap ${
                            isLight ? "text-emerald-600" : "text-emerald-400"
                          }`}
                        >
                          {st.win}
                        </td>

                        <td
                          className={`py-3.5 px-2 w-16 text-center font-semibold whitespace-nowrap ${
                            isLight ? "text-[#FB2C36]" : "text-rose-400"
                          }`}
                        >
                          {st.lose}
                        </td>

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
                          <span className={`text-[10px] opacity-50 ml-0.5 ${
                            isLight ? "text-[#1a162b]" : "text-white"
                          }`}>/{st.pointsConceded}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {/* Pagination */}
      {filteredStats.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Navigasi halaman statistik pemain"
          isLight={isLight}
          summary={
            <>
              Menampilkan {pageStart + 1}–{pageStart + pagedStats.length} dari{" "}
              {filteredStats.length} atlet
            </>
          }
        />
      )}
    </div>
  );
}
