"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { PageHeader, FormField, DashInput, AddButton } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getStandings, getTeams, setupGroupStandings, resetGroupStandings } from "@/lib/api/admin";
import { getMatches, generateGroupMatches } from "@/lib/api/matches";
import { DISCIPLINES } from "@/lib/constants";
import type { Standing, Team, Match } from "@/lib/types";
import { BarChart2, Play, Trash2 } from "lucide-react";

export function GrupSection() {
  const teamDisciplines = useMemo(() => DISCIPLINES.filter(d => d.isTeamEvent), []);
  const initialDisc = teamDisciplines.length > 0 ? teamDisciplines[0].id : "";
  const [selectedDisc, setSelectedDisc] = useState(initialDisc);
  
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Group Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formGroupName, setFormGroupName] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [generatingGroup, setGeneratingGroup] = useState<string | null>(null);

  // Reset Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Generate Match Modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [groupToGenerate, setGroupToGenerate] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const groupedStandings = useMemo(() => {
    return standings.reduce((acc, curr) => {
      const g = curr.groupName || "Tanpa Grup";
      if (!acc[g]) acc[g] = [];
      acc[g].push(curr);
      return acc;
    }, {} as Record<string, Standing[]>);
  }, [standings]);

  const sortedGroupNames = Object.keys(groupedStandings).sort();

  const load = useCallback(async (showSpinner = true) => {
    if (!selectedDisc) {
      setStandings([]);
      setTeams([]);
      setMatches([]);
      return;
    }
    if (showSpinner) setIsLoading(true);
    try {
      const [sRes, tRes, mRes] = await Promise.all([
        getStandings(selectedDisc),
        getTeams(selectedDisc),
        getMatches({ disciplineId: selectedDisc, stage: "GROUP" })
      ]);
      setStandings(sRes || []);
      setTeams(tRes || []);
      setMatches(mRes || []);
    } catch (e) {
      console.error(e);
    } finally { 
      if (showSpinner) setIsLoading(false); 
    }
  }, [selectedDisc]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateGroup() {
    const trimmedGroupName = formGroupName.trim().toUpperCase();
    if (!trimmedGroupName || selectedTeamIds.length === 0) {
      setError("Nama grup dan minimal 1 tim harus dipilih.");
      return;
    }
    if (sortedGroupNames.includes(trimmedGroupName)) {
      setError(`Grup ${trimmedGroupName} sudah ada. Silakan pilih nama grup lain.`);
      return;
    }

    setIsSaving(true); setError("");
    try {
      await setupGroupStandings({
        disciplineId: selectedDisc,
        groupName: trimmedGroupName,
        teamIds: selectedTeamIds
      });
      setModalOpen(false);
      setFormGroupName("");
      setSelectedTeamIds([]);
      await load(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan grup");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmGenerateMatches() {
    setGeneratingGroup(groupToGenerate);
    setGenerateError("");
    setGenerateSuccess(false);
    try {
      await generateGroupMatches({ disciplineId: selectedDisc, groupName: groupToGenerate });
      setGenerateSuccess(true);
      await load(false);
      setTimeout(() => {
        setGenerateModalOpen(false);
        setGenerateSuccess(false);
      }, 1500);
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Gagal generate matches");
    } finally {
      setGeneratingGroup(null);
    }
  }

  async function handleResetGroup() {
    setIsResetting(true); setResetError(""); setResetSuccess(false);
    try {
      await resetGroupStandings(selectedDisc);
      setResetSuccess(true);
      await load(false);
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(false);
      }, 1500);
    } catch (e) {
      setResetError(e instanceof Error ? e.message : "Gagal mereset grup");
    } finally {
      setIsResetting(false);
    }
  }

  // Cari tim yang belum ada di grup mana pun
  const availableTeams = teams.filter(t => !standings.some(s => s.teamId === t.id));

  // Tombol reset nonaktif jika sudah ada pertandingan sama sekali
  const isResetDisabled = matches.length > 0;

  return (
    <div>
      <PageHeader 
        title="Grup & Klasemen" 
        subtitle={`Kategori: ${teamDisciplines.find(d => d.id === selectedDisc)?.name || "Beregu Universitas"}`} 
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setResetModalOpen(true)}
              disabled={isResetDisabled || standings.length === 0}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold border transition disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Reset Grup
            </button>
            <AddButton onClick={() => setModalOpen(true)} label="Buat Grup Baru" />
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : !selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <BarChart2 className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Pilih kategori beregu terlebih dahulu</p>
        </div>
      ) : standings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <BarChart2 className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Belum ada grup yang dibuat</p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Klik Buat Grup Baru untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {sortedGroupNames.map(gName => {
            const hasMatches = matches.some(m => m.groupName === gName);
            const isGenerating = generatingGroup === gName;

            return (
              <div key={gName} className="rounded-lg border bg-white overflow-hidden shadow-sm" style={{ borderColor: "#E5E7EB" }}>
                <div className="bg-gray-50 px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="font-bold text-gray-800 text-lg">Grup {gName}</h3>
                  <button
                    disabled={hasMatches || isGenerating || groupedStandings[gName].length < 2}
                    onClick={() => { setGroupToGenerate(gName); setGenerateModalOpen(true); }}
                    className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: hasMatches ? "#10B981" : "#6C47D1" }}
                  >
                    <Play size={14} />
                    {hasMatches ? "Match Ter-generate" : isGenerating ? "Memproses..." : "Generate Match"}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["#", "Tim", "Main", "Menang", "Kalah", "Selisih Partai", "Selisih Set", "Selisih Poin"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#374151" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStandings[gName].map((s, i) => (
                        <tr key={s.id} className="transition-colors" style={{ borderTop: "1px solid #F3F4F6" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td className="px-4 py-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                              style={i === 0 ? { background: "#EDE9FE", color: "#6C47D1" } : { background: "#F3F4F6", color: "#6B7280" }}>
                              {s.rank || i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {s.team?.institution?.name ?? s.participant?.institution?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{s.played}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">{s.won}</td>
                          <td className="px-4 py-3 text-red-600">{s.lost}</td>
                          <td className="px-4 py-3 text-gray-700">{s.gameWon - s.gameLost >= 0 ? "+" : ""}{s.gameWon - s.gameLost}</td>
                          <td className="px-4 py-3 text-gray-700">{s.setWon - s.setLost >= 0 ? "+" : ""}{s.setWon - s.setLost}</td>
                          <td className="px-4 py-3 text-gray-700">{s.pointWon - s.pointLost >= 0 ? "+" : ""}{s.pointWon - s.pointLost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Grup */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(""); }} title="Buat Grup Baru" size="md"
        footer={<><ModalCancelButton onClick={() => { setModalOpen(false); setError(""); }} /><ModalSubmitButton onClick={handleCreateGroup} isLoading={isSaving} /></>}>
        {error && <p className="mb-4 rounded-xl p-3 text-sm bg-red-50 text-red-600 border border-red-200">{error}</p>}
        
        <div className="space-y-4">
          <FormField label="Nama Grup (Misal: A, B, C)" required>
            <DashInput 
              value={formGroupName} 
              onChange={setFormGroupName} 
              placeholder="Contoh: A" 
            />
          </FormField>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Pilih Tim (Belum Masuk Grup)
            </label>
            {availableTeams.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Semua tim sudah dimasukkan ke grup atau tidak ada tim.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2 bg-white">
                {availableTeams.map(t => (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-400 w-4 h-4 text-purple-600 focus:ring-purple-500"
                      checked={selectedTeamIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTeamIds(prev => [...prev, t.id]);
                        else setSelectedTeamIds(prev => prev.filter(id => id !== t.id));
                      }}
                    />
                    <span className="text-sm font-semibold text-gray-900">{t.institution?.name || "Tim Tanpa Nama"}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Reset Grup */}
      <Modal isOpen={resetModalOpen} onClose={() => { setResetModalOpen(false); setResetError(""); setResetSuccess(false); }} title="Konfirmasi Reset Grup" size="sm"
        footer={
          !resetSuccess ? (
            <>
              <ModalCancelButton onClick={() => { setResetModalOpen(false); setResetError(""); }} />
              <button
                onClick={handleResetGroup}
                disabled={isResetting}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600"
              >
                {isResetting ? "Mereset..." : "Ya, Reset Semua Grup"}
              </button>
            </>
          ) : <div />
        }>
        {resetError && <p className="mb-4 rounded-xl p-3 text-sm bg-red-50 text-red-600 border border-red-200">{resetError}</p>}
        {resetSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <p className="font-bold text-gray-800">Berhasil Direset!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Apakah Anda yakin ingin menghapus <strong>seluruh data grup</strong> untuk kategori beregu ini?
            </p>
            <p className="text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-lg border border-red-100">
              Tindakan ini tidak dapat dibatalkan. Data tim akan kembali ke status "Belum masuk grup".
            </p>
          </div>
        )}
      </Modal>

      {/* Modal Generate Matches */}
      <Modal isOpen={generateModalOpen} onClose={() => { setGenerateModalOpen(false); setGenerateError(""); setGenerateSuccess(false); }} title={`Generate Match Grup ${groupToGenerate}`} size="sm"
        footer={
          !generateSuccess ? (
            <>
              <ModalCancelButton onClick={() => { setGenerateModalOpen(false); setGenerateError(""); }} />
              <ModalSubmitButton onClick={confirmGenerateMatches} isLoading={generatingGroup === groupToGenerate} label="Ya, Generate" />
            </>
          ) : <div />
        }>
        {generateError && <p className="mb-4 rounded-xl p-3 text-sm bg-red-50 text-red-600 border border-red-200">{generateError}</p>}
        {generateSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <p className="font-bold text-gray-800">Pertandingan Berhasil Digenerate!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Apakah Anda yakin ingin membuat jadwal pertandingan (sistem round-robin) untuk <strong>Grup {groupToGenerate}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Setiap tim di dalam grup ini akan bertanding melawan semua tim lainnya.
            </p>
          </div>
        )}
      </Modal>

    </div>
  );
}
