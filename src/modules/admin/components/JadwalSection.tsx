"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import { Play } from "lucide-react";
import { getMatches, deleteMatch, updateMatchSchedule, startMatch } from "@/lib/api/matches";
import type { Match, MatchStatus } from "@/lib/types";

const STATUS_STYLE: Record<MatchStatus, { bg: string; color: string }> = {
  SCHEDULED: { bg: "#FEF3C7", color: "#92400E" },
  ONGOING:   { bg: "#DBEAFE", color: "#1E40AF" },
  FINISHED:  { bg: "#DCFCE7", color: "#166534" },
  RETIRED:   { bg: "#FEE2E2", color: "#991B1B" },
};

export function JadwalSection({ onStartAndSwitch }: { onStartAndSwitch?: (matchId: string) => void } = {}) {
  const [data, setData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterDate, setFilterDate] = useState(""); // Format YYYY-MM-DD
  
  const [editForm, setEditForm] = useState({ id: "", courtNumber: "", scheduledTime: "" });

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    const m = await getMatches(filterStatus ? { status: filterStatus as MatchStatus } : undefined);
    setData(m || []);
    if (showSpinner) setIsLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveEdit() {
    setIsSaving(true); setError("");
    try {
      const courtNumber = editForm.courtNumber ? parseInt(editForm.courtNumber) : undefined;
      const scheduledTime = editForm.scheduledTime ? new Date(editForm.scheduledTime).toISOString() : undefined;
      
      await updateMatchSchedule(editForm.id, { courtNumber, scheduledTime });
      
      // OPTIMIZATION: Update local state immediately without triggering a heavy getMatches()
      setData(prev => prev.map(m => m.id === editForm.id ? { ...m, courtNumber, scheduledTime } : m));
      
      setEditModalOpen(false);
      setEditForm({ id: "", courtNumber: "", scheduledTime: "" });
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Gagal"); 
    } finally { 
      setIsSaving(false); 
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal pertandingan ini?")) return;
    await deleteMatch(id); await load(false);
  }

  async function handleStart(match: Match) {
    setStarting(match.id);
    try {
      await startMatch(match.id);
      onStartAndSwitch?.(match.id);
      await load(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memulai match");
    } finally { setStarting(null); }
  }

  function openEditModal(match: Match) {
    let localTime = "";
    if (match.scheduledTime) {
      const d = new Date(match.scheduledTime);
      const offset = d.getTimezoneOffset() * 60000;
      localTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }
    
    setEditForm({
      id: match.id,
      courtNumber: match.courtNumber ? String(match.courtNumber) : "",
      scheduledTime: localTime,
    });
    setEditModalOpen(true);
  }

  const filteredData = data.filter(d => {
    if (filterDiscipline && d.disciplineId !== filterDiscipline) return false;
    if (filterLevel && !filterDiscipline) {
      const disc = DISCIPLINES.find(x => x.id === d.disciplineId);
      if (disc?.level !== filterLevel) return false;
    }
    if (filterDate && d.scheduledTime) {
      const matchDate = new Date(d.scheduledTime).toISOString().split('T')[0];
      if (matchDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Jadwal Pertandingan"
        subtitle="Kelola jadwal lapangan dan waktu pertandingan"
      />

      {/* Filter */}
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {["", "SCHEDULED", "ONGOING", "FINISHED", "RETIRED"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
              style={filterStatus === s 
                ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" } 
                : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
              {s || "Semua Status"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="w-40">
            <DashInput
              type="date"
              value={filterDate}
              onChange={setFilterDate}
              placeholder="Filter Tanggal"
            />
          </div>
          <div className="w-40">
            <DashSelect
              value={filterLevel}
              onChange={(v) => { setFilterLevel(v); setFilterDiscipline(""); }}
              placeholder="Semua Tingkat"
              options={LEVELS}
            />
          </div>
          <div className="w-56">
            <DashSelect
              value={filterDiscipline}
              onChange={setFilterDiscipline}
              placeholder="Semua Kategori"
              options={(filterLevel ? getDisciplinesByLevel(filterLevel) : DISCIPLINES).map(d => ({ value: d.id, label: d.name }))}
            />
          </div>
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        data={filteredData}
        emptyText="Tidak ada match ditemukan"
        columns={[
          { key: "status", header: "Status", render: (row) => {
            const s = STATUS_STYLE[row.status];
            return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{row.status}</span>;
          }},
          { key: "roundName", header: "Babak" },
          { key: "groupName", header: "Grup", render: (row) => row.groupName ?? "-" },
          { key: "courtNumber", header: "Lapangan", render: (row) => row.courtNumber ? `Lap. ${row.courtNumber}` : "-" },
          { key: "scheduledTime", header: "Jadwal", render: (row) => row.scheduledTime ? new Date(row.scheduledTime).toLocaleString("id-ID") : "-" },
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
          <div className="flex gap-2">
            {row.status === "SCHEDULED" && (
              <button
                onClick={() => handleStart(row)}
                disabled={starting === row.id}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#6C47D1" }}
              >
                <Play size={12} />
                {starting === row.id ? "Memulai..." : "Mulai"}
              </button>
            )}
            <button
              onClick={() => openEditModal(row)}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition"
            >
              Hapus
            </button>
          </div>
        )}
      />

      <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setError(""); }} title="Edit Jadwal & Lapangan" size="md"
        footer={<><ModalCancelButton onClick={() => { setEditModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSaveEdit} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <div className="grid grid-cols-1 gap-4">
          <FormField label="No. Lapangan">
            <DashInput value={editForm.courtNumber} onChange={(v) => setEditForm(f => ({ ...f, courtNumber: v }))} placeholder="1" type="number" />
          </FormField>
          <FormField label="Jadwal (tanggal & waktu)">
            <DashInput value={editForm.scheduledTime} onChange={(v) => setEditForm(f => ({ ...f, scheduledTime: v }))} type="datetime-local" />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
