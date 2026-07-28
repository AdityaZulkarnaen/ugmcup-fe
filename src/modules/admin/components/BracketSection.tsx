import { useEffect, useState, useCallback } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getBracket, setupBracket, getParticipants, getTeams, reassignBracketNode } from "@/lib/api/admin";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import type { BracketNode, Participant, Team } from "@/lib/types";
import { GitMerge, Edit } from "lucide-react";

export function BracketSection() {
  const [filterLevel, setFilterLevel] = useState(LEVELS[0].value);
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
  const [pendingChanges, setPendingChanges] = useState<Record<string, { participantAId?: string | null; participantBId?: string | null; teamAId?: string | null; teamBId?: string | null }>>({});

  const [draggedItem, setDraggedItem] = useState<{ nodeId: string; slotType: "A" | "B"; entityId: string | null } | null>(null);

  const [slotAId, setSlotAId] = useState<string>("");
  const [slotBId, setSlotBId] = useState<string>("");

  const loadBracket = useCallback(async () => {
    if (!selectedDisc) return;
    setIsLoading(true); setError("");
    setPendingChanges({});
    try {
      const nodes = await getBracket(selectedDisc);
      setBracketNodes(nodes);
      const disc = DISCIPLINES.find(d => d.id === selectedDisc);
      if (disc?.isTeamEvent) {
        const t = await getTeams(selectedDisc);
        setTeams(t); setParticipants([]);
      } else {
        const p = await getParticipants(selectedDisc);
        setParticipants(p); setTeams([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat bracket");
    } finally { setIsLoading(false); }
  }, [selectedDisc]);

  useEffect(() => { loadBracket(); }, [loadBracket]);

  async function handleSetup() {
    setIsSaving(true); setError("");
    try {
      const disc = DISCIPLINES.find(d => d.id === selectedDisc);

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
    const disc = DISCIPLINES.find(d => d.id === selectedDisc);
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
      const disc = DISCIPLINES.find(d => d.id === selectedDisc);
      const payload = disc?.isTeamEvent
        ? { teamAId: slotAId || null, teamBId: slotBId || null }
        : { participantAId: slotAId || null, participantBId: slotBId || null };

      await reassignBracketNode(selectedNode.id, payload);
      setEditNodeModalOpen(false);
      await loadBracket();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui slot bracket");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDragStart = (e: React.DragEvent, nodeId: string, slotType: "A" | "B", entityId: string | null) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem({ nodeId, slotType, entityId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetNodeId: string, targetSlotType: "A" | "B", targetEntityId: string | null) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.nodeId === targetNodeId && draggedItem.slotType === targetSlotType) {
      setDraggedItem(null);
      return;
    }

    const disc = DISCIPLINES.find((d) => d.id === selectedDisc);
    const isTeam = disc?.isTeamEvent;
    const aKey = isTeam ? "teamAId" : "participantAId";
    const bKey = isTeam ? "teamBId" : "participantBId";
    const aObj = isTeam ? "teamA" : "participantA";
    const bObj = isTeam ? "teamB" : "participantB";

    setBracketNodes(prevNodes => {
      const newNodes = JSON.parse(JSON.stringify(prevNodes)) as BracketNode[];
      const sourceNode = newNodes.find(n => n.id === draggedItem.nodeId);
      const targetNode = newNodes.find(n => n.id === targetNodeId);
      
      if (!sourceNode || !targetNode || !sourceNode.match || !targetNode.match) return prevNodes;
      
      if (draggedItem.slotType === "A") (sourceNode.match as any)[aKey] = targetEntityId;
      else (sourceNode.match as any)[bKey] = targetEntityId;
      
      if (targetSlotType === "A") (targetNode.match as any)[aKey] = draggedItem.entityId;
      else (targetNode.match as any)[bKey] = draggedItem.entityId;
      
      const sourceNested = draggedItem.slotType === "A" ? (sourceNode.match as any)[aObj] : (sourceNode.match as any)[bObj];
      const targetNested = targetSlotType === "A" ? (targetNode.match as any)[aObj] : (targetNode.match as any)[bObj];
      
      if (draggedItem.slotType === "A") (sourceNode.match as any)[aObj] = targetNested;
      else (sourceNode.match as any)[bObj] = targetNested;
      
      if (targetSlotType === "A") (targetNode.match as any)[aObj] = sourceNested;
      else (targetNode.match as any)[bObj] = sourceNested;
      
      setPendingChanges(prev => {
         const next = { ...prev };
         next[sourceNode.id] = {
            ...(next[sourceNode.id] || {}),
            [aKey]: (sourceNode.match as any)[aKey],
            [bKey]: (sourceNode.match as any)[bKey],
         };
         next[targetNode.id] = {
            ...(next[targetNode.id] || {}),
            [aKey]: (targetNode.match as any)[aKey],
            [bKey]: (targetNode.match as any)[bKey],
         };
         return next;
      });
      
      return newNodes;
    });

    setDraggedItem(null);
  };

  async function savePendingChanges() {
    setIsSaving(true);
    try {
      const promises = Object.entries(pendingChanges).map(([nodeId, payload]) => 
        reassignBracketNode(nodeId, payload as any)
      );
      await Promise.all(promises);
      setPendingChanges({});
      await loadBracket();
    } catch(e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan perubahan bracket");
    } finally {
      setIsSaving(false);
    }
  }

  const entityList = participants.length > 0 ? participants : teams;
  const getLabel = (item: Participant | Team) => {
    if ("athletes" in item) {
      const p = item as Participant;
      const instName = p.institution?.name ?? "Instansi Tanpa Nama";
      if (p.athletes && p.athletes.length > 0) {
        const names = p.athletes.map(a => a.athlete?.name).filter(Boolean).join(" & ");
        return `${names} (${instName})`;
      }
      return instName;
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
  
  const roundsArray = Object.entries(groupedByRound).sort((a, b) => b[1].length - a[1].length);

  return (
    <div>
      <PageHeader
        title="Bracket"
        subtitle="Visualisasi dan susun urutan bracket secara fleksibel"
        action={
          selectedDisc ? (
            <button onClick={() => setSetupModalOpen(true)}
              className="flex items-center rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
              style={{ background: "#6C47D1" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#5b3cae")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#6C47D1")}>
              {bracketNodes.length === 0 ? "Setup Bracket" : "Reset & Buat Ulang Bracket"}
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => { setFilterLevel(lvl.value); setSelectedDisc(""); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                filterLevel === lvl.value
                  ? "bg-white text-[#6C47D1] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
        <div className="w-64 shrink-0">
          <DashSelect
            value={selectedDisc}
            onChange={setSelectedDisc}
            placeholder="Pilih kategori"
            options={(filterLevel ? getDisciplinesByLevel(filterLevel) : DISCIPLINES).map(d => ({ value: d.id, label: d.name }))}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : bracketNodes.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <GitMerge className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Bracket belum dibuat</p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Klik "Setup Bracket" untuk membuat struktur bagan fase gugur.</p>
        </div>
      ) : roundsArray.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border bg-[#F8FAFC] p-8" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex flex-row gap-16 min-w-max items-stretch">
            {roundsArray.map(([round, nodes], rIdx) => {
              const isFirstRound = rIdx === 0;
              return (
                <div key={round} className="flex flex-col justify-around gap-6 w-72 shrink-0 relative">
                  <div className="absolute -top-6 left-0 right-0 text-center text-sm font-bold text-slate-500">{round}</div>
                  {nodes.map((node) => {
                    const getMatchEntityLabel = (p: any, t: any, isFirst: boolean) => {
                      if (p) {
                        const inst = p.institution?.name ?? "Instansi";
                        if (p.athletes?.length) {
                          const names = p.athletes.map((a: any) => a.athlete?.name).filter(Boolean).join(" & ");
                          return `${names} (${inst})`;
                        }
                        return inst;
                      }
                      if (t) return t.institution?.name ?? "Tim";
                      return isFirst ? "BYE" : "TBD";
                    };

                    const entityAId = node.match?.participantAId ?? node.match?.teamAId ?? null;
                    const entityBId = node.match?.participantBId ?? node.match?.teamBId ?? null;
                    const nameA = getMatchEntityLabel(node.match?.participantA, node.match?.teamA, isFirstRound);
                    const nameB = getMatchEntityLabel(node.match?.participantB, node.match?.teamB, isFirstRound);
                    
                    return (
                      <div key={node.id} className="relative bg-white border rounded-lg shadow-sm overflow-hidden text-sm flex flex-col group" style={{ borderColor: "#CBD5E1" }}>
                        
                        <div 
                          draggable={isFirstRound}
                          onDragStart={(e) => isFirstRound && handleDragStart(e, node.id, "A", entityAId)}
                          onDragOver={isFirstRound ? handleDragOver : undefined}
                          onDrop={(e) => isFirstRound && handleDrop(e, node.id, "A", entityAId)}
                          className={`p-3 border-b flex justify-between items-center ${isFirstRound ? 'cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors' : ''}`}
                          style={{ borderColor: "#E2E8F0" }}
                        >
                          <span className={!entityAId ? (isFirstRound ? "text-amber-500 italic" : "text-slate-400 italic font-medium") : "font-semibold text-slate-800"}>{nameA}</span>
                          <span className="font-bold text-slate-500">{node.match?.sets?.[0]?.scoreA ?? 0}</span>
                        </div>
                        
                        <div 
                          draggable={isFirstRound}
                          onDragStart={(e) => isFirstRound && handleDragStart(e, node.id, "B", entityBId)}
                          onDragOver={isFirstRound ? handleDragOver : undefined}
                          onDrop={(e) => isFirstRound && handleDrop(e, node.id, "B", entityBId)}
                          className={`p-3 flex justify-between items-center ${isFirstRound ? 'cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors' : ''}`}
                        >
                          <span className={!entityBId ? (isFirstRound ? "text-amber-500 italic" : "text-slate-400 italic font-medium") : "font-semibold text-slate-800"}>{nameB}</span>
                          <span className="font-bold text-slate-500">{node.match?.sets?.[0]?.scoreB ?? 0}</span>
                        </div>
                        
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                          #{node.position}
                        </div>
                        
                        <button 
                          onClick={() => openEditModal(node)} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border shadow-sm p-1.5 rounded-md text-slate-500 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Slot"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {Object.keys(pendingChanges).length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={savePendingChanges}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#6C47D1] hover:bg-[#5b3cae] text-white px-6 py-3 rounded-full shadow-lg font-bold transition-all"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}

      {/* Setup Bracket Modal */}
      <Modal isOpen={setupModalOpen} onClose={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }}
        title="Setup Bracket Knockout" size="md"
        footer={<div><ModalCancelButton onClick={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }} /><ModalSubmitButton onClick={handleSetup} isLoading={isSaving} label="Generate Bracket" /></div>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        <p className="mb-4 text-sm" style={{ color: "#6B7280" }}>Pilih {DISCIPLINES.find(d => d.id === selectedDisc)?.isTeamEvent ? "tim" : "peserta"} yang masuk bracket. Urutan atau slot BYE bisa disesuaikan kembali nanti.</p>
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
        footer={<div><ModalCancelButton onClick={() => setEditNodeModalOpen(false)} /><ModalSubmitButton onClick={handleReassign} isLoading={isSaving} label="Simpan Slot" /></div>}>
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
