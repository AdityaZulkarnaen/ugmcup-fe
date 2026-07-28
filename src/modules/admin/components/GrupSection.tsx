"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader, FormField, DashSelect } from "@/components/dashboard/PageHeader";
import { getStandings } from "@/lib/api/admin";
import { LEVELS, getDisciplinesByLevel, DISCIPLINES } from "@/lib/constants";
import type { Standing } from "@/lib/types";
import { BarChart2 } from "lucide-react";

export function GrupSection() {
  const [selectedDisc, setSelectedDisc] = useState("");
  const [groupName, setGroupName] = useState("");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const groupedStandings = groupName
    ? { [groupName]: standings.filter(s => s.groupName === groupName) }
    : standings.reduce((acc, curr) => {
      const g = curr.groupName || "Tanpa Grup";
      if (!acc[g]) acc[g] = [];
      acc[g].push(curr);
      return acc;
    }, {} as Record<string, Standing[]>);

  const sortedGroupNames = Object.keys(groupedStandings).sort();


  const load = useCallback(async () => {
    if (!selectedDisc) return;
    setIsLoading(true);
    try {
      setStandings(await getStandings(selectedDisc));
    } catch (e) {
      console.error(e);
    } finally { setIsLoading(false); }
  }, [selectedDisc]);


  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="Grup & Klasemen" subtitle="Lihat klasemen berdasarkan aturan PBSI per cabang dan grup" />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <FormField label="Filter grup">
          <DashSelect value={groupName} onChange={setGroupName}
            placeholder="Semua grup"
            options={[...new Set(standings.map(s => s.groupName))].map(g => ({ value: g, label: g }))} />
        </FormField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} /></div>
      ) : standings.length === 0 && selectedDisc ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-lg border bg-white" style={{ borderColor: "#E5E7EB" }}>
          <BarChart2 className="mb-4 h-12 w-12 text-gray-400" />
          <p className="font-semibold" style={{ color: "#374151" }}>Belum ada data klasemen</p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Klasemen akan muncul setelah match grup berlangsung.</p>
        </div>
      ) : standings.length > 0 ? (
        <div className="space-y-8">
          {sortedGroupNames.map(gName => (
            <div key={gName} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
              <div className="bg-gray-50 px-5 py-3 border-b" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-bold text-gray-800">Grup {gName}</h3>
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
          ))}
        </div>
      ) : null}
    </div>
  );
}
