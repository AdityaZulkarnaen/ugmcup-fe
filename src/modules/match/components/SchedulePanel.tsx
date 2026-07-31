"use client";

import { useMemo, useState } from "react";
import { getPublicMatches } from "@/lib/api/matches";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
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

interface TimeGroup {
  key: string;
  timeLabel: string;
  dateLabel?: string;
  matches: Match[];
}

/** Pecah jadwal jadi slot jam lokal — jadi dasar pengelompokan kartu. */
function toTimeSlot(scheduledTime?: string) {
  if (!scheduledTime) return null;
  const date = new Date(scheduledTime);
  if (Number.isNaN(date.getTime())) return null;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    key: `${date.toDateString()} ${hours}:${minutes}`,
    timeLabel: `${hours}:${minutes}`,
    dateLabel: date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  };
}

export function SchedulePanel({ isLight = false }: SchedulePanelProps) {
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  const { data, isLoading: loading } = useCachedQuery<Match[]>(
    cacheKeys.matches,
    () => getPublicMatches()
  );
  const allMatches = useMemo(() => data ?? [], [data]);

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

    // Urut kronologis — jam jadi tulang punggung tampilan, lalu nomor lapangan.
    return valid.sort((a, b) => {
      const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : Infinity;
      const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : Infinity;
      if (timeA !== timeB) return timeA - timeB;
      return (a.courtNumber ?? 99) - (b.courtNumber ?? 99);
    });
  }, [allMatches, day, category, level]);

  // Kelompokkan per jam main: satu header waktu, lalu kartu-kartunya di bawah.
  const timeGroups = useMemo(() => {
    const groups = new Map<string, TimeGroup>();

    filteredMatches.forEach((match) => {
      const slot = toTimeSlot(match.scheduledTime);
      const key = slot?.key ?? "tba";

      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          timeLabel: slot?.timeLabel ?? "Waktu menyusul",
          // Tanggal hanya perlu ditampilkan saat semua hari digabung.
          dateLabel: day === "all" ? slot?.dateLabel : undefined,
          matches: [],
        };
        groups.set(key, group);
      }
      group.matches.push(match);
    });

    return Array.from(groups.values());
  }, [filteredMatches, day]);

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

      {/* List — dikelompokkan per jam main */}
      {timeGroups.length > 0 ? (
        <div className="flex flex-col gap-7">
          {timeGroups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2.5">
              {/* Header waktu */}
              <div className="flex items-baseline gap-3">
                <h3
                  className={`text-lg font-extrabold italic tabular-nums leading-none tracking-tight ${
                    isLight ? "text-[#6C47D1]" : "text-[#34E5A6]"
                  }`}
                >
                  {group.timeLabel}
                </h3>
                {group.dateLabel && (
                  <span
                    className={`text-[11px] font-medium ${
                      isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
                    }`}
                  >
                    {group.dateLabel}
                  </span>
                )}
                <span
                  className={`h-px flex-1 ${
                    isLight ? "bg-[rgba(0,0,0,0.08)]" : "bg-white/8"
                  }`}
                />
                <span
                  className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                    isLight ? "text-[rgba(26,22,43,0.35)]" : "text-[#6B6B73]"
                  }`}
                >
                  {group.matches.length} match
                </span>
              </div>

              {group.matches.map((match) => (
                <ScheduleRow key={match.id} match={match} isLight={isLight} />
              ))}
            </section>
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
