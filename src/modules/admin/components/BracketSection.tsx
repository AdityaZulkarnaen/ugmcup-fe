"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getDisciplines, getBracket, setupBracket, getParticipants, getTeams } from "@/lib/api/admin";
import type { Discipline, BracketNode, Participant, Team } from "@/lib/types";

export function BracketSection() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisc, setSelectedDisc] = useState("");
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    getDisciplines().then(setDisciplines).catch(() => {});
  }, []);

  const loadBracket = useCallback(async () => {
    if (!selectedDisc) return;
    setIsLoading(true);
    try {
      const nodes = await getBracket(selectedDisc);
      setBracketNodes(nodes);
      const disc = disciplines.find(d => d.id === selectedDisc);
      if (disc?.isTeamEvent) {
        const t = await getTeams(selectedDisc);
        setTeams(t); setParticipants([]);
      } else {
        const p = await getParticipants(selectedDisc);
        setParticipants(p); setTeams([]);
      }
    } finally { setIsLoading(false); }
  }, [selectedDisc, disciplines]);

  useEffect(() => { loadBracket(); }, [loadBracket]);

  async function handleSetup() {
    setIsSaving(true); setError("");
    try {
      const disc = disciplines.find(d => d.id === selectedDisc);
      const payload = disc?.isTeamEvent
        ? { disciplineId: selectedDisc, teamIds: selectedIds }
        : { disciplineId: selectedDisc, participantIds: selectedIds };
      await setupBracket(payload);
      setSetupModalOpen(false); setSelectedIds([]);
      await loadBracket();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal setup bracket"); }
    finally { setIsSaving(false); }
  }

  const entityList = participants.length > 0 ? participants : teams;
  const getLabel = (item: Participant | Team) => {
    if ("athletes" in item) {
      return (item as Participant).institution?.name ?? "Peserta";
    }
    return (item as Team).institution?.name ?? "Tim";
  };

  const groupedByRound: Record<string, BracketNode[]> = {};
  bracketNodes.forEach(node => {
    const round = node.match?.roundName ?? "Unknown";
    if (!groupedByRound[round]) groupedByRound[round] = [];
    groupedByRound[round].push(node);
  });

  return (
    <div>
      <PageHeader
        title="Bracket"
        subtitle="Visualisasi dan setup bracket fase gugur"
        action={
          selectedDisc && bracketNodes.length === 0 ? (
            <button onClick={() => setSetupModalOpen(true)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-[#14183B] transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #66FFB4, #02F5D4)" }}>
              ⚡ Setup Bracket
            </button>
          ) : undefined
        }
      />

      <div className="mb-6">
        <DashSelect value={selectedDisc} onChange={setSelectedDisc} placeholder="Pilih cabang untuk melihat bracket"
          options={disciplines.map(d => ({ value: d.id, label: d.name }))} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} /></div>
      ) : bracketNodes.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
          <p className="text-4xl mb-4">🔀</p>
          <p className="text-white font-semibold">Bracket belum dibuat</p>
          <p className="text-sm mt-1" style={{ color: "#9D9DB6" }}>Klik "Setup Bracket" untuk generate bracket dari daftar peserta.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByRound).map(([round, nodes]) => (
            <div key={round} className="rounded-2xl border p-5" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
              <h3 className="mb-4 text-sm font-bold text-white">{round}</h3>
              <div className="space-y-3">
                {nodes.map(node => (
                  <div key={node.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3 text-sm text-white/90">
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(131,82,217,0.2)", color: "#D9D3FF" }}>
                        #{node.position}
                      </span>
                      <span>
                        {node.match?.participantA?.institution?.name ?? node.match?.teamA?.institution?.name ?? "TBD"}
                        <span style={{ color: "#9D9DB6" }}> vs </span>
                        {node.match?.participantB?.institution?.name ?? node.match?.teamB?.institution?.name ?? "TBD"}
                      </span>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: "rgba(102,255,180,0.15)", color: "#66FFB4" }}>
                      {node.match?.status ?? "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={setupModalOpen} onClose={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }}
        title="Setup Bracket Knockout" size="md"
        footer={<><ModalCancelButton onClick={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }} /><ModalSubmitButton onClick={handleSetup} isLoading={isSaving} label="Generate Bracket" /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <p className="mb-4 text-sm" style={{ color: "#9D9DB6" }}>Pilih {disciplines.find(d => d.id === selectedDisc)?.isTeamEvent ? "tim" : "peserta"} yang masuk bracket. Sistem akan generate pasangan match secara otomatis.</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entityList.map(item => (
            <label key={item.id} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <input type="checkbox" checked={selectedIds.includes(item.id)}
                onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id))}
                className="h-4 w-4 rounded" />
              <span className="text-sm text-white">{getLabel(item)}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
