"use client";

import { useEffect, useState, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getMedia, createMedia, deleteMedia } from "@/lib/api/content";
import type { Media } from "@/lib/types";

const CATEGORIES = ["Opening Ceremony", "Fase Grup", "Perempat Final", "Semifinal", "Final", "Dokumentasi", "Lainnya"];
const EMPTY_FORM = { imageUrl: "", caption: "", category: "" };

export function GaleriSection() {
  const [data, setData] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try { setData(await getMedia(filterCat || undefined)); } finally { setIsLoading(false); }
  }, [filterCat]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      await createMedia({ imageUrl: form.imageUrl, caption: form.caption || undefined, category: form.category || undefined });
      setModalOpen(false); setForm(EMPTY_FORM); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    await deleteMedia(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="Galeri Foto"
        subtitle="Dokumentasi foto event UGM CUP 2026"
        action={<AddButton onClick={() => setModalOpen(true)} label="Tambah Foto" />}
      />

      <div className="mb-6 flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat("")}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          style={filterCat === "" ? { background: "#8352D9", color: "#fff" } : { background: "rgba(255,255,255,0.05)", color: "#9D9DB6" }}>
          Semua
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            style={filterCat === c ? { background: "#8352D9", color: "#fff" } : { background: "rgba(255,255,255,0.05)", color: "#9D9DB6" }}>
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <ImageIcon className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Belum ada foto</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border aspect-square bg-gray-100"
              style={{ borderColor: "#E5E7EB" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.caption ?? ""} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/global/logo.webp"; }} />
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/60 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                {item.caption && <p className="text-xs text-white font-semibold line-clamp-2">{item.caption}</p>}
                {item.category && <p className="text-xs mt-1" style={{ color: "#66FFB4" }}>{item.category}</p>}
                <button onClick={() => handleDelete(item.id)} className="mt-2 rounded-lg px-2 py-1 text-xs font-semibold self-start transition"
                  style={{ background: "rgba(239,68,68,0.3)", color: "#f87171" }}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title="Tambah Foto"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="URL Gambar" required>
          <DashInput value={form.imageUrl} onChange={(v) => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://..." type="url" />
        </FormField>
        {form.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-xl aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
          </div>
        )}
        <FormField label="Kategori">
          <DashSelect value={form.category} onChange={(v) => setForm(f => ({ ...f, category: v }))} placeholder="Pilih kategori" options={CATEGORIES.map(c => ({ value: c, label: c }))} />
        </FormField>
        <FormField label="Keterangan (Caption)">
          <DashInput value={form.caption} onChange={(v) => setForm(f => ({ ...f, caption: v }))} placeholder="Deskripsi singkat foto" />
        </FormField>
      </Modal>
    </div>
  );
}
