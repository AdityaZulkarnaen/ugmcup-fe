"use client";

import { useState, useEffect, useMemo } from "react";
import { getAthletes } from "@/lib/api/admin";
import { getMatches } from "@/lib/api/matches";
import type { Athlete, Match } from "@/lib/types";
import { Search } from "lucide-react";

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
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [aRes, mRes] = await Promise.all([
          getAthletes(),
          getMatches(),
        ]);
        setAthletes(aRes || []);
        setMatches(mRes || []);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

    // Sort by win DESC, pointDiff DESC, totalMatches DESC
    return list.sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
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

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm opacity-60">
        Memuat statistik pemain...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Cari nama atlet atau institusi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setLevelFilter(item.id)}
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
                <th className="py-3 px-4 w-44 text-center whitespace-nowrap">Total Poin</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isLight ? "divide-black/5" : "divide-white/5"
                }`}
            >
              {filteredStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm opacity-50"
                  >
                    Tidak ada statistik pemain ditemukan
                  </td>
                </tr>
              ) : (
                filteredStats.map((st, idx) => {
                  const isTop1 = idx === 0 && st.win > 0;
                  const isTop2 = idx === 1 && st.win > 0;
                  const isTop3 = idx === 2 && st.win > 0;

                  return (
                    <tr
                      key={st.athlete.id}
                      className={`transition hover:bg-black/5 dark:hover:bg-white/5`}
                    >
                      <td className="py-3.5 px-3 w-14 text-center font-bold text-sm whitespace-nowrap">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-500 font-extrabold text-xs">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-400 font-extrabold text-xs">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-700 font-extrabold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="opacity-60">{idx + 1}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold">{st.athlete.name}</span>
                          {st.athlete.isSeeded && (
                            <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 mb-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                              Unggulan
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-60">
                          {st.athlete.institution?.name || "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-2 w-16 text-center font-bold text-emerald-500 whitespace-nowrap">
                        {st.win}
                      </td>

                      <td className="py-3.5 px-2 w-16 text-center font-semibold text-rose-400 whitespace-nowrap">
                        {st.lose}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${st.pointDiff > 0
                            ? "bg-emerald-500/15 text-emerald-500"
                            : st.pointDiff < 0
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-gray-500/15 opacity-60"
                            }`}
                        >
                          {st.pointDiff > 0 ? `+${st.pointDiff}` : st.pointDiff}
                        </span>
                        <span className="block text-[10px] opacity-40 mt-0.5">
                          ({st.pointsScored} menang / {st.pointsConceded} kalah)
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
