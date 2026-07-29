"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  searchBracketAthletes,
  sideName,
  type BracketAthlete,
} from "@/lib/constants/matches";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

/**
 * Athlete lookup across every bracket. Picking a result hands the entry back so
 * the panel can switch category and light up that athlete's path.
 */
export function AthleteSearch({
  selected,
  onSelect,
  className = "w-full sm:max-w-xs",
  isLight = false,
}: {
  selected?: BracketAthlete;
  onSelect: (athlete?: BracketAthlete) => void;
  className?: string;
  isLight?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * A pinned athlete owns the box — including when the bracket pins one by
   * click — so the typed query only shows while nothing is selected.
   */
  const value = selected ? sideName(selected.participant.players) : query;
  const results = useMemo(() => searchBracketAthletes(query), [query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function pick(athlete: BracketAthlete) {
    onSelect(athlete);
    setOpen(false);
    inputRef.current?.blur();
  }

  function clear() {
    onSelect(undefined);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && open && results.length > 0) {
      event.preventDefault();
      pick(results[0]);
      return;
    }
    if (event.key === "ArrowDown" && open) {
      event.preventDefault();
      rootRef.current
        ?.querySelector<HTMLButtonElement>('[role="option"]')
        ?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
          selected
            ? isLight
              ? "border-[#D9D3FF] bg-[#F3F0FF]"
              : "border-[#02F5D4]/40 bg-[#02F5D4]/10"
            : isLight
              ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] focus-within:border-[rgba(0,0,0,0.15)]"
              : "border-white/[0.08] bg-white/[0.02] focus-within:border-white/20"
        }`}
      >
        <SearchIcon
          className={`shrink-0 ${
            selected
              ? isLight ? "text-[#6C47D1]" : "text-[#5CFCE7]"
              : isLight ? "text-[rgba(26,22,43,0.3)]" : "text-[#6B6B73]"
          }`}
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="athlete-search-results"
          aria-label="Cari atlet"
          placeholder="Cari atlet..."
          value={value}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (selected) onSelect(undefined);
          }}
          onFocus={() => setOpen(true)}
          className={`min-w-0 flex-1 bg-transparent text-xs font-medium outline-none [&::-webkit-search-cancel-button]:hidden ${
            selected
              ? isLight ? "text-[#6C47D1] placeholder:text-[#6C47D1]/50" : "text-[#5CFCE7] placeholder:text-[#6B6B73]"
              : isLight ? "text-[#1a162b] placeholder:text-[rgba(26,22,43,0.35)]" : "text-white placeholder:text-[#6B6B73]"
          }`}
        />
        {value !== "" && (
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus pencarian"
            className={`shrink-0 transition-colors ${
              isLight ? "text-[#808080] hover:text-[#1a162b]" : "text-[#8A8A93] hover:text-white"
            }`}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {open && query.trim() !== "" && !selected && (
        <div
          id="athlete-search-results"
          role="listbox"
          aria-label="Hasil pencarian atlet"
          className={`scrollbar-thumb-only absolute left-0 top-full z-30 mt-2 flex max-h-72 w-full flex-col gap-0.5 overflow-y-auto rounded-2xl border p-1.5 shadow-xl ${
            isLight
              ? "border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
              : "border-white/10 bg-[#1B1730] shadow-black/40"
          }`}
        >
          {results.length === 0 ? (
            <p className={`px-3 py-2.5 text-xs ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"}`}>
              Atlet tidak ditemukan.
            </p>
          ) : (
            results.map((athlete) => (
              <button
                key={`${athlete.categoryId}-${athlete.participant.id}`}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(athlete)}
                className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors focus:outline-none ${
                  isLight
                    ? "hover:bg-[rgba(0,0,0,0.03)] focus:bg-[rgba(0,0,0,0.03)]"
                    : "hover:bg-white/[0.04] focus:bg-white/[0.04]"
                }`}
              >
                <span className={`truncate text-xs font-semibold ${isLight ? "text-[#1a162b]" : "text-white"}`}>
                  {sideName(athlete.participant.players)}
                </span>
                <span className={`truncate text-[11px] ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"}`}>
                  {athlete.categoryLabel} · {athlete.participant.team}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
