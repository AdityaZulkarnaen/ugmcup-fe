"use client";

import { useMemo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** Halaman aktif, 1-based. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Teks ringkasan di sisi kiri, mis. "Menampilkan 1–10 dari 42 atlet". */
  summary?: ReactNode;
  /** Label aksesibilitas untuk elemen nav. */
  label?: string;
  isLight?: boolean;
  className?: string;
}

/**
 * Navigasi halaman dengan deret nomor beringkas: 1 … 4 5 6 … 12.
 * Dipakai bersama oleh tab Jadwal dan tab Player.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  summary,
  label = "Navigasi halaman",
  isLight = false,
  className = "",
}: PaginationProps) {
  const pageItems = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
        acc.push(p);
        return acc;
      }, []);
  }, [totalPages, page]);

  const stepButton = `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
    isLight
      ? "border-black/10 text-[#1a162b] hover:enabled:bg-black/5"
      : "border-white/10 text-white hover:enabled:bg-white/10"
  }`;

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}
    >
      {summary ? (
        <span
          className={`text-xs ${
            isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#7A7A83]"
          }`}
        >
          {summary}
        </span>
      ) : (
        <span />
      )}

      {totalPages > 1 && (
        <nav aria-label={label} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Halaman sebelumnya"
            className={stepButton}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {pageItems.map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className={`px-1 text-xs ${
                  isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"
                }`}
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition ${
                  item === page
                    ? isLight
                      ? "border-[#6C47D1] bg-[#6C47D1] text-white"
                      : "border-[#8b5cf6] bg-[#8b5cf6] text-white"
                    : isLight
                      ? "border-black/10 text-[rgba(26,22,43,0.7)] hover:bg-black/5"
                      : "border-white/10 text-[#8A8A93] hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Halaman berikutnya"
            className={stepButton}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}
