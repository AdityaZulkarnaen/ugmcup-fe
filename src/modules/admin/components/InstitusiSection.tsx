"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getInstitutions, createInstitution, deleteInstitution } from "@/lib/api/admin";
import type { Institution } from "@/lib/types";

export function InstitusiSection() {
  const [data, setData] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: "", type: "UNIVERSITAS" as "UNIVERSITAS" | "SMA", logoUrl: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await getInstitutions());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      await createInstitution({ name: form.name, type: form.type, logoUrl: form.logoUrl || undefined });
      setModalOpen(false);
      setForm({ name: "", type: "UNIVERSITAS", logoUrl: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus institusi ini? Semua data terkait akan ikut terhapus.")) return;
    await deleteInstitution(id);
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Institusi"
        subtitle="Kelola universitas dan SMA/SMK peserta UGM CUP 2026"
        action={<AddButton onClick={() => setModalOpen(true)} label="Tambah Institusi" />}
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada institusi terdaftar"
        columns={[
          { key: "name", header: "Nama Institusi" },
          {
            key: "type",
            header: "Tipe",
            render: (row) => (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={
                  row.type === "UNIVERSITAS"
                    ? { background: "#F3E8FF", color: "#7E22CE" } // Light purple bg, dark purple text
                    : { background: "#DCFCE7", color: "#15803D" } // Light green bg, dark green text
                }
              >
                {row.type}
              </span>
            ),
          },
          { key: "createdAt", header: "Ditambahkan", render: (row) => new Date(row.createdAt).toLocaleDateString("id-ID") },
        ]}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setError(""); }}
        title="Tambah Institusi"
        footer={
          <>
            <ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} />
            <ModalSubmitButton onClick={handleSave} isLoading={isSaving} />
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="Nama Institusi" required>
          <DashInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="cth. Universitas Gadjah Mada" />
        </FormField>
        <FormField label="Tipe" required>
          <DashSelect
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v as "UNIVERSITAS" | "SMA" }))}
            options={[{ value: "UNIVERSITAS", label: "Universitas" }, { value: "SMA", label: "SMA/SMK" }]}
          />
        </FormField>
        <FormField label="URL Logo (opsional)">
          <DashInput value={form.logoUrl} onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))} placeholder="https://..." type="url" />
        </FormField>
      </Modal>
    </div>
  );
}
