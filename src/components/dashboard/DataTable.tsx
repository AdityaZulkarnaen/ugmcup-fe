import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onDelete?: (id: string) => void;
  onEdit?: (item: T) => void;
  isLoading?: boolean;
  emptyText?: string;
  actions?: (item: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  onEdit,
  isLoading,
  emptyText = "Belum ada data",
  actions,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#66FFB4" }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.04)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#9D9DB6" }}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "#9D9DB6" }}>
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)}
                className="px-4 py-12 text-center"
                style={{ color: "#9D9DB6" }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id}
                className="border-t transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-white/90">
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "-")}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions ? (
                        actions(row)
                      ) : (
                        <>
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="rounded-lg px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row.id)}
                              className="rounded-lg px-3 py-1 text-xs font-semibold transition hover:bg-red-500/10"
                              style={{ color: "#f87171" }}
                            >
                              Hapus
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
  );
}
