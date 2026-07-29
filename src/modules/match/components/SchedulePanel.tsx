"use client";

import { useMemo, useState } from "react";
import {
  scheduleCategories,
  scheduleDays,
  scheduleMatches,
  tierFilters,
} from "@/lib/constants/matches";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { ScheduleRow } from "./ScheduleRow";

interface SchedulePanelProps {
  isLight?: boolean;
}

export function SchedulePanel({ isLight = false }: SchedulePanelProps) {
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");
  const [tier, setTier] = useState("all");

  const matches = useMemo(
    () =>
      scheduleMatches.filter(
        (match) =>
          (day === "all" || match.date === day) &&
          (category === "all" || match.categoryId === category) &&
          (tier === "all" || match.tier === tier),
      ),
    [day, category, tier],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <FilterSelect
          options={scheduleDays}
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
          options={scheduleCategories}
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
          options={tierFilters}
          value={tier}
          onChange={setTier}
          label="Filter jenjang"
          accent="mint"
          accented={tier !== "all"}
          className="col-span-2 min-w-0 flex-1 sm:col-span-1 sm:max-w-56"
          isLight={isLight}
        />
      </div>

      {/* List */}
      {matches.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {matches.map((match) => (
            <ScheduleRow key={match.id} match={match} isLight={isLight} />
          ))}
        </div>
      ) : (
        <div
          className={`flex min-h-40 items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm ${
            isLight
              ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[rgba(26,22,43,0.4)]"
              : "border-white/10 bg-white/[0.01] text-[#7A7A83]"
          }`}
        >
          Tidak ada pertandingan untuk filter ini.
        </div>
      )}
    </div>
  );
}
