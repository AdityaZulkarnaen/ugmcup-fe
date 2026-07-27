"use client";

import { useMemo, useState } from "react";
import {
  scheduleCategories,
  scheduleDays,
  scheduleMatches,
} from "@/lib/constants/matches";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { ScheduleRow } from "./ScheduleRow";

export function SchedulePanel() {
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");

  const matches = useMemo(
    () =>
      scheduleMatches.filter(
        (match) =>
          (day === "all" || match.date === day) &&
          (category === "all" || match.categoryId === category),
      ),
    [day, category],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <FilterSelect
          options={scheduleDays}
          value={day}
          onChange={setDay}
          label="Filter hari"
          accent="gold"
          accented={day !== "all"}
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
          optionLabel={(option) =>
            option.id === "all" ? "Semua Kategori" : option.label
          }
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
