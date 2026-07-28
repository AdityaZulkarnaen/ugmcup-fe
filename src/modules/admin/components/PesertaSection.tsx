"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, AddButton, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import {
  getInstitutions, getAthletes,
  getParticipants, createParticipant, deleteParticipant,
  getTeams, createTeam, deleteTeam,
} from "@/lib/api/admin";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import type { Institution, Athlete, Participant, Team } from "@/lib/types";

const TEAM_SLOTS = ["TUNGGAL_PUTRA", "TUNGGAL_PUTRI", "GANDA_PUTRA", "GANDA_PUTRI", "TRIPLE_MIX"];

export function PesertaSection() {
  const [tab, setTab] = useState<"individu" | "tim">("individu");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [pFormLevel, setPFormLevel] = useState("");
  const [pForm, setPForm] = useState({ disciplineId: "", institutionId: "", athlete1: "", athlete2: "" });
  // Form Tim
  const [tFormLevel, setTFormLevel] = useState("");
  const [tForm, setTForm] = useState({ disciplineId: "", institutionId: "", slots: {} as Record<string, string> });

  const load = useCallback(async () => {
    setIsLoading(true);
    const [p, t, insts, ath] = await Promise.allSettled([
      getParticipants(), getTeams(), getInstitutions(), getAthletes()
    ]);
    setParticipants(p.status === "fulfilled" ? p.value : []);
    setTeams(t.status === "fulfilled" ? t.value : []);
    setInstitutions(insts.status === "fulfilled" ? insts.value : []);
    setAthletes(ath.status === "fulfilled" ? ath.value : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSaveParticipant() {
    setIsSaving(true); setError("");
    try {
      const athleteIds = [pForm.athlete1, pForm.athlete2].filter(Boolean);
      await createParticipant({ disciplineId: pForm.disciplineId, institutionId: pForm.institutionId, athleteIds });
      setModalOpen(false); setPFormLevel(""); setPForm({ disciplineId: "", institutionId: "", athlete1: "", athlete2: "" });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal"); }
    finally { setIsSaving(false); }
  }

  async function handleSaveTeam() {
    setIsSaving(true); setError("");
    try {
      const members = Object.entries(tForm.slots)
        .filter(([, athleteId]) => athleteId)
        .map(([key, athleteId]) => ({ 
          assignedSlot: key.replace(/_[123]$/, ""), 
          athleteId 
        }));
      await createTeam({ disciplineId: tForm.disciplineId, institutionId: tForm.institutionId, members });
      setModalOpen(false); setTFormLevel(""); setTForm({ disciplineId: "", institutionId: "", slots: {} });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal"); }
    finally { setIsSaving(false); }
  }

  const teamDisciplines = DISCIPLINES.filter((d) => d.isTeamEvent);
  const individualDisciplines = DISCIPLINES.filter((d) => !d.isTeamEvent);

  return (
    <div>
      <PageHeader
        title="Peserta & Tim"
        subtitle="Daftarkan peserta individu dan tim beregu"
        action={<AddButton onClick={() => setModalOpen(true)} label={`Tambah ${tab === "individu" ? "Peserta" : "Tim"}`} />}
      />

      {/* Tab */}
      <div className="mb-6 flex gap-2">
        {(["individu", "tim"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            style={tab === t
              ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" }
              : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
            {t === "individu" ? "Peserta Individu" : "Tim Beregu"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} /></div>
      ) : tab === "individu" ? (
        <div className="space-y-3">
          {participants.length === 0 ? <p className="text-center py-12" style={{ color: "#6B7280" }}>Belum ada peserta individu</p> : participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border bg-white px-5 py-4"
              style={{ borderColor: "#E5E7EB" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#111827" }}>
                  {p.athletes && p.athletes.length > 0 
                    ? p.athletes.map((a: any) => a.athlete?.name).join(" & ") 
                    : (p.institution?.name ?? institutions.find(i => i.id === p.institutionId)?.name ?? "—")}
                </p>
                <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                  <span className="font-medium" style={{ color: "#4B5563" }}>{p.institution?.name ?? institutions.find(i => i.id === p.institutionId)?.name ?? "—"}</span> • {p.discipline?.name ?? DISCIPLINES.find(d => d.id === p.disciplineId)?.name ?? "—"}
                </p>
              </div>
              <button onClick={() => deleteParticipant(p.id).then(load)} className="text-xs px-3 py-1 rounded-lg transition hover:bg-red-50" style={{ color: "#EF4444" }}>Hapus</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {teams.length === 0 ? <p className="text-center py-12" style={{ color: "#6B7280" }}>Belum ada tim beregu</p> : teams.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border bg-white px-5 py-4"
              style={{ borderColor: "#E5E7EB" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#111827" }}>{t.institution?.name ?? institutions.find(i => i.id === t.institutionId)?.name ?? "—"}</p>
                <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Beregu · {t.members?.length ?? 0} anggota</p>
              </div>
              <button onClick={() => deleteTeam(t.id).then(load)} className="text-xs px-3 py-1 rounded-lg transition hover:bg-red-50" style={{ color: "#EF4444" }}>Hapus</button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={tab === "individu" ? "Tambah Peserta Individu" : "Tambah Tim Beregu"} size="lg"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={tab === "individu" ? handleSaveParticipant : handleSaveTeam} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        {tab === "individu" ? (
          <>
            <FormField label="Tingkat" required>
              <DashSelect 
                value={pFormLevel} 
                onChange={(v) => { setPFormLevel(v); setPForm((f) => ({ ...f, disciplineId: "" })); }} 
                placeholder="Pilih tingkat" 
                options={LEVELS} 
              />
            </FormField>
            <FormField label="Cabang Kategori" required>
              <DashSelect 
                value={pForm.disciplineId} 
                onChange={(v) => setPForm((f) => ({ ...f, disciplineId: v }))} 
                placeholder="Pilih kategori" 
                options={(pFormLevel ? individualDisciplines.filter(d => d.level === pFormLevel) : individualDisciplines).map(d => ({ value: d.id, label: d.label }))}
              />
            </FormField>
            <FormField label="Institusi" required>
              <DashSelect value={pForm.institutionId} onChange={(v) => setPForm((f) => ({ ...f, institutionId: v }))} placeholder="Pilih institusi" options={institutions.map((i) => ({ value: i.id, label: i.name }))} />
            </FormField>
            <FormField label="Atlet 1" required>
              <DashSelect value={pForm.athlete1} onChange={(v) => setPForm((f) => ({ ...f, athlete1: v }))} placeholder="Pilih atlet" options={athletes.filter(a => !pForm.institutionId || a.institutionId === pForm.institutionId).map((a) => ({ value: a.id, label: a.name }))} />
            </FormField>
            <FormField label="Atlet 2 (Ganda/Mix)">
              <DashSelect value={pForm.athlete2} onChange={(v) => setPForm((f) => ({ ...f, athlete2: v }))} placeholder="Opsional (untuk ganda)" options={athletes.filter(a => a.id !== pForm.athlete1 && (!pForm.institutionId || a.institutionId === pForm.institutionId)).map((a) => ({ value: a.id, label: a.name }))} />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Tingkat" required>
              <DashSelect 
                value={tFormLevel} 
                onChange={(v) => { setTFormLevel(v); setTForm((f) => ({ ...f, disciplineId: "" })); }} 
                placeholder="Pilih tingkat" 
                options={LEVELS} 
              />
            </FormField>
            <FormField label="Cabang Beregu" required>
              <DashSelect 
                value={tForm.disciplineId} 
                onChange={(v) => setTForm((f) => ({ ...f, disciplineId: v }))} 
                placeholder="Pilih kategori beregu" 
                options={(tFormLevel ? teamDisciplines.filter(d => d.level === tFormLevel) : teamDisciplines).map(d => ({ value: d.id, label: d.label }))}
              />
            </FormField>
            <FormField label="Institusi" required>
              <DashSelect value={tForm.institutionId} onChange={(v) => setTForm((f) => ({ ...f, institutionId: v }))} placeholder="Pilih institusi" options={institutions.map((i) => ({ value: i.id, label: i.name }))} />
            </FormField>
            {TEAM_SLOTS.map((slot) => {
              const isGanda = slot.startsWith("GANDA");
              const isTriple = slot.startsWith("TRIPLE");
              const options = athletes.filter(a => !tForm.institutionId || a.institutionId === tForm.institutionId).map((a) => ({ value: a.id, label: a.name }));
              
              if (isGanda) {
                return (
                  <FormField key={slot} label={slot.replace(/_/g, " ")}>
                    <div className="flex flex-col gap-2">
                      <DashSelect value={tForm.slots[`${slot}_1`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_1`]: v } }))} placeholder="Pilih atlet 1" options={options} />
                      <DashSelect value={tForm.slots[`${slot}_2`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_2`]: v } }))} placeholder="Pilih atlet 2" options={options} />
                    </div>
                  </FormField>
                );
              }

              if (isTriple) {
                return (
                  <FormField key={slot} label={slot.replace(/_/g, " ")}>
                    <div className="flex flex-col gap-2">
                      <DashSelect value={tForm.slots[`${slot}_1`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_1`]: v } }))} placeholder="Pilih atlet 1" options={options} />
                      <DashSelect value={tForm.slots[`${slot}_2`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_2`]: v } }))} placeholder="Pilih atlet 2" options={options} />
                      <DashSelect value={tForm.slots[`${slot}_3`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_3`]: v } }))} placeholder="Pilih atlet 3" options={options} />
                    </div>
                  </FormField>
                );
              }
              
              return (
                <FormField key={slot} label={slot.replace(/_/g, " ")}>
                  <DashSelect value={tForm.slots[slot] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [slot]: v } }))} placeholder="Pilih atlet" options={options} />
                </FormField>
              );
            })}
          </>
        )}
      </Modal>
    </div>
  );
}
