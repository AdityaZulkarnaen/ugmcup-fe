"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getInstitutions, createInstitution, updateInstitution, deleteInstitution, uploadFile } from "@/lib/api/admin";
import type { Institution } from "@/lib/types";

export function InstitusiSection() {
  const [data, setData] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [form, setForm] = useState({ name: "", type: "UNIVERSITAS" as "UNIVERSITAS" | "SMA", logoUrl: "" });
  const [logoInputType, setLogoInputType] = useState<"url" | "file">("file");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await getInstitutions(filterType));
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      let finalLogoUrl = form.logoUrl;
      
      // Jika ada file yang dipilih, upload terlebih dahulu
      if (logoFile) {
        if (logoFile.size > 1024 * 1024) {
          throw new Error("Ukuran file maksimal 1 MB");
        }
        finalLogoUrl = await uploadFile(logoFile);
      }

      const payload = { name: form.name, type: form.type, logoUrl: finalLogoUrl || undefined };
      if (editId) {
        await updateInstitution(editId, payload);
      } else {
        await createInstitution(payload);
      }
      
      setModalOpen(false);
      setEditId(null);
      setForm({ name: "", type: "UNIVERSITAS", logoUrl: "" });
      setLogoFile(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditClick(row: Institution) {
    setEditId(row.id);
    setForm({ name: row.name, type: row.type, logoUrl: row.logoUrl || "" });
    setLogoFile(null);
    setModalOpen(true);
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsSaving(true);
    setError("");
    try {
      await deleteInstitution(deleteId);
      setDeleteModalOpen(false);
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Institusi"
        subtitle="Kelola universitas dan SMA/SMK peserta UGM CUP 2026"
        action={<AddButton onClick={() => { setEditId(null); setForm({ name: "", type: "UNIVERSITAS", logoUrl: "" }); setModalOpen(true); }} label="Tambah Institusi" />}
      />

      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {[{ value: "", label: "Semua Tipe" }, { value: "UNIVERSITAS", label: "Universitas" }, { value: "SMA", label: "SMA/SMK" }].map((opt) => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
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
        emptyText="Belum ada institusi terdaftar"
        columns={[
          {
            key: "logoUrl",
            header: "Logo",
            render: (row) =>
              row.logoUrl ? (
                <img src={row.logoUrl} alt={row.name} className="h-8 w-8 rounded-full object-cover border" />
              ) : (
                "-"
              ),
          },
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
          { key: "createdAt", header: "Ditambahkan pada", render: (row) => new Date(row.createdAt).toLocaleDateString("id-ID") },
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEditClick(row)}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(row.id)}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition"
            >
              Hapus
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditId(null); setError(""); setLogoFile(null); }}
        title={editId ? "Edit Institusi" : "Tambah Institusi"}
        footer={
          <>
            <ModalCancelButton onClick={() => { setModalOpen(false); setEditId(null); setError(""); setLogoFile(null); }} />
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
        <div className="flex flex-col gap-1.5 mb-2">
          <label className="text-xs font-bold uppercase text-gray-600">Logo (Opsional)</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setLogoInputType("file")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${logoInputType === "file" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setLogoInputType("url")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${logoInputType === "url" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Gunakan URL
            </button>
          </div>

          {logoInputType === "url" ? (
            <DashInput value={form.logoUrl} onChange={(v) => { setForm((f) => ({ ...f, logoUrl: v })); setLogoFile(null); }} placeholder="https://..." type="url" />
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setLogoFile(e.dataTransfer.files[0]);
                }
              }}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              {logoFile ? (
                <div className="text-sm font-semibold text-purple-700">{logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)</div>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-purple-600">Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Batas maksimal: 1 file, ukuran 1MB (PNG, JPG, WEBP)</p>
                </>
              )}
            </div>
          )}
          {form.logoUrl && !logoFile && logoInputType === "file" && (
            <p className="mt-2 text-xs text-gray-500">Logo saat ini sudah tersimpan (Upload file baru untuk mengganti).</p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteId(null); setError(""); }}
        title="Konfirmasi Penghapusan"
        footer={
          <>
            <ModalCancelButton onClick={() => { setDeleteModalOpen(false); setDeleteId(null); setError(""); }} />
            <button
              onClick={confirmDelete}
              disabled={isSaving}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#DC2626" }}
            >
              {isSaving ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <div className="p-4 rounded-xl mb-2" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <p className="font-semibold text-red-700 mb-2">Hati-hati!</p>
          <p className="text-sm text-red-600">
            Apakah Anda yakin ingin menghapus institusi ini? 
            <strong> Semua data atlet, tim, dan peserta (individu/ganda) yang berafiliasi dengan institusi ini juga akan ikut terhapus secara permanen!</strong>
          </p>
        </div>
      </Modal>
    </div>
  );
}
