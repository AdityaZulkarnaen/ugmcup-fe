"use client";

import { RotateCcw } from "lucide-react";

/**
 * Mengembalikan filter ke setelan awal panel — bukan mengosongkannya. Bedanya
 * terasa di Jadwal, yang secara bawaan sudah menyaring ke satu hari tertentu:
 * "tanpa filter" akan menampilkan seluruh turnamen, sedangkan tombol ini
 * mengembalikan pilihan hari otomatis itu.
 *
 * Tetap terlihat walau tidak ada yang bisa direset, hanya nonaktif, supaya
 * posisinya tidak berpindah-pindah saat filter diubah.
 */
export function ResetFiltersButton({
  onClick,
  disabled = false,
  isLight = false,
  className = "",
  label = "Reset filter",
}: {
  onClick: () => void;
  /** True saat filter sudah berada di setelan awal. */
  disabled?: boolean;
  isLight?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Filter sudah pada setelan awal" : "Kembalikan filter ke setelan awal"}
      className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-40 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[#808080] enabled:hover:border-[rgba(0,0,0,0.15)] enabled:hover:text-[#1a162b]"
          : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] enabled:hover:border-white/15 enabled:hover:text-white"
      } ${className}`}
    >
      <RotateCcw size={13} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
