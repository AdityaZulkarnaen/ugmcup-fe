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

export function SchedulePanel() {
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
      {/* Filters — two per row on phones, where three would truncate every
          label down to a few characters; one row from sm up. */}
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <FilterSelect
          options={scheduleDays}
          value={day}
          onChange={setDay}
          label="Filter hari"
          accent="gold"
          accented={day !== "all"}
          className="min-w-0 flex-1 sm:max-w-56"
          optionLabel={(option) =>
            option.id === "all" ? "Semua Hari" : option.label
          }
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
        />
        <FilterSelect
          options={tierFilters}
          value={tier}
          onChange={setTier}
          label="Filter jenjang"
          accent="gold"
          accented={tier !== "all"}
          className="col-span-2 min-w-0 flex-1 sm:col-span-1 sm:max-w-56"
        />
      </div>

      {/* List */}
      {matches.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {matches.map((match) => (
            <ScheduleRow key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-sm text-[#7A7A83]">
          Tidak ada pertandingan untuk filter ini.
        </div>
      )}
    </div>
  );
}
