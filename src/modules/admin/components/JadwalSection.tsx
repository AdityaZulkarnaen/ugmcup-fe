"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getDisciplines, getParticipants } from "@/lib/api/admin";
import { getMatches, createMatch, deleteMatch, updateMatchSchedule } from "@/lib/api/matches";
import type { Match, Discipline, Participant, MatchStatus } from "@/lib/types";

const STATUS_STYLE: Record<MatchStatus, { bg: string; color: string }> = {
  SCHEDULED: { bg: "#FEF3C7", color: "#92400E" },
  ONGOING:   { bg: "#DBEAFE", color: "#1E40AF" },
  FINISHED:  { bg: "#DCFCE7", color: "#166534" },
  WALKOVER:  { bg: "#FEE2E2", color: "#991B1B" },
};

export function JadwalSection() {
  const [data, setData] = useState<Match[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    disciplineId: "", matchType: "INDIVIDUAL" as "INDIVIDUAL" | "TEAM",
    stage: "GROUP" as "GROUP" | "KNOCKOUT", roundName: "", groupName: "",
    participantAId: "", participantBId: "", courtNumber: "", scheduledTime: "",
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    const [m, d, p] = await Promise.allSettled([
      getMatches(filterStatus ? { status: filterStatus as MatchStatus } : undefined),
      getDisciplines(), getParticipants(),
    ]);
    setData(m.status === "fulfilled" ? m.value : []);
    setDisciplines(d.status === "fulfilled" ? d.value : []);
    setParticipants(p.status === "fulfilled" ? p.value : []);
    setIsLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      await createMatch({
        ...form,
        courtNumber: form.courtNumber ? parseInt(form.courtNumber) : undefined,
        scheduledTime: form.scheduledTime || undefined,
        groupName: form.groupName || undefined,
        participantAId: form.participantAId || undefined,
        participantBId: form.participantBId || undefined,
      });
      setModalOpen(false);
      setForm({ disciplineId: "", matchType: "INDIVIDUAL", stage: "GROUP", roundName: "", groupName: "", participantAId: "", participantBId: "", courtNumber: "", scheduledTime: "" });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal pertandingan ini?")) return;
    await deleteMatch(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="Jadwal Pertandingan"
        subtitle="Buat dan kelola jadwal semua match"
        action={<AddButton onClick={() => setModalOpen(true)} label="Buat Match" />}
      />

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["", "SCHEDULED", "ONGOING", "FINISHED", "WALKOVER"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={filterStatus === s 
              ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" } 
              : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
            {s || "Semua"}
          </button>
        ))}
      </div>

      <DataTable
        isLoading={isLoading}
        data={data}
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
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title="Buat Match Baru" size="lg"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cabang" required>
            <DashSelect value={form.disciplineId} onChange={(v) => setForm(f => ({ ...f, disciplineId: v }))} placeholder="Pilih cabang" options={disciplines.map(d => ({ value: d.id, label: d.name }))} />
          </FormField>
          <FormField label="Tipe Match">
            <DashSelect value={form.matchType} onChange={(v) => setForm(f => ({ ...f, matchType: v as "INDIVIDUAL" | "TEAM" }))} options={[{ value: "INDIVIDUAL", label: "Individual" }, { value: "TEAM", label: "Beregu" }]} />
          </FormField>
          <FormField label="Stage">
            <DashSelect value={form.stage} onChange={(v) => setForm(f => ({ ...f, stage: v as "GROUP" | "KNOCKOUT" }))} options={[{ value: "GROUP", label: "Fase Grup" }, { value: "KNOCKOUT", label: "Fase Gugur" }]} />
          </FormField>
          <FormField label="Nama Ronde" required>
            <DashInput value={form.roundName} onChange={(v) => setForm(f => ({ ...f, roundName: v }))} placeholder="cth. Grup A / Semifinal" />
          </FormField>
          <FormField label="Nama Grup">
            <DashInput value={form.groupName} onChange={(v) => setForm(f => ({ ...f, groupName: v }))} placeholder="cth. Grup A" />
          </FormField>
          <FormField label="No. Lapangan">
            <DashInput value={form.courtNumber} onChange={(v) => setForm(f => ({ ...f, courtNumber: v }))} placeholder="1" type="number" />
          </FormField>
          <FormField label="Peserta A">
            <DashSelect value={form.participantAId} onChange={(v) => setForm(f => ({ ...f, participantAId: v }))} placeholder="Pilih peserta A" options={participants.map(p => ({ value: p.id, label: `${p.institution?.name ?? "?"} — ${p.discipline?.name ?? "?"}` }))} />
          </FormField>
          <FormField label="Peserta B">
            <DashSelect value={form.participantBId} onChange={(v) => setForm(f => ({ ...f, participantBId: v }))} placeholder="Pilih peserta B" options={participants.filter(p => p.id !== form.participantAId).map(p => ({ value: p.id, label: `${p.institution?.name ?? "?"} — ${p.discipline?.name ?? "?"}` }))} />
          </FormField>
        </div>
        <FormField label="Jadwal (tanggal & waktu)">
          <DashInput value={form.scheduledTime} onChange={(v) => setForm(f => ({ ...f, scheduledTime: v }))} type="datetime-local" />
        </FormField>
      </Modal>
    </div>
  );
}
