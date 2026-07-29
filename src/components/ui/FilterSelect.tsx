"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronIcon } from "@/components/ui/icons";

export interface FilterOption {
  id: string;
  label: string;
}

/** Accent palettes for the trigger and the selected option — dark theme. */
const accentsDark = {
  gold: {
    trigger: "border-[#EF9F27]/30 bg-[#EF9F27]/15 text-[#FAC775]",
    option: "bg-[#EF9F27]/15 text-[#FAC775]",
  },
  violet: {
    trigger: "border-[#8B5CF6]/40 bg-[#8B5CF6]/20 text-[#C4B5FD]",
    option: "bg-[#8B5CF6]/20 text-[#C4B5FD]",
  },
} as const;

/** Accent palettes for the trigger and the selected option — light theme. */
const accentsLight = {
  gold: {
    trigger: "border-[#fee685] bg-[#fffbeb] text-[#bb4d00]",
    option: "bg-[#fffbeb] text-[#bb4d00]",
  },
  violet: {
    trigger: "border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]",
    option: "bg-[#8b5cf6]/10 text-[#8b5cf6]",
  },
} as const;

export type FilterAccent = keyof typeof accentsDark;

/**
 * Dropdown filter. Closed it shows the current selection; the trigger takes the
 * accent colours only while `accented` is true — the panels pass false for a
 * neutral "no filter applied" state.
 */
export function FilterSelect({
  options,
  value,
  onChange,
  label,
  accent = "gold",
  accented = true,
  optionLabel = (option) => option.label,
  className = "w-full sm:w-56",
  isLight = false,
}: {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the trigger and the option list. */
  label: string;
  accent?: FilterAccent;
  /** False keeps the closed trigger neutral, e.g. while nothing is filtered. */
  accented?: boolean;
  /** Override the visible text of an option, e.g. to widen the "all" entry. */
  optionLabel?: (option: FilterOption) => string;
  className?: string;
  /** If true, renders the Figma Light Mode palette. */
  isLight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const theme = isLight ? accentsLight[accent] : accentsDark[accent];

  const selected = options.find((option) => option.id === value) ?? options[0];

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
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={moveFocus}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
          accented
            ? theme.trigger
            : isLight
              ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[#808080] hover:border-[rgba(0,0,0,0.15)] hover:text-[#1a162b]"
              : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] hover:border-white/15 hover:text-white"
        }`}
      >
        <span className="truncate">{selected ? optionLabel(selected) : ""}</span>
        <ChevronIcon
          className={`shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`scrollbar-thumb-only absolute left-0 top-full z-30 mt-2 flex max-h-64 w-full flex-col gap-0.5 overflow-y-auto rounded-2xl border p-1.5 shadow-xl ${
            isLight
              ? "border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
              : "border-white/10 bg-[#1B1730] shadow-black/40"
          }`}
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
                    : isLight
                      ? "text-[#808080] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#1a162b]"
                      : "text-[#8A8A93] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="truncate">{optionLabel(option)}</span>
                {isSelected && <CheckIcon className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
