"use client";

import { useEffect, useMemo, useState } from "react";
import { getMatches } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { DISCIPLINES, LEVELS } from "@/lib/constants";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScheduleRow } from "./ScheduleRow";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { FilterBarSkeleton, ScheduleRowSkeleton } from "./MatchSkeletons";

interface SchedulePanelProps {
  isLight?: boolean;
}

export function SchedulePanel({ isLight = false }: SchedulePanelProps) {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getMatches();
        if (isMounted) {
          setAllMatches(data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil jadwal:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available unique dates from matches
  const dayOptions = useMemo(() => {
    const datesSet = new Set<string>();
    allMatches.forEach((m) => {
      if (m.scheduledTime) {
        try {
          const dateStr = new Date(m.scheduledTime).toISOString().split("T")[0];
          datesSet.add(dateStr);
        } catch {
          // ignore invalid date
        }
      }
    });
    const sortedDates = Array.from(datesSet).sort();
    return [
      { id: "all", label: "Semua Hari" },
      ...sortedDates.map((d) => {
        const dateObj = new Date(d);
        const formatted = dateObj.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        return { id: d, label: formatted };
      }),
    ];
  }, [allMatches]);

  // Category filter options from DISCIPLINES constant
  const categoryOptions = useMemo(() => {
    return [
      { id: "all", label: "Semua Kategori" },
      ...DISCIPLINES.map((d) => ({ id: d.id, label: d.name })),
    ];
  }, []);

  // Level filter options from LEVELS constant
  const levelOptions = useMemo(() => {
    return [
      { id: "all", label: "Semua Jenjang" },
      ...LEVELS.map((l) => ({ id: l.value, label: l.label })),
    ];
  }, []);

  const filteredMatches = useMemo(() => {
    const valid = allMatches.filter((match) => {
      // Day filter
      if (day !== "all" && match.scheduledTime) {
        const matchDate = new Date(match.scheduledTime).toISOString().split("T")[0];
        if (matchDate !== day) return false;
      }

      // Category filter
      if (category !== "all" && match.disciplineId !== category) {
        return false;
      }

      // Level filter
      if (level !== "all") {
        const discipline = DISCIPLINES.find((d) => d.id === match.disciplineId);
        if (discipline && discipline.level !== level) {
          return false;
        }
      }

      // Filter incomplete matches
      const isTeamMatch = match.matchType === "TEAM";
      if (isTeamMatch) {
        if (!match.teamA && !match.teamAId) return false;
        if (!match.teamB && !match.teamBId) return false;
      } else {
        if (!match.participantA && !match.participantAId) return false;
        if (!match.participantB && !match.participantBId) return false;
      }

      // Filter retired matches due to bye (if it is marked retired but has no winner)
      if (match.status === "RETIRED" && !match.winnerParticipantId && !match.winnerTeamId) {
        return false;
      }

      return true;
    });

    return valid.sort((a, b) => {
      const getStatusScore = (status: string) => {
        if (status === "ONGOING") return 0;
        if (status === "SCHEDULED") return 1;
        return 2; // FINISHED or RETIRED
      };

      const scoreA = getStatusScore(a.status);
      const scoreB = getStatusScore(b.status);

      if (scoreA !== scoreB) return scoreA - scoreB;

      const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : Infinity;
      const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : Infinity;
      return timeA - timeB;
    });
  }, [allMatches, day, category, level]);

  const hasActiveFilter = day !== "all" || category !== "all" || level !== "all";

  if (loading) {
    return (
      <SkeletonPanel label="Memuat jadwal pertandingan…" isLight={isLight} className="gap-5">
        <FilterBarSkeleton isLight={isLight} />
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <ScheduleRowSkeleton key={i} isLight={isLight} delay={i * 120} />
          ))}
        </div>
      </SkeletonPanel>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <FilterSelect
          options={dayOptions}
          value={day}
          onChange={setDay}
          label="Filter hari"
          accent="mint"
          accented={day !== "all"}
          className="min-w-0 flex-1 sm:max-w-56"
          optionLabel={(option) =>
            option.id === "all" ? "Semua Hari" : option.label
          }
          isLight={isLight}
        />
        <FilterSelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          label="Filter kategori"
          accent="violet"
          accented={category !== "all"}
          className="min-w-0 flex-1 sm:max-w-56"
          optionLabel={(option) =>
            option.id === "all" ? "Semua Kategori" : option.label
          }
          isLight={isLight}
        />
        <FilterSelect
          options={levelOptions}
          value={level}
          onChange={setLevel}
          label="Filter jenjang"
          accent="mint"
          accented={level !== "all"}
          className="col-span-2 min-w-0 flex-1 sm:col-span-1 sm:max-w-56"
          isLight={isLight}
        />
      </div>

      {/* List */}
      {filteredMatches.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filteredMatches.map((match) => (
            <ScheduleRow key={match.id} match={match} isLight={isLight} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Jadwal pertandingan belum tersedia"
          description={
            hasActiveFilter
              ? "Tidak ada pertandingan yang cocok dengan filter yang dipilih."
              : "Panitia belum merilis jadwal pertandingan."
          }
          isLight={isLight}
        />
      )}
    </div>
  );
}
