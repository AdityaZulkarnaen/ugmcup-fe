"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { PageHeader, FormField, DashSelect, DashInput, AddButton } from "@/components/dashboard/PageHeader";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/dashboard/Modal";
import { getStandings, getTeams, setupGroupStandings } from "@/lib/api/admin";
import { getMatches, generateGroupMatches } from "@/lib/api/matches";
import { DISCIPLINES } from "@/lib/constants";
import type { Standing, Team, Match } from "@/lib/types";
import { BarChart2, Play } from "lucide-react";

export function GrupSection() {
  const [selectedDisc, setSelectedDisc] = useState("");
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

  const teamDisciplines = useMemo(() => DISCIPLINES.filter(d => d.isTeamEvent), []);

  const groupedStandings = useMemo(() => {
    return standings.reduce((acc, curr) => {
      const g = curr.groupName || "Tanpa Grup";
      if (!acc[g]) acc[g] = [];
      acc[g].push(curr);
      return acc;
    }, {} as Record<string, Standing[]>);
  }, [standings]);

  const sortedGroupNames = Object.keys(groupedStandings).sort();

  const load = useCallback(async () => {
    if (!selectedDisc) {
      setStandings([]);
      setTeams([]);
      setMatches([]);
      return;
    }
    setIsLoading(true);
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
    } finally { setIsLoading(false); }
  }, [selectedDisc]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateGroup() {
    if (!formGroupName.trim() || selectedTeamIds.length === 0) {
      setError("Nama grup dan minimal 1 tim harus dipilih.");
      return;
    }
    setIsSaving(true); setError("");
    try {
      await setupGroupStandings({
        disciplineId: selectedDisc,
        groupName: formGroupName.toUpperCase(),
        teamIds: selectedTeamIds
      });
      setModalOpen(false);
      setFormGroupName("");
      setSelectedTeamIds([]);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan grup");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateMatches(gName: string) {
    if (!confirm(`Generate match round-robin untuk Grup ${gName}?`)) return;
    setGeneratingGroup(gName);
    try {
      await generateGroupMatches({ disciplineId: selectedDisc, groupName: gName });
      alert("Pertandingan grup berhasil di-generate!");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal generate matches");
    } finally {
      setGeneratingGroup(null);
    }
  }

  // Cari tim yang belum ada di grup mana pun
  const availableTeams = teams.filter(t => !standings.some(s => s.teamId === t.id));

  return (
    <div>
      <PageHeader 
        title="Grup & Klasemen" 
        subtitle="Kelola grup dan klasemen untuk kategori beregu" 
        action={selectedDisc ? <AddButton onClick={() => setModalOpen(true)} label="Buat Grup Baru" /> : undefined}
      />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Kategori Beregu">
          <DashSelect 
            value={selectedDisc} 
            onChange={setSelectedDisc}
            placeholder="Pilih kategori beregu..."
            options={teamDisciplines.map(d => ({ value: d.id, label: d.name }))} 
          />
        </FormField>
      </div>

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
        <div className="space-y-8">
          {sortedGroupNames.map(gName => {
            const hasMatches = matches.some(m => m.groupName === gName);
            const isGenerating = generatingGroup === gName;

            return (
              <div key={gName} className="rounded-lg border bg-white overflow-hidden shadow-sm" style={{ borderColor: "#E5E7EB" }}>
                <div className="bg-gray-50 px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="font-bold text-gray-800 text-lg">Grup {gName}</h3>
                  <button
                    disabled={hasMatches || isGenerating || groupedStandings[gName].length < 2}
                    onClick={() => handleGenerateMatches(gName)}
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
                          <td className="px-4 py-3 font-semibold" style={{ color: "#111827" }}>
                            {s.team?.institution?.name ?? s.participant?.institution?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#374151" }}>{s.played}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: "#059669" }}>{s.won}</td>
                          <td className="px-4 py-3" style={{ color: "#DC2626" }}>{s.lost}</td>
                          <td className="px-4 py-3" style={{ color: "#374151" }}>{s.gameWon - s.gameLost >= 0 ? "+" : ""}{s.gameWon - s.gameLost}</td>
                          <td className="px-4 py-3" style={{ color: "#374151" }}>{s.setWon - s.setLost >= 0 ? "+" : ""}{s.setWon - s.setLost}</td>
                          <td className="px-4 py-3" style={{ color: "#374151" }}>{s.pointWon - s.pointLost >= 0 ? "+" : ""}{s.pointWon - s.pointLost}</td>
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
        {error && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}
        
        <div className="space-y-4">
          <FormField label="Nama Grup (Misal: A, B, C)" required>
            <DashInput 
              value={formGroupName} 
              onChange={setFormGroupName} 
              placeholder="Contoh: A" 
            />
          </FormField>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
              Pilih Tim (Belum Masuk Grup)
            </label>
            {availableTeams.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Semua tim sudah dimasukkan ke grup atau tidak ada tim.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                {availableTeams.map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedTeamIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTeamIds(prev => [...prev, t.id]);
                        else setSelectedTeamIds(prev => prev.filter(id => id !== t.id));
                      }}
                    />
                    <span className="text-sm font-medium">{t.institution?.name || "Tim Tanpa Nama"}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
}
