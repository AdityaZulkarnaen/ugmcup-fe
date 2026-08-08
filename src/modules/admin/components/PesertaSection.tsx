"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import {
  getInstitutions, getAthletes,
  getParticipants, createParticipant, updateParticipant, deleteParticipant,
  getTeams, createTeam, updateTeam, deleteTeam,
} from "@/lib/api/admin";
import { LEVELS, DISCIPLINES } from "@/lib/constants";
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

  // Filters
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");

  // Common Edit State
  const [editId, setEditId] = useState<string | null>(null);

  // Form Peserta Individu
  const [pFormLevel, setPFormLevel] = useState("");
  const [pForm, setPForm] = useState({ disciplineId: "", institutionId: "", athlete1: "", athlete2: "" });

  // Form Tim Beregu
  const [tForm, setTForm] = useState({ institutionId: "", slots: {} as Record<string, string> });

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

  // Derived Data
  const teamDisciplines = DISCIPLINES.filter((d) => d.isTeamEvent);
  const individualDisciplines = DISCIPLINES.filter((d) => !d.isTeamEvent);
  const univBereguDiscipline = teamDisciplines.find(d => d.level === "univ");

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const disc = DISCIPLINES.find(d => d.id === p.disciplineId);
      if (filterLevel && disc?.level !== filterLevel) return false;
      if (filterDiscipline && p.disciplineId !== filterDiscipline) return false;
      return true;
    });
  }, [participants, filterLevel, filterDiscipline]);

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      const disc = DISCIPLINES.find(d => d.id === t.disciplineId);
      if (filterLevel && disc?.level !== filterLevel) return false;
      if (filterDiscipline && t.disciplineId !== filterDiscipline) return false;
      return true;
    });
  }, [teams, filterLevel, filterDiscipline]);

  // Form Logic & Handlers
  function openAddModal() {
    setEditId(null);
    setError("");
    if (tab === "individu") {
      setPFormLevel("");
      setPForm({ disciplineId: "", institutionId: "", athlete1: "", athlete2: "" });
    } else {
      setTForm({ institutionId: "", slots: {} });
    }
    setModalOpen(true);
  }

  function handleEditParticipant(p: Participant) {
    setEditId(p.id);
    setError("");
    const disc = DISCIPLINES.find(d => d.id === p.disciplineId);
    setPFormLevel(disc?.level || "");
    const athleteIds = p.athletes?.map(a => a.athleteId) || [];
    setPForm({
      disciplineId: p.disciplineId,
      institutionId: p.institutionId,
      athlete1: athleteIds[0] || "",
      athlete2: athleteIds[1] || ""
    });
    setModalOpen(true);
  }

  function handleEditTeam(t: Team) {
    setEditId(t.id);
    setError("");
    const slots: Record<string, string> = {};
    if (t.members) {
      t.members.forEach((m) => {
        // Karena kita menggunakan format key seperti GANDA_PUTRA_1, GANDA_PUTRA_2 di form
        // Kita perlu mencari next available slot string yang belum dipakai
        let key = m.assignedSlot;
        if (key.startsWith("GANDA") || key.startsWith("TRIPLE")) {
          let i = 1;
          while (slots[`${key}_${i}`]) i++;
          key = `${key}_${i}`;
        }
        slots[key] = m.athleteId;
      });
    }
    setTForm({ institutionId: t.institutionId, slots });
    setModalOpen(true);
  }

  async function handleSaveParticipant() {
    setIsSaving(true); setError("");
    try {
      const athleteIds = [pForm.athlete1, pForm.athlete2].filter(Boolean);
      if (athleteIds.length === 0) throw new Error("Pilih setidaknya 1 atlet");

      const payload = { disciplineId: pForm.disciplineId, institutionId: pForm.institutionId, athleteIds };
      if (editId) {
        await updateParticipant(editId, payload);
      } else {
        await createParticipant(payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleSaveTeam() {
    setIsSaving(true); setError("");
    try {
      const sudirmanDiscipline = DISCIPLINES.find((d) => d.name === "Beregu Sudirman");
      if (!sudirmanDiscipline) throw new Error("Kategori beregu sudirman tidak ditemukan di konfigurasi");

      const members = Object.entries(tForm.slots)
        .filter(([, athleteId]) => athleteId)
        .map(([key, athleteId]) => ({
          assignedSlot: key.replace(/_[123]$/, ""),
          athleteId
        }));

      const payload = { disciplineId: sudirmanDiscipline.id, institutionId: tForm.institutionId, members };
      if (editId) {
        await updateTeam(editId, payload);
      } else {
        await createTeam(payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleDeleteParticipant(id: string) {
    if (!confirm("Hapus peserta ini?")) return;
    await deleteParticipant(id); await load();
  }

  async function handleDeleteTeam(id: string) {
    if (!confirm("Hapus tim ini?")) return;
    await deleteTeam(id); await load();
  }

  // Options filtering helpers
  const getAthleteOptions = (instId: string, allowedGender: "LAKI_LAKI" | "PEREMPUAN" | "ANY", excludeId?: string) => {
    return athletes
      .filter(a => (!instId || a.institutionId === instId) &&
        (allowedGender === "ANY" || a.gender === allowedGender) &&
        a.id !== excludeId)
      .map(a => ({ value: a.id, label: a.name }));
  };

  const selectedPDiscipline = individualDisciplines.find(d => d.id === pForm.disciplineId);

  return (
    <div>
      <PageHeader
        title="Peserta & Tim"
        subtitle="Daftarkan peserta individu dan tim beregu"
        action={<AddButton onClick={openAddModal} label={`Tambah ${tab === "individu" ? "Peserta" : "Tim"}`} />}
      />

      {/* Tab */}
      <div className="mb-4 flex gap-2">
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

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-500 mr-2">TINGKAT:</span>
          {[{ value: "", label: "Semua" }, ...LEVELS].map((opt) => (
            <button key={opt.value} onClick={() => setFilterLevel(opt.value)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
              style={filterLevel === opt.value
                ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" }
                : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <span className="text-xs font-bold text-gray-500 mr-2">CABOR:</span>
          <select
            value={filterDiscipline}
            onChange={e => setFilterDiscipline(e.target.value)}
            className="rounded-lg border px-3 py-1 text-xs font-medium outline-none"
            style={{ borderColor: "#E5E7EB", color: "#374151" }}
          >
            <option value="">Semua Cabang</option>
            {(tab === "individu" ? individualDisciplines : teamDisciplines)
              .filter(d => !filterLevel || d.level === filterLevel)
              .map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
          </select>
        </div>
      </div>

      {tab === "individu" ? (
        <DataTable
          isLoading={isLoading}
          data={filteredParticipants}
          emptyText="Belum ada peserta individu"
          searchPlaceholder="Cari nama institusi atau peserta..."
          columns={[
            {
              key: "athletes",
              header: "Atlet",
              getSearchValue: (row) => row.athletes?.map(a => a.athlete?.name).filter(Boolean).join(" ") || "",
              render: (row) => (
                <span className="font-semibold text-gray-900">
                  {row.athletes && row.athletes.length > 0
                    ? row.athletes.map(a => a.athlete?.name).filter(Boolean).join(" - ")
                    : "—"}
                </span>
              ),
            },
            {
              key: "institution",
              header: "Institusi",
              getSearchValue: (row) => row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "",
              render: (row) => row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "—",
            },
            {
              key: "discipline",
              header: "Cabang",
              getSearchValue: (row) => row.discipline?.name ?? DISCIPLINES.find(d => d.id === row.disciplineId)?.name ?? "",
              render: (row) => row.discipline?.name ?? DISCIPLINES.find(d => d.id === row.disciplineId)?.name ?? "—",
            }
          ]}
          onEdit={handleEditParticipant}
          onDelete={handleDeleteParticipant}
        />
      ) : (
        <DataTable
          isLoading={isLoading}
          data={filteredTeams}
          emptyText="Belum ada tim beregu"
          searchPlaceholder="Cari nama institusi atau anggota tim..."
          columns={[
            {
              key: "institution",
              header: "Institusi",
              getSearchValue: (row) => row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "",
              render: (row) => (
                <span className="font-semibold text-gray-900">
                  {row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "—"}
                </span>
              ),
            },
            {
              key: "members",
              header: "Anggota",
              getSearchValue: (row) => row.members?.map(m => m.athlete?.name).filter(Boolean).join(" ") || "",
              render: (row) => `${row.members?.length ?? 0} atlet terdaftar`,
            }
          ]}
          onEdit={handleEditTeam}
          onDelete={handleDeleteTeam}
        />
      )}

      {/* Modal Form */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={editId ? `Edit ${tab === "individu" ? "Peserta" : "Tim"}` : `Tambah ${tab === "individu" ? "Peserta" : "Tim"}`} size="lg"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={tab === "individu" ? handleSaveParticipant : handleSaveTeam} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}

        {tab === "individu" ? (
          <>
            <FormField label="Tingkat" required>
              <DashSelect
                value={pFormLevel}
                onChange={(v) => { setPFormLevel(v); setPForm((f) => ({ ...f, disciplineId: "", institutionId: "", athlete1: "", athlete2: "" })); }}
                placeholder="Pilih tingkat"
                options={LEVELS}
              />
            </FormField>

            <FormField label="Institusi" required>
              <DashSelect
                value={pForm.institutionId}
                onChange={(v) => setPForm((f) => ({ ...f, institutionId: v, athlete1: "", athlete2: "" }))}
                placeholder={pFormLevel ? "Pilih institusi" : "Pilih tingkat terlebih dahulu"}
                options={institutions.filter(i => !pFormLevel || i.type === (pFormLevel === "univ" ? "UNIVERSITAS" : "SMA")).map((i) => ({ value: i.id, label: i.name }))}
              />
            </FormField>

            <FormField label="Cabang Kategori" required>
              <DashSelect
                value={pForm.disciplineId}
                onChange={(v) => setPForm((f) => ({ ...f, disciplineId: v, athlete1: "", athlete2: "" }))}
                placeholder={pFormLevel ? "Pilih kategori" : "Pilih tingkat terlebih dahulu"}
                options={(pFormLevel ? individualDisciplines.filter(d => d.level === pFormLevel) : individualDisciplines).map(d => ({ value: d.id, label: d.label }))}
              />
            </FormField>

            {pForm.disciplineId && (
              <>
                <FormField label="Atlet 1" required>
                  <DashSelect
                    value={pForm.athlete1}
                    onChange={(v) => setPForm((f) => ({ ...f, athlete1: v }))}
                    placeholder="Pilih atlet"
                    options={getAthleteOptions(pForm.institutionId,
                      selectedPDiscipline?.type === "TUNGGAL_PUTRI" || selectedPDiscipline?.type === "GANDA_PUTRI" ? "PEREMPUAN" : "LAKI_LAKI"
                    )}
                  />
                </FormField>

                {(selectedPDiscipline?.type.startsWith("GANDA") || selectedPDiscipline?.type === "TRIPLE_MIX") && (
                  <FormField label="Atlet 2" required>
                    <DashSelect
                      value={pForm.athlete2}
                      onChange={(v) => setPForm((f) => ({ ...f, athlete2: v }))}
                      placeholder="Pilih atlet 2"
                      options={getAthleteOptions(pForm.institutionId,
                        selectedPDiscipline?.type === "GANDA_PUTRI" ? "PEREMPUAN" :
                          selectedPDiscipline?.type === "GANDA_PUTRA" ? "LAKI_LAKI" :
                            selectedPDiscipline?.type === "GANDA_CAMPURAN" ? "PEREMPUAN" : "ANY",
                        pForm.athlete1
                      )}
                    />
                  </FormField>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <FormField label="Tingkat" required>
              <input
                type="text"
                value="Universitas"
                disabled
                className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-500 outline-none"
                style={{ borderColor: "#E5E7EB" }}
              />
              <p className="text-xs text-gray-400 mt-1">Beregu khusus untuk tingkat Universitas</p>
            </FormField>

            <FormField label="Institusi" required>
              <DashSelect
                value={tForm.institutionId}
                onChange={(v) => setTForm((f) => ({ ...f, institutionId: v, slots: {} }))}
                placeholder="Pilih institusi"
                options={institutions.filter(i => i.type === "UNIVERSITAS").map((i) => ({ value: i.id, label: i.name }))}
              />
            </FormField>

            {tForm.institutionId && TEAM_SLOTS.map((slot) => {
              const isGanda = slot.startsWith("GANDA");
              const isTriple = slot.startsWith("TRIPLE");
              const allowedGender = slot.includes("PUTRI") ? "PEREMPUAN" : slot.includes("PUTRA") ? "LAKI_LAKI" : "ANY";

              if (isGanda) {
                return (
                  <FormField key={slot} label={slot.replace(/_/g, " ")}>
                    <div className="flex flex-col gap-2">
                      <DashSelect value={tForm.slots[`${slot}_1`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_1`]: v } }))} placeholder="Pilih atlet 1" options={getAthleteOptions(tForm.institutionId, allowedGender)} />
                      <DashSelect value={tForm.slots[`${slot}_2`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_2`]: v } }))} placeholder="Pilih atlet 2" options={getAthleteOptions(tForm.institutionId, allowedGender, tForm.slots[`${slot}_1`])} />
                    </div>
                  </FormField>
                );
              }

              if (isTriple) {
                return (
                  <FormField key={slot} label={slot.replace(/_/g, " ")}>
                    <div className="flex flex-col gap-2">
                      <DashSelect value={tForm.slots[`${slot}_1`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_1`]: v } }))} placeholder="Pilih atlet 1" options={getAthleteOptions(tForm.institutionId, allowedGender)} />
                      <DashSelect value={tForm.slots[`${slot}_2`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_2`]: v } }))} placeholder="Pilih atlet 2" options={getAthleteOptions(tForm.institutionId, allowedGender, tForm.slots[`${slot}_1`])} />
                      <DashSelect value={tForm.slots[`${slot}_3`] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [`${slot}_3`]: v } }))} placeholder="Pilih atlet 3" options={getAthleteOptions(tForm.institutionId, allowedGender, tForm.slots[`${slot}_1`])} />
                    </div>
                  </FormField>
                );
              }

              return (
                <FormField key={slot} label={slot.replace(/_/g, " ")}>
                  <DashSelect value={tForm.slots[slot] ?? ""} onChange={(v) => setTForm((f) => ({ ...f, slots: { ...f.slots, [slot]: v } }))} placeholder="Pilih atlet" options={getAthleteOptions(tForm.institutionId, allowedGender)} />
                </FormField>
              );
            })}
          </>
        )}
      </Modal>
    </div>
  );
}
