"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { getDisciplines, getStandings } from "@/lib/api/admin";
import type { Discipline, Standing } from "@/lib/types";

export function GrupSection() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisc, setSelectedDisc] = useState("");
  const [groupName, setGroupName] = useState("");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getDisciplines().then(setDisciplines).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selectedDisc) return;
    setIsLoading(true);
    try {
      setStandings(await getStandings(selectedDisc, groupName || undefined));
    } finally { setIsLoading(false); }
  }, [selectedDisc, groupName]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="Grup & Klasemen" subtitle="Lihat klasemen berdasarkan aturan PBSI per cabang dan grup" />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <FormField label="Cabang">
          <DashSelect value={selectedDisc} onChange={(v) => { setSelectedDisc(v); setGroupName(""); }}
            placeholder="Pilih cabang"
            options={disciplines.map(d => ({ value: d.id, label: d.name }))} />
        </FormField>
        <FormField label="Nama Grup (opsional)">
          <DashSelect value={groupName} onChange={setGroupName}
            placeholder="Semua grup"
            options={[...new Set(standings.map(s => s.groupName))].map(g => ({ value: g, label: g }))} />
        </FormField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} /></div>
      ) : standings.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
          <p className="text-4xl mb-4">📊</p>
          <p className="text-white font-semibold">Belum ada data klasemen</p>
          <p className="text-sm mt-1" style={{ color: "#9D9DB6" }}>Klasemen akan muncul setelah match grup berlangsung.</p>
        </div>
      ) : standings.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["#", "Tim/Peserta", "Grup", "Main", "Menang", "Kalah", "Selisih Partai", "Selisih Set", "Selisih Poin"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#9D9DB6" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.id} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <td className="px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={i === 0 ? { background: "rgba(102,255,180,0.2)", color: "#66FFB4" } : { color: "#9D9DB6" }}>
                      {s.rank || i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {s.team?.institution?.name ?? s.participant?.institution?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-white/70">{s.groupName}</td>
                  <td className="px-4 py-3 text-white/90">{s.played}</td>
                  <td className="px-4 py-3" style={{ color: "#66FFB4" }}>{s.won}</td>
                  <td className="px-4 py-3" style={{ color: "#f87171" }}>{s.lost}</td>
                  <td className="px-4 py-3 text-white/90">{s.gameWon - s.gameLost >= 0 ? "+" : ""}{s.gameWon - s.gameLost}</td>
                  <td className="px-4 py-3 text-white/90">{s.setWon - s.setLost >= 0 ? "+" : ""}{s.setWon - s.setLost}</td>
                  <td className="px-4 py-3 text-white/90">{s.pointWon - s.pointLost >= 0 ? "+" : ""}{s.pointWon - s.pointLost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
