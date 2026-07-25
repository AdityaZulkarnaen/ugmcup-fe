"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getMatches, getMatch, updateScore, finishMatch } from "@/lib/api/matches";
import { useMatchRoom } from "@/lib/hooks/useSocket";
import type { Match, MatchSet } from "@/lib/types";

function ScoreInputCard({ match, onRefresh }: { match: Match; onRefresh: () => void }) {
  const { isConnected, lastScore, isFinished: socketFinished } = useMatchRoom(match.id);
  const [sets, setSets] = useState<MatchSet[]>(match.sets ?? []);
  const [version, setVersion] = useState(match.version);
  const [finishing, setFinishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Apply realtime score update dari WebSocket
  useEffect(() => {
    if (!lastScore) return;
    setSets(prev => {
      const existing = prev.find(s => s.setNumber === lastScore.setNumber);
      if (existing) {
        return prev.map(s => s.setNumber === lastScore.setNumber ? { ...s, scoreA: lastScore.scoreA, scoreB: lastScore.scoreB } : s);
      }
      return [...prev, { id: `ws-${lastScore.setNumber}`, matchId: match.id, setNumber: lastScore.setNumber, scoreA: lastScore.scoreA, scoreB: lastScore.scoreB, isFinished: false }];
    });
  }, [lastScore, match.id]);

  // Re-fetch setelah match_finished dari WebSocket
  useEffect(() => { if (socketFinished) onRefresh(); }, [socketFinished, onRefresh]);

  async function handleScoreChange(setNumber: number, field: "scoreA" | "scoreB", value: number) {
    setSaving(true); setError("");
    const targetSet = sets.find(s => s.setNumber === setNumber);
    const newScoreA = field === "scoreA" ? value : (targetSet?.scoreA ?? 0);
    const newScoreB = field === "scoreB" ? value : (targetSet?.scoreB ?? 0);

    // Optimistic update
    setSets(prev => prev.map(s => s.setNumber === setNumber ? { ...s, [field]: value } : s));

    try {
      const updated = await updateScore(match.id, { setNumber, scoreA: newScoreA, scoreB: newScoreB, version });
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e: any) {
      if (e?.status === 409) {
        setError("Konflik versi! Seseorang lain mengubah skor ini. Memperbarui data...");
        const refreshed = await getMatch(match.id);
        setSets(refreshed.sets ?? []);
        setVersion(refreshed.version);
      } else {
        setError(e instanceof Error ? e.message : "Gagal update skor");
      }
    } finally { setSaving(false); }
  }

  function addSet() {
    const nextSet = (sets.length === 0 ? 0 : Math.max(...sets.map(s => s.setNumber))) + 1;
    setSets(prev => [...prev, { id: `new-${nextSet}`, matchId: match.id, setNumber: nextSet, scoreA: 0, scoreB: 0, isFinished: false }]);
  }

  async function handleFinish() {
    if (!confirm("Selesaikan match ini? Pemenang ditentukan otomatis dari skor set.")) return;
    setFinishing(true);
    try {
      await finishMatch(match.id, {});
      onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyelesaikan match"); }
    finally { setFinishing(false); }
  }

  const sideA = match.participantA?.institution?.name ?? match.teamA?.institution?.name ?? "Tim A";
  const sideB = match.participantB?.institution?.name ?? match.teamB?.institution?.name ?? "Tim B";

  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--dash-card-bg)", borderColor: "rgba(102,255,180,0.25)" }}>
      {/* Header match */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: "#66FFB4" }} />
          <span className="text-xs font-semibold" style={{ color: "#66FFB4" }}>BERLANGSUNG</span>
          {isConnected && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(102,255,180,0.1)", color: "#66FFB4" }}>● Realtime</span>}
        </div>
        <span className="text-xs" style={{ color: "#9D9DB6" }}>Lap. {match.courtNumber ?? "?"}</span>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-white/70">{match.roundName} {match.groupName ? `— ${match.groupName}` : ""}</p>
        <div className="mt-2 flex items-center justify-center gap-6">
          <span className="font-black text-white text-lg">{sideA}</span>
          <span className="text-sm font-semibold" style={{ color: "#9D9DB6" }}>vs</span>
          <span className="font-black text-white text-lg">{sideB}</span>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl p-3 text-xs" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{error}</p>}

      {/* Set scores */}
      <div className="space-y-3 mb-6">
        {sets.map((set) => (
          <div key={set.setNumber} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-xs font-semibold w-12 shrink-0" style={{ color: "#9D9DB6" }}>Set {set.setNumber}</span>
            <div className="flex flex-1 items-center gap-3">
              {/* Score A */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleScoreChange(set.setNumber, "scoreA", Math.max(0, set.scoreA - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white font-bold">−</button>
                <span className="w-10 text-center text-xl font-black text-white">{set.scoreA}</span>
                <button onClick={() => handleScoreChange(set.setNumber, "scoreA", set.scoreA + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white font-bold">+</button>
              </div>
              <span className="font-bold text-white/30">:</span>
              {/* Score B */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleScoreChange(set.setNumber, "scoreB", Math.max(0, set.scoreB - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white font-bold">−</button>
                <span className="w-10 text-center text-xl font-black text-white">{set.scoreB}</span>
                <button onClick={() => handleScoreChange(set.setNumber, "scoreB", set.scoreB + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white font-bold">+</button>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addSet} className="w-full rounded-xl border py-2 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white/80"
          style={{ borderColor: "rgba(255,255,255,0.08)", borderStyle: "dashed" }}>
          + Tambah Set
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {saving && <span className="text-xs self-center" style={{ color: "#9D9DB6" }}>Menyimpan...</span>}
        <div className="flex-1" />
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="rounded-xl px-5 py-2 text-sm font-bold transition disabled:opacity-50"
          style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          {finishing ? "Menutup..." : "✓ Selesaikan Match"}
        </button>
      </div>
    </div>
  );
}

export function MatchAktifSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setMatches(await getMatches({ status: "ONGOING" }));
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Match Aktif" subtitle="Pertandingan yang sedang berlangsung" />
        <button onClick={load} className="rounded-xl border px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} /></div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
          <p className="text-5xl mb-4">⚡</p>
          <p className="font-semibold text-white">Belum ada match yang berlangsung</p>
          <p className="text-sm mt-2" style={{ color: "#9D9DB6" }}>Mulai match dari tab Jadwal terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <ScoreInputCard key={m.id} match={m} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}
