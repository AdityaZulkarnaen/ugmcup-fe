"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashTextarea } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getNews, createNews, updateNews, deleteNews } from "@/lib/api/content";
import type { News } from "@/lib/types";

const EMPTY_FORM = { title: "", content: "", coverImage: "", publishedAt: "" };

export function BeritaSection() {
  const [data, setData] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<News | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    try { setData(await getNews()); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(item: News) {
    setEditTarget(item);
    setForm({ title: item.title, content: item.content, coverImage: item.coverImage ?? "", publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "" });
    setModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      const payload = {
        title: form.title, content: form.content,
        coverImage: form.coverImage || undefined,
        publishedAt: form.publishedAt || undefined,
      };
      if (editTarget) await updateNews(editTarget.id, payload);
      else await createNews(payload);
      setModalOpen(false); await load();
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
        subtitle="Kelola konten berita yang ditampilkan di landing page"
        action={<AddButton onClick={openAdd} label="Tulis Berita" />}
      />
      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada berita diterbitkan"
        columns={[
          { key: "title", header: "Judul", render: (row) => <span className="font-semibold text-white line-clamp-1">{row.title}</span> },
          { key: "publishedAt", header: "Tanggal", render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("id-ID") : <span style={{ color: "#fbbf24" }}>Draft</span> },
          { key: "createdAt", header: "Dibuat", render: (row) => new Date(row.createdAt).toLocaleDateString("id-ID") },
          { key: "coverImage", header: "Cover", render: (row) => row.coverImage ? <span style={{ color: "#66FFB4" }}>Ada</span> : <span style={{ color: "#9D9DB6" }}>—</span> },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={editTarget ? "Edit Berita" : "Tulis Berita Baru"} size="lg"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="Judul" required>
          <DashInput value={form.title} onChange={(v) => setForm(f => ({ ...f, title: v }))} placeholder="Judul berita menarik..." />
        </FormField>
        <FormField label="Konten" required>
          <DashTextarea value={form.content} onChange={(v) => setForm(f => ({ ...f, content: v }))} placeholder="Tulis isi berita..." rows={6} />
        </FormField>
        <FormField label="URL Cover Image">
          <DashInput value={form.coverImage} onChange={(v) => setForm(f => ({ ...f, coverImage: v }))} placeholder="https://..." type="url" />
        </FormField>
        <FormField label="Tanggal Publikasi">
          <DashInput value={form.publishedAt} onChange={(v) => setForm(f => ({ ...f, publishedAt: v }))} type="datetime-local" />
        </FormField>
      </Modal>
    </div>
  );
}
