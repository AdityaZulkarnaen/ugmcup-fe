"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getAthletes, createAthlete, deleteAthlete, getInstitutions } from "@/lib/api/admin";
import type { Athlete, Institution } from "@/lib/types";

export function AtletSection() {
  const [data, setData] = useState<Athlete[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", gender: "PUTRA" as "PUTRA" | "PUTRI", institutionId: "", studentId: "" });

  const load = useCallback(async () => {
    setIsLoading(true);
    const [athletes, insts] = await Promise.allSettled([getAthletes(), getInstitutions()]);
    setData(athletes.status === "fulfilled" ? athletes.value : []);
    setInstitutions(insts.status === "fulfilled" ? insts.value : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      await createAthlete({ name: form.name, gender: form.gender, institutionId: form.institutionId, studentId: form.studentId || undefined });
      setModalOpen(false);
      setForm({ name: "", gender: "PUTRA", institutionId: "", studentId: "" });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus atlet ini?")) return;
    await deleteAthlete(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="Atlet"
        subtitle="Kelola atlet dari setiap institusi peserta"
        action={<AddButton onClick={() => setModalOpen(true)} label="Tambah Atlet" />}
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada atlet terdaftar"
        columns={[
          { key: "name", header: "Nama Atlet" },
          {
            key: "gender",
            header: "Gender",
            render: (row) => (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={row.gender === "PUTRA"
                  ? { background: "#DBEAFE", color: "#1E3A8A" }
                  : { background: "#FCE7F3", color: "#831843" }}>
                {row.gender}
              </span>
            ),
          },
          { key: "studentId", header: "NIM/NIS", render: (row) => row.studentId ?? "-" },
          { key: "institution", header: "Institusi", render: (row) => row.institution?.name ?? institutions.find(i => i.id === row.institutionId)?.name ?? "-" },
          { key: "createdAt", header: "Ditambahkan", render: (row) => new Date(row.createdAt).toLocaleDateString("id-ID") },
        ]}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setError(""); }}
        title="Tambah Atlet"
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
        <FormField label="Institusi" required>
          <DashSelect
            value={form.institutionId}
            onChange={(v) => setForm((f) => ({ ...f, institutionId: v }))}
            placeholder="Pilih institusi"
            options={institutions.map((i) => ({ value: i.id, label: i.name }))}
          />
        </FormField>
        <FormField label="Gender" required>
          <DashSelect
            value={form.gender}
            onChange={(v) => setForm((f) => ({ ...f, gender: v as "PUTRA" | "PUTRI" }))}
            options={[{ value: "PUTRA", label: "Putra" }, { value: "PUTRI", label: "Putri" }]}
          />
        </FormField>
        <FormField label="NIM/NIS (opsional)">
          <DashInput value={form.studentId} onChange={(v) => setForm((f) => ({ ...f, studentId: v }))} placeholder="Nomor induk mahasiswa/siswa" />
        </FormField>
      </Modal>
    </div>
  );
}
