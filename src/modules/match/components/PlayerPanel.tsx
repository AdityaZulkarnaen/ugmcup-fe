"use client";

import { useMemo, useState, useRef } from "react";
import { getAthletes } from "@/lib/api/admin";
import { getPublicMatches } from "@/lib/api/matches";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import { DISCIPLINES } from "@/lib/constants";
import type { Athlete, Match } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedValue";
import type { useMatchFilters } from "@/lib/hooks/useMatchFilters";

const PAGE_SIZE = 10;

// BWF standard discipline codes
const BWF_CODE: Record<string, string> = {
  TUNGGAL_PUTRA: "MS", // Men's Singles
  TUNGGAL_PUTRI: "WS", // Women's Singles
  GANDA_PUTRA: "MD", // Men's Doubles
  GANDA_PUTRI: "WD", // Women's Doubles
  GANDA_CAMPURAN: "XD", // Mixed Doubles
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
  filters: ReturnType<typeof useMatchFilters>;
}

const INDIVIDUAL_DISCIPLINES = DISCIPLINES.filter((d) => !d.isTeamEvent);

export function PlayerPanel({ isLight = false, filters }: PlayerPanelProps) {
  const search = filters.playerSearch;
  const levelFilter = filters.playerLevel;

  // Kata kunci disimpan di URL, dan setiap penulisannya adalah `router.push`.
  // Tanpa perantara ini satu ketikan = satu navigasi + satu entri histori,
  // sehingga input terasa berat dan tombol Back jadi penuh sampah.
  //
  // Karena itu input dikendalikan state lokal (langsung responsif), lalu URL
  // baru ditulis setelah pengetikan berhenti. URL tetap jadi sumber kebenaran
  // untuk data yang ditampilkan.
  const [searchInput, setSearchInput] = useState(search);

  /** Nilai terakhir yang *kita* tulis ke URL, untuk mengenali pantulannya sendiri. */
  const [committed, setCommitted] = useState(search);
  /** Nilai URL terakhir yang sudah ditanggapi, agar sinkronisasi jalan sekali per perubahan. */
  const [syncedSearch, setSyncedSearch] = useState(search);

  const commitSearch = useDebouncedCallback((v: string) => {
    setCommitted(v);
    filters.setPlayerSearch(v);
  });

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    // URL berubah dari luar — tombol Back, atau tautan dengan filter — jadi
    // input ikut menyesuaikan. Tapi kalau perubahan ini cuma pantulan tulisan
    // kita sendiri, biarkan: pantulan itu datang terlambat dan akan menimpa
    // karakter yang sudah terlanjur diketik sesudahnya.
    if (search !== committed) setSearchInput(search);
  }

  function handleSearchChange(v: string) {
    setSearchInput(v);
    commitSearch(v);
  }

  /** Tombol silang harus terasa langsung, jadi URL ditulis tanpa menunggu jeda. */
  function clearSearch() {
    commitSearch.cancel();
    setSearchInput("");
    setCommitted("");
    filters.setPlayerSearch("");
  }

  function resetFilters() {
    // Ketikan yang masih menunggu dibuang dulu; kalau tidak, ia menyusul
    // beberapa ratus milidetik setelah reset dan mengembalikan kata kuncinya.
    commitSearch.cancel();
    setSearchInput("");
    setCommitted("");
    filters.resetPlayerFilters();
  }

  const disciplineFilter = filters.playerDiscipline;
  const page = filters.playerPage;

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

  // Discipline options shown in dropdown — filtered by active level
  const disciplineOptions = useMemo(() => {
    const base = levelFilter === "ALL"
      ? INDIVIDUAL_DISCIPLINES
      : INDIVIDUAL_DISCIPLINES.filter((d) => d.level === (levelFilter === "UNIVERSITAS" ? "univ" : "sma"));
    const showLevelSuffix = levelFilter === "ALL";
    return [
      { id: "ALL", label: "Semua Cabang" },
      ...base.map((d) => ({
        id: d.id,
        label: showLevelSuffix
          ? `${d.label} · ${d.level === "univ" ? "Univ" : "SMA"}`
          : d.label,
      })),
    ];
  }, [levelFilter]);

  // Build seed map from participant data attached directly to athletes: athleteId → { code, seedNumber }
  const athleteSeedMap = useMemo(() => {
    const map = new Map<string, { code: string; seedNumber: number }>();
    athletes.forEach((ath) => {
      if (ath.participantMembers) {
        ath.participantMembers.forEach((pm) => {
          if (pm.participant?.seedNumber) {
            const discId = pm.participant.disciplineId;
            const code = DISCIPLINE_CODE_MAP[discId] ?? "";
            map.set(ath.id, { code, seedNumber: pm.participant.seedNumber });
          }
        });
      }
    });
    return map;
  }, [athletes]);

  const statsList = useMemo(() => {
    const map = new Map<string, PlayerStats>();

    // Collect relevant athlete IDs when discipline filter is active
    const relevantAthleteIds = new Set<string>();
    if (disciplineFilter !== "ALL") {
      athletes.forEach((ath) => {
        const belongsToDiscipline = ath.participantMembers?.some(
          (pm) => pm.participant?.disciplineId === disciplineFilter
        );
        if (belongsToDiscipline) {
          relevantAthleteIds.add(ath.id);
        }
      });
    }

    athletes.forEach((ath) => {
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

  const listTopRef = useRef<HTMLDivElement>(null);

  const goToPage = (next: number) => {
    filters.setPlayerPage(next);
    if (typeof window !== "undefined" && listTopRef.current) {
      const navbarOffset = 90;
      const elementTop = listTopRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementTop - navbarOffset),
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div
        className={`py-12 text-center text-sm ${isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#7A7A83]"
          }`}
      >
        Memuat statistik pemain...
      </div>
    );
  }

  return (
    <div ref={listTopRef} className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search — pill style */}
        <div
          className={`relative flex items-center gap-2 rounded-full border px-4 py-2 transition-colors w-full sm:w-72 shrink-0 ${isLight
            ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] focus-within:border-[rgba(0,0,0,0.15)]"
            : "border-white/[0.08] bg-white/[0.02] focus-within:border-white/20"
            }`}
        >
          <Search
            className={`shrink-0 w-4 h-4 ${isLight ? "text-[rgba(26,22,43,0.3)]" : "text-[#6B6B73]"
              }`}
          />
          <input
            type="text"
            placeholder="Cari nama atlet atau institusi..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`min-w-0 flex-1 bg-transparent text-xs font-medium outline-none ${isLight
              ? "text-[#1a162b] placeholder:text-[rgba(26,22,43,0.35)]"
              : "text-white placeholder:text-[#6B6B73]"
              }`}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Hapus pencarian"
              className={`shrink-0 transition-colors ${isLight ? "text-[#808080] hover:text-[#1a162b]" : "text-[#8A8A93] hover:text-white"
                }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdowns: Level + Discipline */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {/* Level Dropdown — FilterSelect style matching BracketPanel */}
          <FilterSelect
            options={[
              { id: "ALL", label: "Semua" },
              { id: "UNIVERSITAS", label: "Universitas" },
              { id: "SMA", label: "SMA/SMK" },
            ]}
            value={levelFilter}
            onChange={(val) => {
              filters.setPlayerLevel(val);
            }}
            label="Filter jenjang"
            accent="mint"
            accented={levelFilter !== "ALL"}
            className="min-w-0 flex-1 sm:w-44 shrink-0"
            optionLabel={(opt) => opt.id === "ALL" ? "Semua Jenjang" : opt.label}
            isLight={isLight}
          />

          {/* Discipline Dropdown — FilterSelect style matching BracketPanel */}
          <FilterSelect
            options={disciplineOptions}
            value={disciplineFilter}
            onChange={(val) => { filters.setPlayerDiscipline(val); }}
            label="Filter cabang"
            accent="violet"
            accented={disciplineFilter !== "ALL"}
            className="min-w-0 flex-1 sm:w-56 shrink-0"
            isLight={isLight}
          />

          <ResetFiltersButton
            onClick={resetFilters}
            disabled={filters.playerIsDefault && searchInput === ""}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Stats Table */}
      {filteredStats.length === 0 ? (
        <EmptyState
          title="Statistik Pemain Belum Tersedia"
          description="Data atlet dan pasangan tanding untuk kategori ini belum dirilis oleh panitia."
          footerNote="Daftar pemain akan diperbarui otomatis setelah registrasi ulang"
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
                  <th className="py-3 px-3 w-14 text-center whitespace-nowrap">No</th>
                  <th className="py-3 px-4 min-w-[180px]">Atlet &amp; Institusi</th>
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
                      className={`transition ${isLight ? "hover:bg-black/3" : "hover:bg-white/5"
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
                          {seedInfo && (
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold shrink-0 ${isLight
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
                      <td
                        className={`py-3.5 px-2 w-16 text-center font-bold whitespace-nowrap ${isLight ? "text-[#8B5CF6]" : "text-[#02F5D4]"
                          }`}
                      >
                        {st.win}
                      </td>

                      {/* Lose */}
                      <td
                        className={`py-3.5 px-2 w-16 text-center font-semibold whitespace-nowrap ${isLight ? "text-[#FF6467]/80" : "text-[#FF6467]/60"
                          }`}
                      >
                        {st.lose}
                      </td>

                      {/* Poin */}
                      <td className="py-3.5 px-3 w-28 text-center font-bold whitespace-nowrap tabular-nums">
                        <span
                          className={`inline-block text-sm font-bold ${st.pointDiff > 0
                            ? isLight ? "text-emerald-600" : "text-emerald-400"
                            : st.pointDiff < 0
                              ? isLight ? "text-[#FF6467]" : "text-[#FF6467]/90"
                              : isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#6B6B73]"
                            }`}
                        >
                          {st.pointsScored}
                        </span>
                        <span className={`text-[10px] opacity-50 ml-0.5 ${isLight ? "text-[#1a162b]" : "text-white"
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

      {filteredStats.length > 0 && totalPages > 1 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
          summary={`Menampilkan ${pageStart + 1}–${pageStart + pagedStats.length} dari ${filteredStats.length} atlet`}
          isLight={isLight}
        />
      )}
    </div>
  );
}
