"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, X } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getAuditLogs } from "@/lib/api/admin";
import type { AuditLog } from "@/lib/types";

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  UPDATE_SCORE: { bg: "#FEF9C3", color: "#854D0E" },
  FINISH_MATCH: { bg: "#DCFCE7", color: "#166534" },
  START_MATCH:  { bg: "#EDE9FE", color: "#5B21B6" },
  CREATE_MATCH: { bg: "#DBEAFE", color: "#1E40AF" },
};

export function AuditLogSection() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await getAuditLogs(actionFilter ? { action: actionFilter } : undefined));
    } finally { setIsLoading(false); }
  }, [actionFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Riwayat semua perubahan data oleh admin dan panitia" />

      {/* Action filter chips */}
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        {["", "UPDATE_SCORE", "FINISH_MATCH", "START_MATCH", "CREATE_MATCH"].map((a) => (
          <button key={a} onClick={() => setActionFilter(a)}
            className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
            style={actionFilter === a
              ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" }
              : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }
            }>
            {a || "Semua"}
          </button>
        ))}
      </div>

      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada log aktivitas"
        searchPlaceholder="Cari admin, aksi, entitas..."
        columns={[
          { key: "createdAt", header: "Waktu", render: (row) => new Date(row.createdAt).toLocaleString("id-ID") },
          { key: "admin",     header: "Admin",  render: (row) => <span className="font-semibold" style={{ color: "#111827" }}>{row.admin?.username ?? "—"}</span> },
          { key: "action",    header: "Aksi",   render: (row) => {
            const s = ACTION_BADGE[row.action] ?? { bg: "#F3F4F6", color: "#374151" };
            return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{row.action}</span>;
          }},
          { key: "entity",    header: "Entitas" },
          { key: "entityId",  header: "ID",     render: (row) => <span className="font-mono text-xs" style={{ color: "#9CA3AF" }}>{row.entityId.slice(0, 8)}…</span> },
        ]}
        actions={(row) => (
          <button
            onClick={() => setSelected(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-purple-50"
            title="Detail"
            style={{ color: "#6C47D1" }}
          >
            <Eye size={14} />
          </button>
        )}
      />

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl"
            style={{ borderColor: "#E5E7EB" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: "#111827" }}>Detail Audit Log</h3>
              <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100" style={{ color: "#6B7280" }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2"><span style={{ color: "#6B7280" }}>Waktu:</span> <span style={{ color: "#111827" }}>{new Date(selected.createdAt).toLocaleString("id-ID")}</span></div>
              <div className="flex gap-2"><span style={{ color: "#6B7280" }}>Admin:</span> <span style={{ color: "#111827" }} className="font-semibold">{selected.admin?.username ?? "—"}</span></div>
              <div className="flex gap-2"><span style={{ color: "#6B7280" }}>Aksi:</span> <span style={{ color: "#111827" }} className="font-semibold">{selected.action}</span></div>
              <div className="flex gap-2"><span style={{ color: "#6B7280" }}>Entitas:</span> <span style={{ color: "#111827" }}>{selected.entity} — <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{selected.entityId}</code></span></div>
              {selected.oldValue && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7280" }}>Sebelum:</span>
                  <pre className="mt-1 rounded-lg p-3 text-xs overflow-auto" style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB" }}>{JSON.stringify(selected.oldValue, null, 2)}</pre>
                </div>
              )}
              {selected.newValue && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7280" }}>Sesudah:</span>
                  <pre className="mt-1 rounded-lg p-3 text-xs overflow-auto" style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>{JSON.stringify(selected.newValue, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
