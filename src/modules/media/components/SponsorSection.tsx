"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, AddButton, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from "@/lib/api/content";
import type { Sponsor } from "@/lib/types";

const TIERS = ["PLATINUM", "GOLD", "SILVER", "BRONZE", "MEDIA_PARTNER"];
const EMPTY_FORM = { name: "", logoUrl: "", tier: "", linkUrl: "", order: "0" };

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  PLATINUM: { bg: "rgba(229,229,229,0.15)", color: "#e5e5e5" },
  GOLD: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  SILVER: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af" },
  BRONZE: { bg: "rgba(180,120,60,0.15)", color: "#b47c3c" },
  MEDIA_PARTNER: { bg: "rgba(131,82,217,0.15)", color: "#D9D3FF" },
};

export function SponsorSection() {
  const [data, setData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Sponsor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    try { setData(await getSponsors()); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(item: Sponsor) {
    setEditTarget(item);
    setForm({ name: item.name, logoUrl: item.logoUrl, tier: item.tier ?? "", linkUrl: item.linkUrl ?? "", order: String(item.order) });
    setModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true); setError("");
    try {
      const payload = { name: form.name, logoUrl: form.logoUrl, tier: form.tier || undefined, linkUrl: form.linkUrl || undefined, order: parseInt(form.order) || 0 };
      if (editTarget) await updateSponsor(editTarget.id, payload);
      else await createSponsor(payload);
      setModalOpen(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus sponsor ini?")) return;
    await deleteSponsor(id); await load();
  }

  return (
    <div>
      <PageHeader
        title="Sponsor"
        subtitle="Kelola logo dan informasi sponsor UGM CUP 2026"
        action={<AddButton onClick={openAdd} label="Tambah Sponsor" />}
      />
      <DataTable
        isLoading={isLoading}
        data={data}
        emptyText="Belum ada sponsor terdaftar"
        columns={[
          { key: "order", header: "Urutan" },
          { key: "name", header: "Nama", render: (row) => <span className="font-semibold text-white">{row.name}</span> },
          { key: "tier", header: "Tier", render: (row) => {
            if (!row.tier) return <span style={{ color: "#9D9DB6" }}>—</span>;
            const s = TIER_STYLE[row.tier] ?? { bg: "rgba(255,255,255,0.08)", color: "#9D9DB6" };
            return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: s.bg, color: s.color }}>{row.tier}</span>;
          }},
          { key: "logoUrl", header: "Logo", render: (row) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={row.logoUrl} alt={row.name} className="h-8 w-auto object-contain rounded" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
          )},
          { key: "linkUrl", header: "Website", render: (row) => row.linkUrl ? <a href={row.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#66FFB4" }}>Buka ↗</a> : "—" },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title={editTarget ? "Edit Sponsor" : "Tambah Sponsor"}
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSave} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <FormField label="Nama Sponsor" required>
          <DashInput value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} placeholder="Nama perusahaan/brand" />
        </FormField>
        <FormField label="URL Logo" required>
          <DashInput value={form.logoUrl} onChange={(v) => setForm(f => ({ ...f, logoUrl: v }))} placeholder="https://..." type="url" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tier">
            <DashSelect value={form.tier} onChange={(v) => setForm(f => ({ ...f, tier: v }))} placeholder="Pilih tier" options={TIERS.map(t => ({ value: t, label: t }))} />
          </FormField>
          <FormField label="Urutan Tampil">
            <DashInput value={form.order} onChange={(v) => setForm(f => ({ ...f, order: v }))} placeholder="0" type="number" />
          </FormField>
        </div>
        <FormField label="URL Website">
          <DashInput value={form.linkUrl} onChange={(v) => setForm(f => ({ ...f, linkUrl: v }))} placeholder="https://..." type="url" />
        </FormField>
      </Modal>
    </div>
  );
}
