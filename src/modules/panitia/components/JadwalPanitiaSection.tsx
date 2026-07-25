"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { getMatches, startMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";

export function JadwalPanitiaSection({ onStartAndSwitch }: { onStartAndSwitch?: (matchId: string) => void }) {
  const [data, setData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await getMatches({ status: "SCHEDULED" }));
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      <PageHeader title="Jadwal Match" subtitle="Match yang sudah terjadwal dan siap dimulai" />
      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Tidak ada match terjadwal"
        columns={[
          { key: "roundName", header: "Ronde" },
          { key: "groupName", header: "Grup", render: (row) => row.groupName ?? "-" },
          { key: "courtNumber", header: "Lapangan", render: (row) => row.courtNumber ? `Lapangan ${row.courtNumber}` : "-" },
          { key: "scheduledTime", header: "Jadwal", render: (row) => row.scheduledTime ? new Date(row.scheduledTime).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "-" },
          { key: "participantA", header: "Peserta A", render: (row) => row.participantA?.institution?.name ?? row.teamA?.institution?.name ?? "-" },
          { key: "participantB", header: "Peserta B", render: (row) => row.participantB?.institution?.name ?? row.teamB?.institution?.name ?? "-" },
        ]}
        actions={(row) => (
          <button
            onClick={() => handleStart(row)}
            disabled={starting === row.id}
            className="rounded-xl px-4 py-1.5 text-xs font-bold text-[#14183B] transition hover:brightness-110 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #66FFB4, #02F5D4)" }}
          >
            {starting === row.id ? "Memulai..." : "▶ Mulai Match"}
          </button>
        )}
      />
    </div>
  );
}
