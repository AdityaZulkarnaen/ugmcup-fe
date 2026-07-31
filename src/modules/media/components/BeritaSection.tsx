"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashTextarea } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { DragDropUpload } from "@/components/dashboard/DragDropUpload";
import { getNews, createNews, updateNews, deleteNews } from "@/lib/api/content";
import { uploadFile } from "@/lib/api/admin";
import type { News } from "@/lib/types";

const EMPTY_FORM = { title: "", content: "", coverImage: "", url: "", publishedAt: "" };

export function BeritaSection() {
  const [data, setData] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<News | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  // File cover yang dipilih tapi belum di-upload — upload terjadi saat klik Simpan
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try { setData(await getNews()); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setPendingFile(null); setModalOpen(true); }
  function openEdit(item: News) {
    setEditTarget(item);
    setPendingFile(null);
    setForm({ title: item.title, content: item.content, coverImage: item.coverImage ?? "", url: item.url ?? "", publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "" });
    setModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      // Upload cover baru dilakukan di sini (bukan saat drop file)
      let coverImage = form.coverImage;
      if (pendingFile) {
        coverImage = await uploadFile(pendingFile);
        if (form.coverImage.startsWith("blob:")) URL.revokeObjectURL(form.coverImage);
      }
      const payload = {
        title: form.title, content: form.content,
        coverImage: coverImage || undefined,
        url: form.url || undefined,
        publishedAt: form.publishedAt || undefined,
      };
      if (editTarget) await updateNews(editTarget.id, payload);
      else await createNews(payload);
      setModalOpen(false); setPendingFile(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus berita ini?")) return;
    await deleteNews(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="Berita & Artikel"
        subtitle="Kelola konten berita yang ditampilkan di landing page dan informasi"
        action={<AddButton onClick={openAdd} label="Tulis Berita" />}
      />
      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada berita diterbitkan"
        columns={[
          { key: "title", header: "Judul", render: (row) => <span className="font-semibold text-gray-900 line-clamp-1">{row.title}</span> },
          { key: "publishedAt", header: "Tanggal", render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("id-ID") : <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">Draft</span> },
          { key: "createdAt", header: "Dibuat", render: (row) => new Date(row.createdAt).toLocaleDateString("id-ID") },
          { key: "coverImage", header: "Cover", render: (row) => row.coverImage ? <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">Ada</span> : <span className="text-gray-400">—</span> },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); setPendingFile(null); }} title={editTarget ? "Edit Berita" : "Tulis Berita Baru"} size="lg"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); setPendingFile(null); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="Judul" required>
          <DashInput value={form.title} onChange={(v) => setForm(f => ({ ...f, title: v }))} placeholder="Judul berita menarik..." />
        </FormField>
        <FormField label="Konten" required>
          <DashTextarea value={form.content} onChange={(v) => setForm(f => ({ ...f, content: v }))} placeholder="Tulis isi berita..." rows={6} />
        </FormField>
        <FormField label="Cover Image">
          <DragDropUpload value={form.coverImage} onChange={(url) => setForm(f => ({ ...f, coverImage: url }))} onFileSelect={setPendingFile} label="Upload Cover Image" />
        </FormField>
        <FormField label="Tautan Eksternal (URL)">
          <DashInput value={form.url} onChange={(v) => setForm(f => ({ ...f, url: v }))} placeholder="https://..." type="url" />
        </FormField>
        <FormField label="Tanggal Publikasi">
          <DashInput value={form.publishedAt} onChange={(v) => setForm(f => ({ ...f, publishedAt: v }))} type="datetime-local" />
        </FormField>
      </Modal>
    </div>
  );
}
