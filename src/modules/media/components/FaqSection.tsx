"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, AddButton, FormField, DashInput, DashTextarea } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/lib/api/content";
import type { Faq } from "@/lib/types";
import { HelpCircle, ChevronDown } from "lucide-react";

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
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <HelpCircle className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Belum ada FAQ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.sort((a, b) => a.order - b.order).map((faq) => (
            <div key={faq.id} className="rounded-lg border overflow-hidden bg-white transition-all"
              style={{ borderColor: "#E5E7EB" }}>
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "#EDE9FE", color: "#6C47D1" }}>
                    {faq.order || "?"}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: "#111827" }}>{faq.question}</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "#9CA3AF", transform: expandedId === faq.id ? "rotate(180deg)" : "rotate(0)" }} />
              </button>
              {expandedId === faq.id && (
                <div className="border-t px-5 py-4" style={{ borderColor: "#F3F4F6" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{faq.answer}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(faq)} className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition hover:bg-purple-50" style={{ color: "#6C47D1" }}>Edit</button>
                    <button onClick={() => handleDelete(faq.id)} className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition hover:bg-red-50" style={{ color: "#EF4444" }}>Hapus</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={editTarget ? "Edit FAQ" : "Tambah FAQ"}
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
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
