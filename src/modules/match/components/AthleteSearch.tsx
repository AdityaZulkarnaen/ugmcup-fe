import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

export interface SearchOption {
  id: string;
  name: string;
  inst?: string;
  categoryLabel?: string;
}

export function AthleteSearch({
  options,
  selectedId,
  onSelect,
  className = "w-full sm:max-w-xs",
}: {
  options: SearchOption[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => options.find((o) => o.id === selectedId), [options, selectedId]);
  const value = selectedOption ? selectedOption.name : query;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(lower) || o.inst?.toLowerCase().includes(lower));
  }, [query, options]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function pick(option: SearchOption) {
    onSelect(option.id);
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
          selectedOption
            ? "border-[#EF9F27]/40 bg-[#EF9F27]/10"
            : "border-white/[0.08] bg-white/[0.02] focus-within:border-white/20"
        }`}
      >
        <SearchIcon
          className={`shrink-0 ${selectedOption ? "text-[#FAC775]" : "text-[#6B6B73]"}`}
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
            if (selectedOption) onSelect(undefined);
          }}
          onFocus={() => setOpen(true)}
          className={`min-w-0 flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-[#6B6B73] [&::-webkit-search-cancel-button]:hidden ${
            selectedOption ? "text-[#FAC775]" : "text-white"
          }`}
        />
        {value !== "" && (
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus pencarian"
            className="shrink-0 text-[#8A8A93] transition-colors hover:text-white"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {open && query.trim() !== "" && !selectedOption && (
        <div
          id="athlete-search-results"
          role="listbox"
          aria-label="Hasil pencarian atlet"
          className="scrollbar-thumb-only absolute left-0 top-full z-30 mt-2 flex max-h-72 w-full flex-col gap-0.5 overflow-y-auto rounded-2xl border border-white/10 bg-[#1B1730] p-1.5 shadow-xl shadow-black/40"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-[#6B6B73]">
              Atlet tidak ditemukan.
            </p>
          ) : (
            results.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(option)}
                className="flex flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.04] focus:bg-white/[0.04] focus:outline-none"
              >
                <span className="truncate text-xs font-semibold text-white">
                  {option.name}
                </span>
                {option.inst && (
                  <span className="truncate text-[11px] text-[#7A7A83]">
                    {option.inst}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
