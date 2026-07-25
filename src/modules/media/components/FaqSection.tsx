"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, AddButton, FormField, DashInput, DashTextarea } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/lib/api/content";
import type { Faq } from "@/lib/types";

const EMPTY_FORM = { question: "", answer: "", order: "0" };

export function FaqSection() {
  const [data, setData] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faq | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try { setData(await getFaqs()); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(item: Faq) {
    setEditTarget(item);
    setForm({ question: item.question, answer: item.answer, order: String(item.order) });
    setModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      const payload = { question: form.question, answer: form.answer, order: parseInt(form.order) || 0 };
      if (editTarget) await updateFaq(editTarget.id, payload);
      else await createFaq(payload);
      setModalOpen(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    await deleteFaq(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="FAQ"
        subtitle="Kelola pertanyaan yang sering ditanyakan"
        action={<AddButton onClick={openAdd} label="Tambah FAQ" />}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center py-20 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
          <p className="text-4xl mb-4">❓</p>
          <p className="text-white font-semibold">Belum ada FAQ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.sort((a, b) => a.order - b.order).map((faq) => (
            <div key={faq.id} className="rounded-2xl border overflow-hidden transition-all"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(131,82,217,0.2)", color: "#D9D3FF" }}>
                    {faq.order || "?"}
                  </span>
                  <span className="font-semibold text-white text-sm">{faq.question}</span>
                </div>
                <span className="text-white/40 transition-transform" style={{ transform: expandedId === faq.id ? "rotate(180deg)" : "rotate(0)" }}>
                  ▼
                </span>
              </button>
              {expandedId === faq.id && (
                <div className="border-t px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#9D9DB6" }}>{faq.answer}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(faq)} className="rounded-lg px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(faq.id)} className="rounded-lg px-3 py-1 text-xs font-semibold transition hover:bg-red-500/10" style={{ color: "#f87171" }}>Hapus</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={editTarget ? "Edit FAQ" : "Tambah FAQ"}
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="Pertanyaan" required>
          <DashInput value={form.question} onChange={(v) => setForm(f => ({ ...f, question: v }))} placeholder="Pertanyaan yang sering ditanyakan..." />
        </FormField>
        <FormField label="Jawaban" required>
          <DashTextarea value={form.answer} onChange={(v) => setForm(f => ({ ...f, answer: v }))} placeholder="Jawaban yang jelas dan informatif..." rows={5} />
        </FormField>
        <FormField label="Urutan Tampil">
          <DashInput value={form.order} onChange={(v) => setForm(f => ({ ...f, order: v }))} placeholder="1" type="number" />
        </FormField>
      </Modal>
    </div>
  );
}
