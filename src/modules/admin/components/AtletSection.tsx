"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getAthletes, createAthlete, updateAthlete, deleteAthlete, getInstitutions, getAthlete } from "@/lib/api/admin";
import type { Athlete, Institution } from "@/lib/types";

export function AtletSection() {
  const [data, setData] = useState<Athlete[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // Filters
  const [filterGender, setFilterGender] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  // Form
  const [formType, setFormType] = useState<string>("");
  const [form, setForm] = useState({ name: "", gender: "LAKI_LAKI" as "LAKI_LAKI" | "PEREMPUAN", institutionId: "", studentId: "", isSeeded: false });

  // Info
  const [athleteInfo, setAthleteInfo] = useState<any>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [athletesRes, instsRes] = await Promise.allSettled([
      getAthletes({ gender: filterGender, institutionType: filterType }),
      getInstitutions()
    ]);
    setData(athletesRes.status === "fulfilled" ? athletesRes.value : []);
    if (instsRes.status === "fulfilled") setInstitutions(instsRes.value);
    setIsLoading(false);
  }, [filterGender, filterType]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      const payload = { 
        name: form.name, 
        gender: form.gender, 
        institutionId: form.institutionId, 
        studentId: form.studentId || undefined,
        isSeeded: form.isSeeded
      };

      if (editId) {
        await updateAthlete(editId, payload);
      } else {
        await createAthlete(payload);
      }

      setModalOpen(false);
      setEditId(null);
      setForm({ name: "", gender: "LAKI_LAKI", institutionId: "", studentId: "", isSeeded: false });
      setFormType("");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  function handleEdit(row: Athlete) {
    setEditId(row.id);
    const inst = institutions.find(i => i.id === row.institutionId);
    setFormType(inst?.type || "");
    setForm({ 
      name: row.name, 
      gender: row.gender, 
      institutionId: row.institutionId, 
      studentId: row.studentId || "",
      isSeeded: row.isSeeded || false
    });
    setModalOpen(true);
  }

  async function handleInfo(id: string) {
    try {
      const athleteDetails = await getAthlete(id);
      setAthleteInfo(athleteDetails);
      setInfoModalOpen(true);
    } catch (e) {
      alert("Gagal mengambil data perlombaan atlet");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus atlet ini?")) return;
    await deleteAthlete(id); await load();
  }

  const filteredInstitutions = useMemo(() => {
    if (!formType) return [];
    return institutions.filter(i => i.type === formType);
  }, [institutions, formType]);

  return (
    <div>
      <PageHeader
        title="Atlet"
        subtitle="Kelola atlet dari setiap institusi peserta"
        action={<AddButton onClick={() => { setEditId(null); setFormType(""); setForm({ name: "", gender: "LAKI_LAKI", institutionId: "", studentId: "", isSeeded: false }); setModalOpen(true); }} label="Tambah Atlet" />}
      />

      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 flex items-center mr-2">GENDER:</span>
          {[{ value: "", label: "Semua" }, { value: "LAKI_LAKI", label: "Putra" }, { value: "PEREMPUAN", label: "Putri" }].map((opt) => (
            <button key={opt.value} onClick={() => setFilterGender(opt.value)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
              style={filterGender === opt.value 
                ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" } 
                : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <span className="text-xs font-bold text-gray-500 flex items-center mr-2">TIPE:</span>
          {[{ value: "", label: "Semua" }, { value: "UNIVERSITAS", label: "Universitas" }, { value: "SMA", label: "SMA/SMK" }].map((opt) => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
              style={filterType === opt.value 
                ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" } 
                : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada atlet terdaftar"
        columns={[
          { key: "name", header: "Nama Atlet", render: (row) => (
            <div className="flex items-center gap-2">
              <span>{row.name}</span>
              {row.isSeeded && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">UNGGULAN</span>}
            </div>
          )},
          {
            key: "gender",
            header: "Gender",
            render: (row) => (
              <span className="font-bold"
                style={row.gender === "LAKI_LAKI"
                  ? { color: "#1E3A8A" } // Dark Blue for L
                  : { color: "#991B1B" }}> 
                {row.gender === "LAKI_LAKI" ? "L" : "P"}
              </span>
            ),
          },
          { key: "studentId", header: "NIM/NIS", render: (row) => row.studentId ?? "-" },
          { key: "institution", header: "Institusi", render: (row) => row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "-" },
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button onClick={() => handleInfo(row.id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition">Info</button>
            <button onClick={() => handleEdit(row)} className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">Edit</button>
            <button onClick={() => handleDelete(row.id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition">Hapus</button>
          </div>
        )}
      />

      {/* MODAL TAMBAH/EDIT */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setError(""); }}
        title={editId ? "Edit Atlet" : "Tambah Atlet"}
        footer={
          <>
            <ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} />
            <ModalSubmitButton onClick={handleSave} isLoading={isSaving} />
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        
        <FormField label="Nama Atlet" required>
          <DashInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nama lengkap" />
        </FormField>
        
        <FormField label="Tipe Kategori Institusi" required>
          <DashSelect
            value={formType}
            onChange={(v) => {
              setFormType(v);
              // Reset institusi yang dipilih jika tipe diubah
              setForm((f) => ({ ...f, institutionId: "" }));
            }}
            placeholder="Pilih Kategori (Univ/SMA)"
            options={[
              { value: "UNIVERSITAS", label: "Universitas" },
              { value: "SMA", label: "SMA/SMK" }
            ]}
          />
        </FormField>
        
        <FormField label="Institusi" required>
          <DashSelect
            value={form.institutionId}
            onChange={(v) => setForm((f) => ({ ...f, institutionId: v }))}
            placeholder={formType ? "Pilih institusi" : "Pilih Kategori terlebih dahulu"}
            options={filteredInstitutions.map((i) => ({ value: i.id, label: i.name }))}
          />
        </FormField>
        
        <FormField label="Gender" required>
          <DashSelect
            value={form.gender}
            onChange={(v) => setForm((f) => ({ ...f, gender: v as "LAKI_LAKI" | "PEREMPUAN" }))}
            options={[{ value: "LAKI_LAKI", label: "Putra" }, { value: "PEREMPUAN", label: "Putri" }]}
          />
        </FormField>
        
        <FormField label="NIM/NIS (opsional)">
          <DashInput value={form.studentId} onChange={(v) => setForm((f) => ({ ...f, studentId: v }))} placeholder="Nomor induk mahasiswa/siswa" />
        </FormField>
        
        <div className="flex items-center mt-2">
          <input
            id="isSeeded"
            type="checkbox"
            checked={form.isSeeded}
            onChange={(e) => setForm((f) => ({ ...f, isSeeded: e.target.checked }))}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isSeeded" className="ml-2 text-sm font-medium text-gray-900">
            Tandai sebagai Pemain Unggulan (Seeded)
          </label>
        </div>
      </Modal>

      {/* MODAL INFO PERLOMBAAN */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Informasi Cabang Lomba"
        footer={<ModalCancelButton onClick={() => setInfoModalOpen(false)} label="Tutup" />}
      >
        {athleteInfo ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-800">{athleteInfo.name}</p>
              <p className="text-xs text-gray-500">{athleteInfo.institution?.name}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Individu / Ganda</p>
              {athleteInfo.participantMembers && athleteInfo.participantMembers.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {athleteInfo.participantMembers.map((pm: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-semibold text-purple-700">{pm.participant.discipline?.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">Tidak terdaftar di cabang individu.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Beregu</p>
              {athleteInfo.teamMembers && athleteInfo.teamMembers.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {athleteInfo.teamMembers.map((tm: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-semibold text-purple-700">{tm.team.discipline?.name}</span> 
                      <span className="text-gray-500 ml-1">(Slot: {tm.assignedSlot.replace(/_/g, " ")})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">Tidak terdaftar di cabang beregu.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Memuat data...</p>
        )}
      </Modal>

    </div>
  );
}
