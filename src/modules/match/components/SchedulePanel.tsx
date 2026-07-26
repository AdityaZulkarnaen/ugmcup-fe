"use client";

import { useMemo, useState } from "react";
import {
  scheduleCategories,
  scheduleDays,
  scheduleMatches,
  type ScheduleFilter,
} from "@/lib/constants/matches";
import { ScheduleRow } from "./ScheduleRow";

/** One row of pill filters; "Semua" is always the first option. */
function FilterPills({
  options,
  active,
  onChange,
  label,
}: {
  options: ScheduleFilter[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const isActive = option.id === active;
        const isCategory = label.toLowerCase().includes("kategori");
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? ` ${isCategory ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/20 text-[#C4B5FD]" : "border-[#EF9F27]/30 bg-[#EF9F27]/15 text-[#FAC775]"}`
                : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] hover:border-white/15 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SchedulePanel() {
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");

  const matches = useMemo(
    () =>
      scheduleMatches.filter(
        (match) =>
          (day === "all" || match.dayId === day) &&
          (category === "all" || match.categoryId === category),
      ),
    [day, category],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-col gap-2.5">
        <FilterPills
          options={scheduleDays}
          active={day}
          onChange={setDay}
          label="Filter hari"
        />
        <FilterPills
          options={scheduleCategories}
          active={category}
          onChange={setCategory}
          label="Filter kategori"
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
