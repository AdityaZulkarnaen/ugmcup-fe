"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  getSearchValue?: (row: T) => string;
  searchable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onDelete?: (id: string) => void;
  onEdit?: (item: T) => void;
  isLoading?: boolean;
  emptyText?: string;
  actions?: (item: T) => ReactNode;
  pageSize?: number;
  searchPlaceholder?: string;
}

function getSearchableString(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(getSearchableString).join(" ");
  if (typeof val === "object") return Object.values(val).map(getSearchableString).join(" ");
  return "";
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  onEdit,
  isLoading,
  emptyText = "Belum ada data",
  actions,
  pageSize = 10,
  searchPlaceholder = "Cari...",
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // `search` menyetir input, `query` menyetir filternya. Tanpa pemisahan ini
  // seluruh tabel dirender ulang tiap ketikan — mahal karena `getSearchValue`
  // menelusuri objek bersarang untuk setiap baris.
  const query = useDebouncedValue(search);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.getSearchValue) {
          return col.getSearchValue(row).toLowerCase().includes(q);
        }
        const str = getSearchableString((row as Record<string, unknown>)[col.key]);
        return str.toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-white py-16" style={{ borderColor: "#E5E7EB" }}>
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#6C47D1" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-200"
            style={{ borderColor: "#D1D5DB", color: "#111827" }}
          />
        </div>
        <span className="text-xs" style={{ color: "#6B7280" }}>
          {filtered.length} data
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#374151" }}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "#374151" }}>
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  {query ? "Tidak ditemukan hasil untuk pencarian ini" : emptyText}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid #F3F4F6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3" style={{ color: "#374151" }}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "—")}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions ? (
                          actions(row)
                        ) : (
                          <>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(row)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-purple-50"
                                title="Edit"
                                style={{ color: "#6C47D1" }}
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(row.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                                title="Hapus"
                                style={{ color: "#EF4444" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: "#6B7280" }}>
            Halaman {safePage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
              style={{ borderColor: "#E5E7EB", color: "#374151" }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs" style={{ color: "#9CA3AF" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors"
                    style={
                      safePage === p
                        ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" }
                        : { borderColor: "#E5E7EB", color: "#374151" }
                    }
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
              style={{ borderColor: "#E5E7EB", color: "#374151" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
