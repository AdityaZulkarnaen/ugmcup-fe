"use client";

import { useEffect, useMemo, useRef } from "react";
import { getPublicMatches } from "@/lib/api/matches";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import type { Match } from "@/lib/types";
import { DISCIPLINES, LEVELS } from "@/lib/constants";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ScheduleRow } from "./ScheduleRow";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { FilterBarSkeleton, ScheduleRowSkeleton } from "./MatchSkeletons";
import type { useMatchFilters } from "@/lib/hooks/useMatchFilters";

/** Jumlah pertandingan per halaman — grup jam tetap utuh di dalam halaman. */
const PAGE_SIZE = 12;

interface SchedulePanelProps {
  isLight?: boolean;
  filters: ReturnType<typeof useMatchFilters>;
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

export function SchedulePanel({ isLight = false, filters }: SchedulePanelProps) {
  const day = filters.schedDay;
  const category = filters.schedCategory;
  const level = filters.schedLevel;
  const page = filters.schedPage;
  const listTopRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: loading } = useCachedQuery<Match[]>(
    cacheKeys.matches,
    () => getPublicMatches()
  );
  const allMatches = useMemo(() => data ?? [], [data]);

  // ── Auto-select "hari ini" saat pertama buka (hari belum dipilih user) ──
  // Hanya berjalan sekali: saat data tersedia dan `?hari` belum ada di URL.
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    // Jika user sudah set filter hari secara eksplisit, jangan timpa.
    if (!filters.schedDayIsDefault || autoSelectedRef.current || allMatches.length === 0) return;
    autoSelectedRef.current = true;

    // Kumpulkan semua tanggal yang tersedia (sorted ascending)
    const datesSet = new Set<string>();
    allMatches.forEach((m) => {
      if (m.scheduledTime) {
        try {
          datesSet.add(new Date(m.scheduledTime).toISOString().split("T")[0]);
        } catch { /* ignore */ }
      }
    });
    const sortedDates = Array.from(datesSet).sort();
    if (sortedDates.length === 0) return;

    const today = new Date().toISOString().split("T")[0];

    let targetDate: string;
    if (sortedDates.includes(today)) {
      // Hari ini ada di jadwal → tampilkan hari ini
      targetDate = today;
    } else {
      // Cari tanggal terakhir yang sudah lewat (turnamen selesai)
      const pastDates = sortedDates.filter((d) => d < today);
      if (pastDates.length > 0) {
        targetDate = pastDates[pastDates.length - 1]; // hari terakhir turnamen
      } else {
        // Semua jadwal masih di masa depan → tampilkan hari pertama
        targetDate = sortedDates[0];
      }
    }

    filters.setSchedDay(targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatches]);

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
  const allTimeGroups = useMemo(() => {
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

  // Bagi jadi halaman tanpa memotong satu slot jam — jumlah kartu per halaman
  // boleh sedikit meleset dari PAGE_SIZE demi header waktu yang utuh.
  const pages = useMemo(() => {
    const result: TimeGroup[][] = [];
    let current: TimeGroup[] = [];
    let count = 0;

    allTimeGroups.forEach((group) => {
      if (current.length > 0 && count + group.matches.length > PAGE_SIZE) {
        result.push(current);
        current = [];
        count = 0;
      }
      current.push(group);
      count += group.matches.length;
    });

    if (current.length > 0) result.push(current);
    return result;
  }, [allTimeGroups]);

  const totalPages = Math.max(1, pages.length);
  const safePage = Math.min(page, totalPages);
  const timeGroups = pages[safePage - 1] ?? [];

  // Nomor kartu pertama di halaman ini — untuk teks "Menampilkan x–y dari z".
  const pageStart = pages
    .slice(0, safePage - 1)
    .reduce((sum, groups) => sum + groups.reduce((n, g) => n + g.matches.length, 0), 0);
  const pageCount = timeGroups.reduce((n, g) => n + g.matches.length, 0);

  const goToPage = (next: number) => {
    filters.setSchedPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    <div ref={listTopRef} className="flex scroll-mt-24 flex-col gap-5">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <FilterSelect
          options={dayOptions}
          value={day}
          onChange={filters.setSchedDay}
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
          onChange={filters.setSchedCategory}
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
          onChange={filters.setSchedLevel}
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
                    isLight ? "text-[#6C47D1]" : "text-[#02F5D4]"
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
          title="Jadwal Pertandingan Belum Tersedia"
          description="Belum ada laga yang dijadwalkan untuk kategori ini. Silakan cek sesi mendatang."
          footerNote="Jadwal akan diperbarui otomatis saat babak baru dimulai"
          isLight={isLight}
        />
      )}

      {filteredMatches.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
          label="Navigasi halaman jadwal pertandingan"
          isLight={isLight}
          summary={
            <>
              Menampilkan {pageStart + 1}–{pageStart + pageCount} dari{" "}
              {filteredMatches.length} pertandingan
            </>
          }
        />
      )}
    </div>
  );
}
