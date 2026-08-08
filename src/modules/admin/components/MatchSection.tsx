"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader, FormField, DashInput, DashSelect } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import { CheckCircle, ArrowLeftRight } from "lucide-react";
import { getMatches, deleteMatch, updateMatchSchedule, finishMatch, swapMatchSides } from "@/lib/api/matches";
import type { Match, MatchStatus } from "@/lib/types";

const STATUS_STYLE: Record<MatchStatus | "WALK_OVER", { bg: string; color: string }> = {
  SCHEDULED: { bg: "#FEF3C7", color: "#92400E" },
  ONGOING:   { bg: "#DBEAFE", color: "#1E40AF" },
  FINISHED:  { bg: "#DCFCE7", color: "#166534" },
  RETIRED:   { bg: "#FEE2E2", color: "#991B1B" },
  WALK_OVER: { bg: "#F3E8FF", color: "#6B21A8" },
};

export function MatchSection() {
  const [data, setData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterParticipant, setFilterParticipant] = useState("");
  
  const [editForm, setEditForm] = useState({ id: "", courtNumber: "", scheduledTime: "" });
  const [finishForm, setFinishForm] = useState<{
    id: string;
    status: 'FINISHED' | 'WALK_OVER' | 'RETIRED';
    winnerId: string;
    sets: { setNumber: number; scoreA: number; scoreB: number }[];
  }>({ id: "", status: "FINISHED", winnerId: "", sets: [
    { setNumber: 1, scoreA: 0, scoreB: 0 },
    { setNumber: 2, scoreA: 0, scoreB: 0 },
    { setNumber: 3, scoreA: 0, scoreB: 0 },
  ] });
  const [subMatchForms, setSubMatchForms] = useState<{
    id?: string;
    slotType: string;
    label: string;
    status: "FINISHED" | "WALK_OVER" | "RETIRED";
    winnerId: string;
    sets: { setNumber: number; scoreA: number; scoreB: number }[];
  }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    const m = await getMatches(filterStatus ? { status: filterStatus as MatchStatus } : undefined);
    setData(m || []);
    if (showSpinner) setIsLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveEdit() {
    setIsSaving(true); setError("");
    try {
      const courtNumber = editForm.courtNumber ? parseInt(editForm.courtNumber) : undefined;
      const scheduledTime = editForm.scheduledTime ? new Date(editForm.scheduledTime).toISOString() : undefined;
      
      await updateMatchSchedule(editForm.id, { courtNumber, scheduledTime });
      setData(prev => prev.map(m => m.id === editForm.id ? { ...m, courtNumber, scheduledTime } : m));
      setEditModalOpen(false);
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Gagal"); 
    } finally { setIsSaving(false); }
  }

  async function handleSaveFinish() {
    if (finishForm.status !== "FINISHED" && !finishForm.winnerId) return setError("Pilih pemenang terlebih dahulu");
    setIsSaving(true); setError("");
    try {
      const isTeam = selectedMatch?.matchType === "TEAM" || subMatchForms.length > 0;
      if (isTeam && selectedMatch) {
        let winsA = 0;
        let winsB = 0;

        for (const sub of subMatchForms) {
          if (!sub.id) continue;
          let subWinner = sub.winnerId;
          const validSets = sub.sets.filter(s => s.scoreA > 0 || s.scoreB > 0);
          
          if (validSets.length > 0 || sub.status !== "FINISHED") {
            if (sub.status === "FINISHED") {
              const wonA = validSets.filter(s => s.scoreA > s.scoreB).length;
              const wonB = validSets.filter(s => s.scoreB > s.scoreA).length;
              if (wonA > wonB) {
                subWinner = selectedMatch.teamAId || "";
                winsA++;
              } else if (wonB > wonA) {
                subWinner = selectedMatch.teamBId || "";
                winsB++;
              }
            } else {
              if (subWinner === selectedMatch.teamAId) winsA++;
              if (subWinner === selectedMatch.teamBId) winsB++;
            }

            await finishMatch(sub.id, {
              status: sub.status,
              winnerId: subWinner || undefined,
              sets: validSets,
            });
          } else {
            if (sub.winnerId === selectedMatch.teamAId) winsA++;
            if (sub.winnerId === selectedMatch.teamBId) winsB++;
          }
        }

        let parentWinner = finishForm.winnerId;
        let parentStatus: "FINISHED" | "WALK_OVER" | "RETIRED" | "ONGOING" = finishForm.status;

        if (finishForm.status === "FINISHED") {
          if (winsA >= 3) {
            parentWinner = selectedMatch.teamAId || "";
            parentStatus = "FINISHED";
          } else if (winsB >= 3) {
            parentWinner = selectedMatch.teamBId || "";
            parentStatus = "FINISHED";
          } else {
            parentStatus = "ONGOING";
            parentWinner = "";
          }
        }

        await finishMatch(finishForm.id, {
          status: parentStatus,
          winnerId: parentWinner || undefined,
          sets: [],
        });
      } else {
        await finishMatch(finishForm.id, {
          status: finishForm.status,
          winnerId: finishForm.winnerId,
          sets: finishForm.sets.filter(s => s.scoreA > 0 || s.scoreB > 0),
        });
      }

      await load(false);
      setFinishModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan hasil pertandingan");
    } finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal pertandingan ini?")) return;
    await deleteMatch(id); await load(false);
  }

  async function handleSwapSides() {
    if (!editForm.id) return;
    setIsSaving(true); setError("");
    try {
      const updated = await swapMatchSides(editForm.id);
      setSelectedMatch(updated);
      setData(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menukar posisi peserta");
    } finally { setIsSaving(false); }
  }

  function openEditModal(match: Match) {
    let localTime = "";
    if (match.scheduledTime) {
      const d = new Date(match.scheduledTime);
      const offset = d.getTimezoneOffset() * 60000;
      localTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }
    setSelectedMatch(match);
    setEditForm({ id: match.id, courtNumber: match.courtNumber ? String(match.courtNumber) : "", scheduledTime: localTime });
    setEditModalOpen(true);
  }

  const [isSavingSubMatch, setIsSavingSubMatch] = useState<string | null>(null);

  async function handleSaveSingleSubMatch(subIdx: number) {
    const sub = subMatchForms[subIdx];
    if (!sub || !sub.id || !selectedMatch) return;

    setIsSavingSubMatch(sub.id);
    setError("");
    try {
      let subWinner = sub.winnerId;
      const validSets = sub.sets.filter(s => s.scoreA > 0 || s.scoreB > 0);

      if (sub.status === "FINISHED") {
        const wonA = validSets.filter(s => s.scoreA > s.scoreB).length;
        const wonB = validSets.filter(s => s.scoreB > s.scoreA).length;
        if (wonA > wonB) subWinner = selectedMatch.teamAId || "";
        else if (wonB > wonA) subWinner = selectedMatch.teamBId || "";
        else throw new Error("Skor set seri — tidak dapat menentukan pemenang match.");
      } else {
        if (!subWinner) throw new Error("Pilih pemenang match terlebih dahulu.");
      }

      const updatedChild = await finishMatch(sub.id, {
        status: sub.status,
        winnerId: subWinner || undefined,
        sets: validSets,
      });

      await load(false);
      setSelectedMatch(prev => {
        if (!prev) return null;
        const updatedChildren = (prev.childMatches || []).map(c => c.id === updatedChild.id ? updatedChild : c);
        return { ...prev, childMatches: updatedChildren };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan match");
    } finally {
      setIsSavingSubMatch(null);
    }
  }

  function openFinishModal(match: Match) {
    setSelectedMatch(match);
    setFinishForm({
      id: match.id,
      status: "FINISHED",
      winnerId: match.winnerParticipantId || match.winnerTeamId || "",
      sets: [
        { setNumber: 1, scoreA: match.sets?.[0]?.scoreA ?? 0, scoreB: match.sets?.[0]?.scoreB ?? 0 },
        { setNumber: 2, scoreA: match.sets?.[1]?.scoreA ?? 0, scoreB: match.sets?.[1]?.scoreB ?? 0 },
        { setNumber: 3, scoreA: match.sets?.[2]?.scoreA ?? 0, scoreB: match.sets?.[2]?.scoreB ?? 0 },
      ]
    });

    const isTeam = match.matchType === "TEAM" || (match.childMatches && match.childMatches.length > 0);
    if (isTeam) {
      const slots = ["TUNGGAL_PUTRA", "TUNGGAL_PUTRI", "GANDA_PUTRA", "GANDA_PUTRI", "TRIPLE_MIX"];
      const labels: Record<string, string> = {
        TUNGGAL_PUTRA: "Match 1: Tunggal Putra (TPA)",
        TUNGGAL_PUTRI: "Match 2: Tunggal Putri (TPI)",
        GANDA_PUTRA: "Match 3: Ganda Putra (GPA)",
        GANDA_PUTRI: "Match 4: Ganda Putri (GPI)",
        TRIPLE_MIX: "Match 5: Triple Mix",
      };
      const initialSubMatches = slots.map(slot => {
        const cm = match.childMatches?.find(c => c.slotType === slot);
        const s = cm?.status;
        const subStatus = (s === "WALK_OVER" || s === "RETIRED") ? s : "FINISHED";
        return {
          id: cm?.id,
          slotType: slot,
          label: labels[slot] || slot,
          status: subStatus as "FINISHED" | "WALK_OVER" | "RETIRED",
          winnerId: cm?.winnerTeamId || "",
          sets: [0, 1, 2].map(i => {
            const s = cm?.sets?.find(x => x.setNumber === i + 1);
            return { setNumber: i + 1, scoreA: s?.scoreA ?? 0, scoreB: s?.scoreB ?? 0 };
          })
        };
      });
      setSubMatchForms(initialSubMatches);
    } else {
      setSubMatchForms([]);
    }

    setFinishModalOpen(true);
  }

  const isCompleteMatch = (m: Match) =>
    !!(m.participantA || m.teamA) && !!(m.participantB || m.teamB);

  const filteredData = data.filter(d => {
    if (filterParticipant === "COMPLETE" && !isCompleteMatch(d)) return false;
    if (filterParticipant === "INCOMPLETE" && isCompleteMatch(d)) return false;
    if (filterDiscipline && d.disciplineId !== filterDiscipline) return false;
    if (filterLevel && !filterDiscipline) {
      const disc = DISCIPLINES.find(x => x.id === d.disciplineId);
      if (disc?.level !== filterLevel) return false;
    }
    if (filterDate && d.scheduledTime) {
      const dDate = new Date(d.scheduledTime);
      const matchDate = new Date(dDate.getTime() - dDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      if (matchDate !== filterDate) return false;
    }
    return true;
  }).sort((a, b) => {
    if (!a.scheduledTime && !b.scheduledTime) return 0;
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
  });

  return (
    <div>
      <PageHeader title="Match & Jadwal" subtitle="Kelola jadwal lapangan dan input skor akhir pertandingan" />

      {/* Filter */}
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {["", "SCHEDULED", "FINISHED", "RETIRED", "WALK_OVER"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
              style={filterStatus === s 
                ? { background: "#6C47D1", borderColor: "#6C47D1", color: "#fff" } 
                : { background: "#fff", borderColor: "#E5E7EB", color: "#374151" }}>
              {s || "Semua Status"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <div className="w-44">
            <DashSelect value={filterParticipant} onChange={setFilterParticipant} placeholder="Semua Peserta"
              options={[
                { value: "COMPLETE", label: "Peserta Lengkap" },
                { value: "INCOMPLETE", label: "Peserta Belum Lengkap" },
              ]} />
          </div>
          <div className="w-40">
            <DashInput type="date" value={filterDate} onChange={setFilterDate} placeholder="Filter Tanggal" />
          </div>
          <div className="w-40">
            <DashSelect value={filterLevel} onChange={(v) => { setFilterLevel(v); setFilterDiscipline(""); }} placeholder="Semua Tingkat" options={LEVELS} />
          </div>
          <div className="w-56">
            <DashSelect value={filterDiscipline} onChange={setFilterDiscipline} placeholder="Semua Kategori"
              options={(filterLevel ? getDisciplinesByLevel(filterLevel) : DISCIPLINES).map(d => ({ value: d.id, label: d.name }))} />
          </div>
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        data={filteredData}
        emptyText="Tidak ada match ditemukan"
        columns={[
          { key: "status", header: "Status", render: (row) => {
            const s = STATUS_STYLE[row.status as MatchStatus | "WALK_OVER"] || { bg: "#eee", color: "#333" };
            return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{row.status}</span>;
          }},
          { key: "roundName", header: "Babak" },
          { key: "groupName", header: "Grup", render: (row) => row.groupName ?? "-" },
          { key: "courtNumber", header: "Lapangan", render: (row) => row.courtNumber ? `Lap. ${row.courtNumber}` : "-" },
          { key: "scheduledTime", header: "Jadwal", render: (row) => row.scheduledTime ? new Date(row.scheduledTime).toLocaleString("id-ID") : "-" },
          { key: "discipline", header: "Kategori", getSearchValue: (row: any) => row.discipline?.name ?? "", render: (row: any) => row.discipline?.name ?? "—" },
          { key: "participantA", header: "Peserta A", 
            getSearchValue: (row: any) => {
              const athletes = row.participantA?.athletes?.map((a:any) => a.athlete.name).join(" ") || "";
              const instName = row.participantA?.institution?.name ?? row.teamA?.institution?.name ?? "";
              return `${athletes} ${instName}`;
            },
            render: (row: any) => {
              const isIndividu = row.participantA;
              const athletes = isIndividu ? row.participantA?.athletes?.map((a:any) => a.athlete.name).filter(Boolean).join(" - ") : null;
              const instName = row.participantA?.institution?.name ?? row.teamA?.institution?.name ?? "—";
              if (isIndividu && athletes) return <div className="flex flex-col"><span className="font-semibold">{athletes}</span><span className="text-xs text-gray-500">{instName}</span></div>;
              return instName;
            }
          },
          { key: "participantB", header: "Peserta B", 
            getSearchValue: (row: any) => {
              const athletes = row.participantB?.athletes?.map((a:any) => a.athlete.name).join(" ") || "";
              const instName = row.participantB?.institution?.name ?? row.teamB?.institution?.name ?? "";
              return `${athletes} ${instName}`;
            },
            render: (row: any) => {
              const isIndividu = row.participantB;
              const athletes = isIndividu ? row.participantB?.athletes?.map((a:any) => a.athlete.name).filter(Boolean).join(" - ") : null;
              const instName = row.participantB?.institution?.name ?? row.teamB?.institution?.name ?? "—";
              if (isIndividu && athletes) return <div className="flex flex-col"><span className="font-semibold">{athletes}</span><span className="text-xs text-gray-500">{instName}</span></div>;
              return instName;
            }
          },
        ]}
        actions={(row) => {
          const hasBothParticipants = (row.participantA || row.teamA) && (row.participantB || row.teamB);
          
          return (
          <div className="flex gap-2">
            {(row.status === "SCHEDULED" || row.status === "ONGOING") && hasBothParticipants && (
              <button onClick={() => openFinishModal(row)} className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90" style={{ background: "#6C47D1" }}>
                <CheckCircle size={12} /> {row.status === "ONGOING" ? "Lanjut Input Hasil" : "Input Hasil"}
              </button>
            )}
            <button onClick={() => openEditModal(row)} className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition">Edit</button>
            <button onClick={() => handleDelete(row.id)} className="rounded-lg px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition">Hapus</button>
          </div>
          );
        }}
      />

      <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setError(""); }} title="Edit Jadwal & Lapangan" size="md"
        footer={<><ModalCancelButton onClick={() => { setEditModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleSaveEdit} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        <div className="grid grid-cols-1 gap-4">
          <FormField label="No. Lapangan"><DashInput value={editForm.courtNumber} onChange={(v) => setEditForm(f => ({ ...f, courtNumber: v }))} placeholder="1" type="number" /></FormField>
          <FormField label="Jadwal (tanggal & waktu)"><DashInput value={editForm.scheduledTime} onChange={(v) => setEditForm(f => ({ ...f, scheduledTime: v }))} type="datetime-local" /></FormField>
        </div>

        {selectedMatch && selectedMatch.id === editForm.id && !["FINISHED", "RETIRED", "WALK_OVER"].includes(selectedMatch.status) && (() => {
          const nameA = selectedMatch.participantA
            ? (selectedMatch.participantA.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantA.institution?.name || "Peserta A")
            : (selectedMatch.teamA?.institution?.name || (selectedMatch.participantAId || selectedMatch.teamAId ? "Tim A" : "BYE / Kosong"));
          const nameB = selectedMatch.participantB
            ? (selectedMatch.participantB.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantB.institution?.name || "Peserta B")
            : (selectedMatch.teamB?.institution?.name || (selectedMatch.participantBId || selectedMatch.teamBId ? "Tim B" : "BYE / Kosong"));
          return (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Tukar Posisi Peserta</h4>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Posisi A</p>
                  <p className="truncate text-sm font-semibold text-gray-800">{nameA}</p>
                </div>
                <button onClick={handleSwapSides} disabled={isSaving}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#6C47D1" }}
                  title="Tukar posisi A dan B">
                  <ArrowLeftRight size={14} /> Tukar
                </button>
                <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Posisi B</p>
                  <p className="truncate text-sm font-semibold text-gray-800">{nameB}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">*Hanya menukar posisi A ↔ B, tidak mengubah peserta.</p>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={finishModalOpen}
        onClose={() => { setFinishModalOpen(false); setError(""); }}
        title="Input Hasil Pertandingan"
        size="lg"
        footer={
          subMatchForms.length > 0 && finishForm.status === "FINISHED" ? (
            <button
              type="button"
              onClick={() => { setFinishModalOpen(false); setError(""); }}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Tutup
            </button>
          ) : (
            <>
              <ModalCancelButton onClick={() => { setFinishModalOpen(false); setError(""); }} />
              <ModalSubmitButton onClick={handleSaveFinish} isLoading={isSaving} label="Simpan Hasil" />
            </>
          )
        }>
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        
        {selectedMatch && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Status Pertandingan">
                <DashSelect
                  value={finishForm.status}
                  onChange={(v) => setFinishForm(f => ({ ...f, status: v as any }))}
                  options={[
                    { value: "FINISHED", label: "Selesai Normal (FINISHED)" },
                    { value: "WALK_OVER", label: "Walk Over (WO)" },
                    { value: "RETIRED", label: "Mundur/Cedera (RETIRED)" },
                  ]}
                />
              </FormField>
              {finishForm.status !== "FINISHED" && selectedMatch && (() => {
                // Build display names for A and B
                const nameA = selectedMatch.participantA
                  ? (selectedMatch.participantA.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantA.institution?.name || "Peserta A")
                  : (selectedMatch.teamA?.institution?.name || "Tim A");
                const nameB = selectedMatch.participantB
                  ? (selectedMatch.participantB.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantB.institution?.name || "Peserta B")
                  : (selectedMatch.teamB?.institution?.name || "Tim B");
                const idA = (selectedMatch.participantAId || selectedMatch.teamAId) as string;
                const idB = (selectedMatch.participantBId || selectedMatch.teamBId) as string;
                return (
                  <FormField label="Pemenang Pertandingan">
                    <DashSelect
                      value={finishForm.winnerId}
                      onChange={(v) => setFinishForm(f => ({ ...f, winnerId: v }))}
                      options={[
                        { value: idA, label: nameA },
                        { value: idB, label: nameB },
                      ]}
                      placeholder="Pilih Pemenang..."
                    />
                  </FormField>
                );
              })()}
            </div>

            {finishForm.status === "FINISHED" && (
              <div className="flex flex-col gap-4">
                {(() => {
                  const nameA = selectedMatch.participantA
                    ? (selectedMatch.participantA.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantA.institution?.name || "Peserta A")
                    : (selectedMatch.teamA?.institution?.name || "Tim A");
                  const instA = selectedMatch.participantA?.institution?.name ?? "";
                  const nameB = selectedMatch.participantB
                    ? (selectedMatch.participantB.athletes?.map((a: any) => a.athlete.name).filter(Boolean).join(" / ") || selectedMatch.participantB.institution?.name || "Peserta B")
                    : (selectedMatch.teamB?.institution?.name || "Tim B");
                  const instB = selectedMatch.participantB?.institution?.name ?? "";

                  return (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <div className="min-w-0 flex-1 text-center">
                        <p className="truncate text-sm font-bold text-gray-900">{nameA}</p>
                        {instA && <p className="truncate text-xs text-gray-500">{instA}</p>}
                      </div>
                      <span className="text-xs font-bold text-purple-600 uppercase tracking-widest px-2">VS</span>
                      <div className="min-w-0 flex-1 text-center">
                        <p className="truncate text-sm font-bold text-gray-900">{nameB}</p>
                        {instB && <p className="truncate text-xs text-gray-500">{instB}</p>}
                      </div>
                    </div>
                  );
                })()}

                {subMatchForms.length > 0 ? (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1" data-lenis-prevent>
                    {subMatchForms.map((sub, subIdx) => {
                      const idA = selectedMatch.teamAId || "";
                      const idB = selectedMatch.teamBId || "";
                      const nameA = selectedMatch.teamA?.institution?.name || "Tim A";
                      const nameB = selectedMatch.teamB?.institution?.name || "Tim B";
                      const isSavingThis = isSavingSubMatch === sub.id;

                      return (
                        <div key={sub.slotType} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                            <h5 className="text-xs font-bold text-[#6C47D1] uppercase tracking-wider">{sub.label}</h5>
                            
                            <div className="flex items-center gap-2">
                              <select
                                value={sub.status}
                                onChange={(e) => {
                                  const nextSub = [...subMatchForms];
                                  nextSub[subIdx].status = e.target.value as any;
                                  setSubMatchForms(nextSub);
                                }}
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none"
                              >
                                <option value="FINISHED">Selesai Normal</option>
                                <option value="WALK_OVER">Walk Over (WO)</option>
                                <option value="RETIRED">Retired (Mundur)</option>
                              </select>

                              {sub.id && (
                                <button
                                  type="button"
                                  disabled={isSavingThis}
                                  onClick={() => handleSaveSingleSubMatch(subIdx)}
                                  className="rounded-md bg-[#6C47D1] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#5b3cae] disabled:opacity-50"
                                >
                                  {isSavingThis ? "Menyimpan..." : "Simpan Match"}
                                </button>
                              )}
                            </div>
                          </div>

                          {sub.status !== "FINISHED" ? (
                            <div className="mt-2">
                              <label className="block text-xs font-bold text-gray-600 mb-1">Pemenang Submatch</label>
                              <DashSelect
                                value={sub.winnerId}
                                onChange={(v) => {
                                  const nextSub = [...subMatchForms];
                                  nextSub[subIdx].winnerId = v;
                                  setSubMatchForms(nextSub);
                                }}
                                options={[
                                  { value: idA, label: nameA },
                                  { value: idB, label: nameB },
                                ]}
                                placeholder="Pilih Pemenang Submatch..."
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {[0, 1, 2].map((sIdx) => (
                                <div key={sIdx} className="flex items-center gap-3">
                                  <span className="w-12 text-xs font-medium text-gray-600">Set {sIdx + 1}</span>
                                  <DashInput
                                    type="number"
                                    placeholder="Skor A"
                                    value={String(sub.sets[sIdx]?.scoreA ?? 0)}
                                    onChange={(v) => {
                                      const nextSub = [...subMatchForms];
                                      nextSub[subIdx].sets[sIdx].scoreA = parseInt(v) || 0;
                                      setSubMatchForms(nextSub);
                                    }}
                                  />
                                  <span className="text-gray-400">-</span>
                                  <DashInput
                                    type="number"
                                    placeholder="Skor B"
                                    value={String(sub.sets[sIdx]?.scoreB ?? 0)}
                                    onChange={(v) => {
                                      const nextSub = [...subMatchForms];
                                      nextSub[subIdx].sets[sIdx].scoreB = parseInt(v) || 0;
                                      setSubMatchForms(nextSub);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-xs text-gray-500">*Klik "Simpan Match" pada masing-masing match setelah skor diisi.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">Skor Akhir (Per Set)</h4>
                    <div className="flex flex-col gap-3">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium text-gray-600">Set {idx + 1}</span>
                          <DashInput
                            type="number"
                            placeholder="Skor A"
                            value={String(finishForm.sets[idx]?.scoreA ?? 0)}
                            onChange={(v) => {
                              const newSets = [...finishForm.sets];
                              if (!newSets[idx]) newSets[idx] = { setNumber: idx + 1, scoreA: 0, scoreB: 0 };
                              newSets[idx].scoreA = parseInt(v) || 0;
                              setFinishForm({ ...finishForm, sets: newSets });
                            }}
                          />
                          <span className="text-gray-400">-</span>
                          <DashInput
                            type="number"
                            placeholder="Skor B"
                            value={String(finishForm.sets[idx]?.scoreB ?? 0)}
                            onChange={(v) => {
                              const newSets = [...finishForm.sets];
                              if (!newSets[idx]) newSets[idx] = { setNumber: idx + 1, scoreA: 0, scoreB: 0 };
                              newSets[idx].scoreB = parseInt(v) || 0;
                              setFinishForm({ ...finishForm, sets: newSets });
                            }}
                          />
                        </div>
                      ))}
                      <p className="mt-2 text-xs text-gray-500">*Kosongkan skor 0 - 0 pada Set 3 jika tidak dimainkan (Straight Game).</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
