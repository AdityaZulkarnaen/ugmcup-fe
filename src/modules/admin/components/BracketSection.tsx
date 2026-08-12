import { useEffect, useState, useCallback, useRef } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getBracket, setupBracket, deleteBracket, getParticipants, getTeams, reassignBracketNode } from "@/lib/api/admin";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import type { BracketNode, Participant, Team } from "@/lib/types";
import { GitMerge, Edit, Trash2, Search, ChevronDown } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih peserta..."
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const query = useDebouncedValue(search);

  const selectedOpt = options.find(o => o.value === value);
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border bg-gray-50 px-3 py-2.5 text-xs text-left outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        style={{ borderColor: "#D1D5DB", color: "#111827" }}
      >
        <span className="truncate font-medium">{selectedOpt ? selectedOpt.label : placeholder}</span>
        <ChevronDown size={14} className="ml-2 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama / instansi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-800 outline-none focus:border-purple-500"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5" data-lenis-prevent>
            {filtered.length === 0 ? (
              <p className="py-2 text-center text-xs text-gray-400">Tidak ada peserta ditemukan</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                    opt.value === value
                      ? "bg-purple-50 text-[#6C47D1] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BracketSection() {
  const [filterLevel, setFilterLevel] = useState(LEVELS[0].value);
  const [selectedDisc, setSelectedDisc] = useState("");

  // Setelan awal di sini bukan "kosong": jenjang selalu terisi, bawaannya
  // jenjang pertama.
  const isDefaultFilters = filterLevel === LEVELS[0].value && selectedDisc === "";

  function resetFilters() {
    setFilterLevel(LEVELS[0].value);
    setSelectedDisc("");
  }
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
  const [isDeleting, setIsDeleting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{startX: number, startY: number, endX: number, endY: number}[]>([]);

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

  const drawLines = useCallback(() => {
    if (!containerRef.current || bracketNodes.length === 0) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLines: {startX: number, startY: number, endX: number, endY: number}[] = [];
    
    // Build rounds array again for drawing logic
    const grouped: Record<string, BracketNode[]> = {};
    bracketNodes.forEach(node => {
      const round = node.match?.roundName ?? "Unknown";
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(node);
    });
    const rArray = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

    for (let r = 0; r < rArray.length - 1; r++) {
      const currentRoundNodes = rArray[r][1];
      const nextRoundNodes = rArray[r+1][1];
      
      const sortedCurrent = [...currentRoundNodes].sort((a,b) => a.position - b.position);
      const sortedNext = [...nextRoundNodes].sort((a,b) => a.position - b.position);
      
      for (let i = 0; i < sortedCurrent.length; i++) {
        const nodeA = sortedCurrent[i];
        const nextNodeIndex = Math.floor(i / 2);
        const nodeB = sortedNext[nextNodeIndex];
        
        if (nodeA && nodeB) {
          const elA = document.getElementById(`node-${nodeA.id}`);
          const elB = document.getElementById(`node-${nodeB.id}`);
          if (elA && elB) {
            const rectA = elA.getBoundingClientRect();
            const rectB = elB.getBoundingClientRect();
            
            const startX = rectA.right - containerRect.left;
            const startY = rectA.top + rectA.height / 2 - containerRect.top;
            
            const endX = rectB.left - containerRect.left;
            const endY = rectB.top + rectB.height / 2 - containerRect.top;
            
            newLines.push({ startX, startY, endX, endY });
          }
        }
      }
    }
    setLines(newLines);
  }, [bracketNodes]);

  useEffect(() => {
    const timeoutId = setTimeout(drawLines, 100);
    window.addEventListener('resize', drawLines);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', drawLines);
    };
  }, [drawLines]);

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

  async function handleDeleteBracket() {
    if (!selectedDisc) return;
    setIsDeleting(true); setError("");
    try {
      await deleteBracket(selectedDisc);
      setDeleteModalOpen(false);
      await loadBracket();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus bracket");
    } finally { setIsDeleting(false); }
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

    if (!containerRef.current) return;
    const scrollContainer = containerRef.current.parentElement;
    if (!scrollContainer) return;

    const rect = scrollContainer.getBoundingClientRect();
    const edgeThreshold = 70;
    const scrollSpeed = 15;

    let deltaX = 0;
    let deltaY = 0;

    if (e.clientY - rect.top < edgeThreshold) {
      deltaY = -scrollSpeed * (1 - Math.max(0, e.clientY - rect.top) / edgeThreshold);
    } else if (rect.bottom - e.clientY < edgeThreshold) {
      deltaY = scrollSpeed * (1 - Math.max(0, rect.bottom - e.clientY) / edgeThreshold);
    }

    if (e.clientX - rect.left < edgeThreshold) {
      deltaX = -scrollSpeed * (1 - Math.max(0, e.clientX - rect.left) / edgeThreshold);
    } else if (rect.right - e.clientX < edgeThreshold) {
      deltaX = scrollSpeed * (1 - Math.max(0, rect.right - e.clientX) / edgeThreshold);
    }

    if (deltaX !== 0 || deltaY !== 0) {
      scrollContainer.scrollBy({ left: deltaX, top: deltaY, behavior: "instant" });
      drawLines();
    }
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
    } catch (e) {
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
        const names = p.athletes.map(a => a.athlete?.name).filter(Boolean).join(" - ");
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
            bracketNodes.length === 0 ? (
              <button onClick={() => setSetupModalOpen(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
                style={{ background: "#6C47D1" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#5b3cae")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6C47D1")}>
                <GitMerge size={16} /> Buat Bracket
              </button>
            ) : (
              <button onClick={() => setDeleteModalOpen(true)} disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60"
                style={{ background: "#DC2626" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}>
                <Trash2 size={16} /> {isDeleting ? "Menghapus..." : "Hapus Bracket"}
              </button>
            )
          ) : undefined
        }
      />

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => { setFilterLevel(lvl.value); setSelectedDisc(""); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${filterLevel === lvl.value
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
        <ResetFiltersButton onClick={resetFilters} disabled={isDefaultFilters} isLight />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : bracketNodes.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <GitMerge className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Bracket belum dibuat</p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Klik "Buat Bracket" untuk membuat struktur bagan fase gugur.</p>
        </div>
      ) : roundsArray.length > 0 ? (
        <div className="overflow-auto max-h-[75vh] rounded-xl border bg-[#F8FAFC] p-6 relative" style={{ borderColor: "#E2E8F0" }} data-lenis-prevent>
          <div ref={containerRef} className="flex flex-row gap-10 min-w-max items-stretch relative">
            <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
              {lines.map((l, i) => {
                const midX = (l.startX + l.endX) / 2;
                return (
                  <path 
                    key={i} 
                    d={`M ${l.startX} ${l.startY} L ${midX} ${l.startY} L ${midX} ${l.endY} L ${l.endX} ${l.endY}`}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>
            {roundsArray.map(([round, nodes], rIdx) => {
              const isFirstRound = rIdx === 0;
              return (
                <div key={round} className="flex flex-col justify-around gap-3 w-56 shrink-0 relative">
                  <div className="absolute -top-6 left-0 right-0 text-center text-xs font-bold text-slate-500">{round}</div>
                  {nodes.map((node) => {
                    const getMatchEntityLabel = (p: any, t: any, isFirst: boolean) => {
                      if (p) {
                        const inst = p.institution?.name ?? "Instansi";
                        if (p.athletes?.length) {
                          const names = p.athletes.map((a: any) => a.athlete?.name).filter(Boolean).join(" - ");
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
                      <div id={`node-${node.id}`} key={node.id} className="relative bg-white border rounded-lg shadow-sm overflow-hidden text-xs flex flex-col group z-10" style={{ borderColor: "#CBD5E1" }}>
                        <div
                          draggable={isFirstRound}
                          onDragStart={(e) => isFirstRound && handleDragStart(e, node.id, "A", entityAId)}
                          onDragOver={isFirstRound ? handleDragOver : undefined}
                          onDrop={(e) => isFirstRound && handleDrop(e, node.id, "A", entityAId)}
                          className={`p-2 border-b flex justify-between items-center ${isFirstRound ? 'cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors' : ''}`}
                          style={{ borderColor: "#E2E8F0" }}
                        >
                          <span className={`truncate mr-1 ${!entityAId ? (isFirstRound ? "text-amber-500 italic" : "text-slate-400 italic font-medium") : "font-semibold text-slate-800"}`}>{nameA}</span>
                          <span className="font-bold text-slate-500 shrink-0">{node.match?.sets?.[0]?.scoreA ?? 0}</span>
                        </div>

                        <div
                          draggable={isFirstRound}
                          onDragStart={(e) => isFirstRound && handleDragStart(e, node.id, "B", entityBId)}
                          onDragOver={isFirstRound ? handleDragOver : undefined}
                          onDrop={(e) => isFirstRound && handleDrop(e, node.id, "B", entityBId)}
                          className={`p-2 flex justify-between items-center ${isFirstRound ? 'cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors' : ''}`}
                        >
                          <span className={`truncate mr-1 ${!entityBId ? (isFirstRound ? "text-amber-500 italic" : "text-slate-400 italic font-medium") : "font-semibold text-slate-800"}`}>{nameB}</span>
                          <span className="font-bold text-slate-500 shrink-0">{node.match?.sets?.[0]?.scoreB ?? 0}</span>
                        </div>

                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+6px)] text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                          #{node.position}
                        </div>

                        <button
                          onClick={() => openEditModal(node)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border shadow-sm p-1 rounded text-slate-500 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Slot"
                        >
                          <Edit size={12} />
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

      {/* Konfirmasi Hapus Bracket Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setError(""); }}
        title="Hapus Bracket" size="sm"
        footer={<div className="flex gap-2">
          <ModalCancelButton onClick={() => { setDeleteModalOpen(false); setError(""); }} />
          <button onClick={handleDeleteBracket} disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#DC2626" }}>
            <Trash2 size={14} /> {isDeleting ? "Menghapus..." : "Ya, Hapus Bracket"}
          </button>
        </div>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        <p className="text-sm" style={{ color: "#374151" }}>
          Yakin ingin menghapus bracket <span className="font-bold">{DISCIPLINES.find(d => d.id === selectedDisc)?.name ?? "kategori ini"}</span>?
        </p>
        <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
          Semua match knockout yang ter-generate dari bracket ini (beserta skor setnya) akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
        </p>
      </Modal>

      {/* Setup Bracket Modal */}
      <Modal isOpen={setupModalOpen} onClose={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }}
        title="Setup Bracket Knockout" size="md"
        footer={<div><ModalCancelButton onClick={() => { setSetupModalOpen(false); setError(""); setSelectedIds([]); }} /><ModalSubmitButton onClick={handleSetup} isLoading={isSaving} label="Generate Bracket" /></div>}>
        {error && <p className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        <p className="mb-3 text-sm" style={{ color: "#6B7280" }}>Pilih {DISCIPLINES.find(d => d.id === selectedDisc)?.isTeamEvent ? "tim" : "peserta"} yang masuk bracket. Urutan klik menentukan urutan slot bracket — slot BYE bisa disesuaikan kembali nanti.</p>

        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#F3F0FB", color: "#6C47D1" }}>
            {selectedIds.length} dipilih
          </span>
          <div className="flex items-center gap-3">
            {entityList.length > 0 && selectedIds.length < entityList.length && (
              <button
                type="button"
                onClick={() => setSelectedIds(entityList.map(e => e.id))}
                className="text-xs font-semibold text-[#6C47D1] hover:underline transition-colors"
              >
                Pilih semua
              </button>
            )}
            {selectedIds.length > 0 && (
              <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
                Kosongkan pilihan
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1" data-lenis-prevent>
          {entityList.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada peserta terdaftar untuk kategori ini.</p>
          ) : entityList.map(item => {
            const order = selectedIds.indexOf(item.id);
            const isChecked = order !== -1;
            const isParticipant = "athletes" in item;
            const p = item as Participant;
            const names = isParticipant
              ? (p.athletes?.map(a => a.athlete?.name).filter(Boolean).join(" / ") || p.institution?.name || "Peserta")
              : ((item as Team).institution?.name ?? "Tim");
            const subLabel = isParticipant
              ? (p.institution?.name ?? "Instansi Tanpa Nama")
              : "Tim Beregu";
            return (
              <button key={item.id} type="button"
                onClick={() => setSelectedIds(prev => isChecked ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={isChecked
                  ? { borderColor: "#6C47D1", background: "#F8F5FF" }
                  : { borderColor: "#E5E7EB", background: "#fff" }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={isChecked
                    ? { background: "#6C47D1", color: "#fff" }
                    : { background: "#F3F4F6", color: "#9CA3AF" }}>
                  {isChecked ? order + 1 : "·"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: "#1F2937" }}>{names}</span>
                  <span className="block truncate text-xs" style={{ color: "#6B7280" }}>{subLabel}</span>
                </span>
                {item.seedNumber ? (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>
                    Seed {item.seedNumber}
                  </span>
                ) : null}
              </button>
            );
          })}
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
            <SearchableSelect value={slotAId} onChange={setSlotAId} options={optionsWithBye} placeholder="Cari / Pilih Peserta Sisi A..." />
          </FormField>
          <FormField label="Peserta / Tim Sisi B">
            <SearchableSelect value={slotBId} onChange={setSlotBId} options={optionsWithBye} placeholder="Cari / Pilih Peserta Sisi B..." />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
