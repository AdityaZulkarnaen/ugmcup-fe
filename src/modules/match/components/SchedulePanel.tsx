"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  scheduleCategories,
  scheduleDays,
  scheduleMatches,
  type ScheduleFilter,
} from "@/lib/constants/matches";
import { CheckIcon, ChevronIcon } from "@/components/ui/icons";
import { ScheduleRow } from "./ScheduleRow";

/** Accent palettes: gold for the day filter, violet for the category filter. */
const accents = {
  gold: {
    trigger: "border-[#EF9F27]/30 bg-[#EF9F27]/15 text-[#FAC775]",
    option: "bg-[#EF9F27]/15 text-[#FAC775]",
  },
  violet: {
    trigger: "border-[#8B5CF6]/40 bg-[#8B5CF6]/20 text-[#C4B5FD]",
    option: "bg-[#8B5CF6]/20 text-[#C4B5FD]",
  },
} as const;

type Accent = keyof typeof accents;

/**
 * Dropdown filter. Closed it shows the current selection; the trigger only
 * takes the accent colours once a real filter (not "Semua") is picked.
 */
function FilterSelect({
  options,
  value,
  onChange,
  label,
  allLabel,
  accent,
}: {
  options: ScheduleFilter[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /** Wording for the "all" option, e.g. "Semua Hari". */
  allLabel: string;
  accent: Accent;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const theme = accents[accent];

  const optionLabel = (option: ScheduleFilter) =>
    option.id === "all" ? allLabel : option.label;

  const selected = options.find((option) => option.id === value) ?? options[0];
  const isFiltered = value !== "all";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  /** Arrow keys walk the option buttons once the list is open. */
  function moveFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
        [],
    );
    if (items.length === 0) return;
    event.preventDefault();

    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = (current + step + items.length) % items.length;
    items[current === -1 ? 0 : next].focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative w-full sm:w-56"
      onKeyDown={moveFocus}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
          isFiltered
            ? theme.trigger
            : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] hover:border-white/15 hover:text-white"
        }`}
      >
        {optionLabel(selected)}
        <ChevronIcon
          className={`shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-20 mt-2 flex max-h-64 w-full flex-col gap-0.5 overflow-y-auto rounded-2xl border border-white/10 bg-[#1B1730] p-1.5 shadow-xl shadow-black/40"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                  isSelected
                    ? theme.option
                    : "text-[#8A8A93] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {optionLabel(option)}
                {isSelected && <CheckIcon className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
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
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <FilterSelect
          options={scheduleDays}
          value={day}
          onChange={setDay}
          label="Filter hari"
          allLabel="Semua Hari"
          accent="gold"
        />
        <FilterSelect
          options={scheduleCategories}
          value={category}
          onChange={setCategory}
          label="Filter kategori"
          allLabel="Semua Kategori"
          accent="violet"
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
