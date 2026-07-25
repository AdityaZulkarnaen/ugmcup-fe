"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { getAuditLogs } from "@/lib/api/admin";
import type { AuditLog } from "@/lib/types";

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  UPDATE_SCORE: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  FINISH_MATCH: { bg: "rgba(102,255,180,0.15)", color: "#66FFB4" },
  START_MATCH: { bg: "rgba(131,82,217,0.15)", color: "#D9D3FF" },
  CREATE_MATCH: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
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

      <div className="mb-4 flex gap-2 flex-wrap items-center">
        {["", "UPDATE_SCORE", "FINISH_MATCH", "START_MATCH", "CREATE_MATCH"].map((a) => (
          <button key={a} onClick={() => setActionFilter(a)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            style={actionFilter === a ? { background: "#8352D9", color: "#fff" } : { background: "rgba(255,255,255,0.05)", color: "#9D9DB6" }}>
            {a || "Semua"}
          </button>
        ))}
      </div>

      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada log aktivitas"
        columns={[
          { key: "createdAt", header: "Waktu", render: (row) => new Date(row.createdAt).toLocaleString("id-ID") },
          { key: "admin", header: "Admin", render: (row) => <span className="font-semibold text-white">{row.admin?.username ?? "-"}</span> },
          { key: "action", header: "Aksi", render: (row) => {
            const s = ACTION_STYLE[row.action] ?? { bg: "rgba(255,255,255,0.08)", color: "#9D9DB6" };
            return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{row.action}</span>;
          }},
          { key: "entity", header: "Entitas" },
          { key: "entityId", header: "ID Entitas", render: (row) => <span className="font-mono text-xs text-white/60">{row.entityId.slice(0, 8)}…</span> },
        ]}
        actions={(row) => (
          <button onClick={() => setSelected(row)} className="rounded-lg px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            Detail
          </button>
        )}
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl border p-6" style={{ background: "linear-gradient(135deg, #1A1830, #14183B)", borderColor: "rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-white">Detail Audit Log</h3>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span style={{ color: "#9D9DB6" }}>Waktu:</span> <span className="text-white ml-2">{new Date(selected.createdAt).toLocaleString("id-ID")}</span></div>
              <div><span style={{ color: "#9D9DB6" }}>Admin:</span> <span className="text-white ml-2">{selected.admin?.username ?? "-"}</span></div>
              <div><span style={{ color: "#9D9DB6" }}>Aksi:</span> <span className="text-white ml-2 font-semibold">{selected.action}</span></div>
              <div><span style={{ color: "#9D9DB6" }}>Entitas:</span> <span className="text-white ml-2">{selected.entity} — <code className="font-mono">{selected.entityId}</code></span></div>
              {selected.oldValue && (
                <div><span style={{ color: "#9D9DB6" }}>Sebelum:</span><pre className="mt-1 rounded-xl p-3 text-xs text-white/80 overflow-auto" style={{ background: "rgba(255,255,255,0.05)" }}>{JSON.stringify(selected.oldValue, null, 2)}</pre></div>
              )}
              {selected.newValue && (
                <div><span style={{ color: "#9D9DB6" }}>Sesudah:</span><pre className="mt-1 rounded-xl p-3 text-xs" style={{ background: "rgba(102,255,180,0.05)", color: "#66FFB4" }}>{JSON.stringify(selected.newValue, null, 2)}</pre></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
