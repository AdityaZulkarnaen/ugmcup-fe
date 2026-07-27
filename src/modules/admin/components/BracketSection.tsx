import { useEffect, useState, useCallback } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getDisciplines, getBracket, setupBracket, getParticipants, getTeams, reassignBracketNode } from "@/lib/api/admin";
import type { Discipline, BracketNode, Participant, Team } from "@/lib/types";
import { GitMerge, Zap, Edit } from "lucide-react";

export function BracketSection() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisc, setSelectedDisc] = useState("");
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [editNodeModalOpen, setEditNodeModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<BracketNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Slot edit form
  const [slotAId, setSlotAId] = useState<string>("");
  const [slotBId, setSlotBId] = useState<string>("");

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
      
      const generateRoundNames = (count: number) => {
        if (count <= 0) return ["Final"];
        const rounds = Math.max(1, Math.ceil(Math.log2(count)));
        const names = ["Final", "Semifinal", "Perempat Final"];
        const res = [];
        for (let i = rounds; i >= 1; i--) {
          if (i <= 3) res.push(names[i - 1]);
          else res.push(`Babak ${Math.pow(2, i)} Besar`);
        }
        return res;
      };

      const roundNames = generateRoundNames(selectedIds.length);
      const payload = disc?.isTeamEvent
        ? { disciplineId: selectedDisc, teamIds: selectedIds, roundNames }
        : { disciplineId: selectedDisc, participantIds: selectedIds, roundNames };
      await setupBracket(payload);
      setSetupModalOpen(false); setSelectedIds([]);
      await loadBracket();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal setup bracket"); }
    finally { setIsSaving(false); }
  }

  function openEditModal(node: BracketNode) {
    setSelectedNode(node);
    const disc = disciplines.find(d => d.id === selectedDisc);
    if (disc?.isTeamEvent) {
      setSlotAId(node.match?.teamAId ?? "");
      setSlotBId(node.match?.teamBId ?? "");
    } else {
      setSlotAId(node.match?.participantAId ?? "");
      setSlotBId(node.match?.participantBId ?? "");
    }
    setEditNodeModalOpen(true);
  }

  async function handleReassign() {
    if (!selectedNode) return;
    setIsSaving(true); setError("");
    try {
      const disc = disciplines.find(d => d.id === selectedDisc);
      const payload = disc?.isTeamEvent
        ? { teamAId: slotAId || null, teamBId: slotBId || null }
        : { participantAId: slotAId || null, participantBId: slotBId || null };

      const updatedNodes = await reassignBracketNode(selectedNode.id, payload);
      setBracketNodes(updatedNodes);
      setEditNodeModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui slot bracket");
    } finally {
      setIsSaving(false);
    }
  }

  const entityList = participants.length > 0 ? participants : teams;
  const getLabel = (item: Participant | Team) => {
    if ("athletes" in item) {
      return (item as Participant).institution?.name ?? "Peserta";
    }
    return (item as Team).institution?.name ?? "Tim";
  };

  const optionsWithBye = [
    { value: "", label: "[ BYE / Kosong ]" },
    ...entityList.map(item => ({ value: item.id, label: getLabel(item) }))
  ];

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
        subtitle="Visualisasi dan susun urutan bracket (termasuk BYE) secara fleksibel"
        action={
          selectedDisc ? (
            <button onClick={() => setSetupModalOpen(true)}
              className="flex items-center rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
              style={{ background: "#6C47D1" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#5b3cae")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#6C47D1")}>
              <Zap className="mr-2 h-4 w-4" />
              {bracketNodes.length === 0 ? "Setup Bracket" : "Reset & Buat Ulang Bracket"}
            </button>
          ) : undefined
        }
      />

      <div className="mb-6">
        <DashSelect value={selectedDisc} onChange={setSelectedDisc} placeholder="Pilih cabang untuk melihat bracket"
          options={disciplines.map(d => ({ value: d.id, label: d.name }))} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : bracketNodes.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <GitMerge className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Bracket belum dibuat</p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Klik "Setup Bracket" untuk membuat struktur bagan fase gugur.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByRound).map(([round, nodes]) => (
            <div key={round} className="rounded-lg border bg-white p-5" style={{ borderColor: "#E5E7EB" }}>
              <h3 className="mb-4 text-sm font-bold" style={{ color: "#111827" }}>{round}</h3>
              <div className="space-y-3">
                {nodes.map(node => (
                  <div key={node.id} className="flex items-center justify-between rounded-lg border px-4 py-3"
                    style={{ borderColor: "#F3F4F6", background: "#FAFAFA" }}>
                    <div className="flex items-center gap-3 text-sm" style={{ color: "#374151" }}>
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#EDE9FE", color: "#6C47D1" }}>
                        #{node.position}
                      </span>
                      <span>
                        <strong className={!node.match?.participantA && !node.match?.teamA ? "text-amber-600 italic" : ""}>
                          {node.match?.participantA?.institution?.name ?? node.match?.teamA?.institution?.name ?? "BYE"}
                        </strong>
                        <span style={{ color: "#9CA3AF" }}> vs </span>
                        <strong className={!node.match?.participantB && !node.match?.teamB ? "text-amber-600 italic" : ""}>
                          {node.match?.participantB?.institution?.name ?? node.match?.teamB?.institution?.name ?? "BYE"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: node.match?.status === "WALKOVER" ? "#FEF3C7" : "#DCFCE7", color: node.match?.status === "WALKOVER" ? "#92400E" : "#166534" }}>
                        {node.match?.status === "WALKOVER" ? "BYE (Lolos)" : node.match?.status ?? "—"}
                      </span>
                      <button onClick={() => openEditModal(node)} className="flex items-center gap-1 text-xs px-3 py-1.5 font-semibold rounded-lg border transition hover:bg-gray-100" style={{ borderColor: "#D1D5DB", color: "#374151", background: "#fff" }}>
                        <Edit size={12} /> Susun Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Setup Bracket Modal */}
      <Modal isOpen={setupModalOpen} onClose={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }}
        title="Setup Bracket Knockout" size="md"
        footer={<><ModalCancelButton onClick={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }} /><ModalSubmitButton onClick={handleSetup} isLoading={isSaving} label="Generate Bracket" /></>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        <p className="mb-4 text-sm" style={{ color: "#6B7280" }}>Pilih {disciplines.find(d => d.id === selectedDisc)?.isTeamEvent ? "tim" : "peserta"} yang masuk bracket. Urutan atau slot BYE bisa disesuaikan kembali nanti.</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entityList.map(item => (
            <label key={item.id} className="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition hover:bg-gray-50"
              style={{ borderColor: "#F3F4F6" }}>
              <input type="checkbox" checked={selectedIds.includes(item.id)}
                onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id))}
                className="h-4 w-4 rounded" />
              <span className="text-sm" style={{ color: "#374151" }}>{getLabel(item)}</span>
            </label>
          ))}
        </div>
      </Modal>

      {/* Reassign Slot Modal */}
      <Modal isOpen={editNodeModalOpen} onClose={() => { setEditNodeModalOpen(false); setError(""); }}
        title={`Susun Slot Match (${selectedNode?.match?.roundName ?? ""})`} size="md"
        footer={<><ModalCancelButton onClick={() => setEditNodeModalOpen(false)} /><ModalSubmitButton onClick={handleReassign} isLoading={isSaving} label="Simpan Slot" /></>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        <p className="mb-4 text-sm" style={{ color: "#6B7280" }}>Tentukan peserta/tim untuk slot A dan slot B match ini sesuai dengan bracket yang telah Anda buat di luar sistem.</p>
        <div className="space-y-4">
          <FormField label="Peserta / Tim Sisi A">
            <DashSelect value={slotAId} onChange={setSlotAId} options={optionsWithBye} />
          </FormField>
          <FormField label="Peserta / Tim Sisi B">
            <DashSelect value={slotBId} onChange={setSlotBId} options={optionsWithBye} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
