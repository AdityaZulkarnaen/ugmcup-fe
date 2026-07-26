"use client";

import { useEffect, useState, useCallback } from "react";
import { Play } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { getMatches, startMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";

export function JadwalPanitiaSection({ onStartAndSwitch }: { onStartAndSwitch?: (matchId: string) => void }) {
  const [data, setData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const { lastUpdate } = useGlobalPanitiaRoom();

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      setData(await getMatches({ status: "SCHEDULED" }));
    } finally { 
      if (!isBackground) setIsLoading(false); 
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Realtime updates
  useEffect(() => { 
    if (lastUpdate > 0) load(true); 
  }, [lastUpdate, load]);

  async function handleStart(match: Match) {
    setStarting(match.id);
    try {
      await startMatch(match.id);
      onStartAndSwitch?.(match.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memulai match");
    } finally { setStarting(null); }
  }

  return (
    <div>
      <PageHeader title="Jadwal Match" subtitle="Match terjadwal yang siap dimulai" />
      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Tidak ada match terjadwal"
        searchPlaceholder="Cari babak, grup, lapangan..."
        columns={[
          { key: "roundName",  header: "Babak" },
          { key: "groupName",  header: "Grup",      render: (row) => row.groupName ?? "—" },
          { key: "court",      header: "Lapangan",  render: (row) => row.courtNumber ? `Lap. ${row.courtNumber}` : "—" },
          { key: "scheduledTime", header: "Jadwal", render: (row: any) => row.scheduledTime
            ? new Date(row.scheduledTime).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
            : "—" },
          { key: "discipline", header: "Kategori", render: (row: any) => row.discipline?.name ?? "—" },
          { key: "participantA", header: "Peserta A", render: (row: any) => {
            const isIndividu = row.participantA;
            const athletes = isIndividu ? row.participantA?.athletes?.map((a:any) => a.athlete.name).join(" & ") : null;
            const instName = row.participantA?.institution?.name ?? row.teamA?.institution?.name ?? "—";
            if (isIndividu && athletes) return <div className="flex flex-col"><span className="font-semibold">{athletes}</span><span className="text-xs text-gray-500">{instName}</span></div>;
            return instName;
          }},
          { key: "participantB", header: "Peserta B", render: (row: any) => {
            const isIndividu = row.participantB;
            const athletes = isIndividu ? row.participantB?.athletes?.map((a:any) => a.athlete.name).join(" & ") : null;
            const instName = row.participantB?.institution?.name ?? row.teamB?.institution?.name ?? "—";
            if (isIndividu && athletes) return <div className="flex flex-col"><span className="font-semibold">{athletes}</span><span className="text-xs text-gray-500">{instName}</span></div>;
            return instName;
          }},
        ]}
        actions={(row) => (
          <button
            onClick={() => handleStart(row)}
            disabled={starting === row.id}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#6C47D1" }}
          >
            <Play size={12} />
            {starting === row.id ? "Memulai..." : "Mulai"}
          </button>
        )}
      />
    </div>
  );
}
