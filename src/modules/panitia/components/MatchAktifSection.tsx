"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronDown, CheckCircle, Wifi, WifiOff, Zap, RotateCcw, RotateCw, Play, Pause, Timer, Plus } from "lucide-react";

import { getMatches, getMatch, updateScore, finishMatch, undoScore, redoScore, updateSetTimer } from "@/lib/api/matches";
import { useMatchRoom, useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";
import type { Match, MatchSet } from "@/lib/types";

function SetTimerControl({ matchId, setNumber, initialDuration = 0, initialStatus = "STOPPED", initialStartedAt }: {
  matchId: string;
  setNumber: number;
  initialDuration?: number;
  initialStatus?: "STOPPED" | "RUNNING";
  initialStartedAt?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [duration, setDuration] = useState(initialDuration);
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setDuration(initialDuration);
    setStartedAt(initialStartedAt ?? null);
  }, [initialDuration, initialStatus, initialStartedAt]);

  const [elapsedSeconds, setElapsedSeconds] = useState(duration);

  useEffect(() => {
    let interval: any = null;
    if (status === "RUNNING" && startedAt) {
      const startTime = new Date(startedAt).getTime();
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(duration + Math.max(0, diff));
      }, 1000);
    } else {
      setElapsedSeconds(duration);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [status, startedAt, duration]);

  async function handleTimerAction(action: "START" | "PAUSE" | "RESET") {
    setLoading(true);
    try {
      const res = await updateSetTimer(matchId, setNumber, action);
      setDuration(res.durationSeconds);
      setStatus(res.timerStatus as any);
      setStartedAt(res.timerStartedAt ?? null);
    } catch (e) {}
    finally { setLoading(false); }
  }

  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const secs = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl border mb-6" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
      <div className="flex items-center gap-2">
        <Timer size={14} className="text-purple-600" />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5B21B6" }}>Timer Waktu Set {setNumber}</span>
        {status === "RUNNING" && <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />}
      </div>
      <span className="text-4xl font-mono font-black tracking-tight" style={{ color: "#2E1065" }}>{mins}:{secs}</span>
      <div className="flex gap-2 mt-1">
        {status === "RUNNING" ? (
          <button
            onClick={() => handleTimerAction("PAUSE")}
            disabled={loading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 font-bold rounded-lg text-white transition shadow-sm hover:opacity-90"
            style={{ background: "#F59E0B" }}
          >
            <Pause size={12} /> Pause (Istirahat)
          </button>
        ) : (
          <button
            onClick={() => handleTimerAction("START")}
            disabled={loading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 font-bold rounded-lg text-white transition shadow-sm hover:opacity-90"
            style={{ background: "#10B981" }}
          >
            <Play size={12} /> Mulai Waktu
          </button>
        )}
        <button
          onClick={() => handleTimerAction("RESET")}
          disabled={loading}
          className="text-xs px-2.5 py-1.5 font-semibold rounded-lg border transition hover:bg-purple-100"
          style={{ borderColor: "#C4B5FD", color: "#6D28D9", background: "#fff" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Scoring Panel — 1 match sekaligus, fokus
// ─────────────────────────────────────────────
function ScoringPanel({ match, onRefresh }: { match: Match; onRefresh: () => void }) {
  const { isConnected, lastScore, isFinished: socketFinished } = useMatchRoom(match.id);
  const [sets, setSets] = useState<MatchSet[]>(match.sets ?? []);
  const [version, setVersion] = useState(match.version);
  const [activeSet, setActiveSet] = useState(() => {
    const s = match.sets ?? [];
    return s.length > 0 ? s[s.length - 1].setNumber : 1;
  });
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  // WebSocket realtime
  useEffect(() => {
    if (!lastScore) return;
    setSets((prev) => {
      const existing = prev.find((s) => s.setNumber === lastScore.setNumber);
      if (existing) {
        return prev.map((s) =>
          s.setNumber === lastScore.setNumber
            ? { ...s, scoreA: lastScore.scoreA, scoreB: lastScore.scoreB }
            : s
        );
      }
      return [
        ...prev,
        { id: `ws-${lastScore.setNumber}`, matchId: match.id, setNumber: lastScore.setNumber, scoreA: lastScore.scoreA, scoreB: lastScore.scoreB, isFinished: false },
      ];
    });
  }, [lastScore, match.id]);

  useEffect(() => { if (socketFinished) onRefresh(); }, [socketFinished, onRefresh]);

  // Ensure current set always exists in sets array
  const currentSet = sets.find((s) => s.setNumber === activeSet) ?? {
    id: `new-${activeSet}`, matchId: match.id, setNumber: activeSet, scoreA: 0, scoreB: 0, isFinished: false,
  };

  async function handleAddScore(field: "scoreA" | "scoreB") {
    const newScoreA = field === "scoreA" ? currentSet.scoreA + 1 : currentSet.scoreA;
    const newScoreB = field === "scoreB" ? currentSet.scoreB + 1 : currentSet.scoreB;

    // Optimistic update
    setSets((prev) => {
      const exists = prev.find((s) => s.setNumber === activeSet);
      if (exists) return prev.map((s) => s.setNumber === activeSet ? { ...s, scoreA: newScoreA, scoreB: newScoreB } : s);
      return [...prev, { ...currentSet, scoreA: newScoreA, scoreB: newScoreB }];
    });

    setSaving(true); setError("");
    try {
      const updated = await updateScore(match.id, { setNumber: activeSet, scoreA: newScoreA, scoreB: newScoreB, version });
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e: any) {
      if (e?.status === 409) {
        setError("Konflik data — menyinkronkan ulang...");
        const refreshed = await getMatch(match.id);
        setSets(refreshed.sets ?? []);
        setVersion(refreshed.version);
      } else {
        setError(e instanceof Error ? e.message : "Gagal update skor");
      }
    } finally { setSaving(false); }
  }

  async function handleUndo() {
    setSaving(true); setError("");
    try {
      const updated = await undoScore(match.id);
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tidak ada skor untuk di-undo");
    } finally { setSaving(false); }
  }

  async function handleRedo() {
    setSaving(true); setError("");
    try {
      const updated = await redoScore(match.id);
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tidak ada skor untuk di-redo");
    } finally { setSaving(false); }
  }

  function addSet() {
    const next = sets.length > 0 ? Math.max(...sets.map((s) => s.setNumber)) + 1 : 1;
    const newSet = { id: `new-${next}`, matchId: match.id, setNumber: next, scoreA: 0, scoreB: 0, isFinished: false };
    setSets((prev) => [...prev, newSet]);
    setActiveSet(next);
  }

  async function handleFinish() {
    if (!confirm(`Selesaikan match ini?\nPemenang ditentukan dari skor set.`)) return;
    setFinishing(true);
    try {
      await finishMatch(match.id, {});
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyelesaikan match");
    } finally { setFinishing(false); }
  }

  const nameA = match.participantA?.institution?.name ?? match.teamA?.institution?.name ?? "Tim A";
  const nameB = match.participantB?.institution?.name ?? match.teamB?.institution?.name ?? "Tim B";

  return (
    <div className="mx-auto max-w-xl">
      {/* Match info bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-white px-4 py-3" style={{ borderColor: "#E5E7EB" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7280" }}>
            {match.roundName}{match.groupName ? ` — ${match.groupName}` : ""}
          </p>
          {match.courtNumber && (
            <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Lapangan {match.courtNumber}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isConnected
            ? <span className="flex items-center gap-1 text-xs font-medium text-green-600"><Wifi size={12} /> Realtime</span>
            : <span className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}><WifiOff size={12} /> Offline</span>
          }
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-red-500">BERLANGSUNG</span>
        </div>
      </div>

      {/* Main scoring card */}
      <div className="rounded-xl border bg-white shadow-sm" style={{ borderColor: "#E5E7EB" }}>

        {/* Set tabs */}
        <div className="flex items-center gap-1 border-b px-4 pt-4 pb-0" style={{ borderColor: "#F3F4F6" }}>
          {sets.map((s) => (
            <button
              key={s.setNumber}
              onClick={() => setActiveSet(s.setNumber)}
              className="rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition-colors"
              style={
                activeSet === s.setNumber
                  ? { background: "#6C47D1", color: "#fff", borderColor: "#6C47D1" }
                  : { background: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              Set {s.setNumber}
            </button>
          ))}
          <button
            onClick={addSet}
            className="ml-1 flex items-center gap-1 rounded-t-lg border border-b-0 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ color: "#9CA3AF", borderColor: "#E5E7EB", background: "#F9FAFB" }}
          >
            <Plus size={12} /> Set
          </button>
        </div>

        {/* Score area */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Set Timer Control */}
          <SetTimerControl
            matchId={match.id}
            setNumber={activeSet}
            initialDuration={currentSet.durationSeconds}
            initialStatus={currentSet.timerStatus as any}
            initialStartedAt={currentSet.timerStartedAt}
          />

          <div className="grid grid-cols-3 items-center gap-4">
            {/* Team A */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-sm font-bold leading-tight" style={{ color: "#111827" }}>{nameA}</p>
              {/* Score display */}
              <span className="text-6xl font-black tabular-nums" style={{ color: "#111827" }}>
                {currentSet.scoreA}
              </span>
              {/* +1 Button */}
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleAddScore("scoreA")}
                  disabled={saving}
                  className="w-full rounded-lg py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-50 active:scale-95 shadow-md"
                  style={{ background: "#6C47D1" }}
                >
                  +1 Point
                </button>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-black" style={{ color: "#D1D5DB" }}>:</span>
              {saving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} />
              )}
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-sm font-bold leading-tight" style={{ color: "#111827" }}>{nameB}</p>
              <span className="text-6xl font-black tabular-nums" style={{ color: "#111827" }}>
                {currentSet.scoreB}
              </span>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleAddScore("scoreB")}
                  disabled={saving}
                  className="w-full rounded-lg py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-50 active:scale-95 shadow-md"
                  style={{ background: "#6C47D1" }}
                >
                  +1 Point
                </button>
              </div>
            </div>
          </div>

          {/* Undo / Redo Control Bar */}
          <div className="mt-6 flex justify-center gap-3 border-t pt-4" style={{ borderColor: "#F3F4F6" }}>
            <button
              onClick={handleUndo}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold transition hover:bg-gray-50 disabled:opacity-40"
              style={{ borderColor: "#D1D5DB", color: "#374151" }}
            >
              <RotateCcw size={14} /> Undo Skor
            </button>
            <button
              onClick={handleRedo}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold transition hover:bg-gray-50 disabled:opacity-40"
              style={{ borderColor: "#D1D5DB", color: "#374151" }}
            >
              <RotateCw size={14} /> Redo Skor
            </button>
          </div>
        </div>

        {/* Set summary */}
        {sets.length > 0 && (
          <div className="border-t px-6 py-3" style={{ borderColor: "#F3F4F6" }}>
            <div className="flex flex-wrap gap-3">
              {sets.map((s) => (
                <div key={s.setNumber} className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#9CA3AF" }}>Set {s.setNumber}:</span>
                  <span className="text-xs font-bold" style={{ color: s.setNumber === activeSet ? "#6C47D1" : "#374151" }}>
                    {s.scoreA} – {s.scoreB}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finish button */}
        <div className="border-t px-6 py-4" style={{ borderColor: "#F3F4F6" }}>
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: "#EF4444", color: "#EF4444" }}
          >
            <CheckCircle size={16} />
            {finishing ? "Menyelesaikan..." : "Selesaikan Match"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MatchAktifSection — pilih 1 match, fokus
// ─────────────────────────────────────────────
export function MatchAktifSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSubMatchId, setSelectedSubMatchId] = useState<string | null>(null);
  const { lastUpdate } = useGlobalPanitiaRoom();

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await getMatches({ status: "ONGOING" });
      setMatches(data);
      setSelectedId((prev) => {
        if (prev && data.find((m) => m.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } finally { 
      if (!isBackground) setIsLoading(false); 
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Realtime updates
  useEffect(() => { 
    if (lastUpdate > 0) load(true); 
  }, [lastUpdate, load]);

  useEffect(() => {
    setSelectedSubMatchId(null);
  }, [selectedId]);

  const selected = matches.find((m) => m.id === selectedId);

  const labelFor = (m: Match) => {
    const a = m.participantA?.institution?.name ?? m.teamA?.institution?.name ?? "Tim A";
    const b = m.participantB?.institution?.name ?? m.teamB?.institution?.name ?? "Tim B";
    return `${a} vs ${b} — Lap. ${m.courtNumber ?? "?"}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Match Aktif</h1>
          <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>
            {matches.length} pertandingan berlangsung
          </p>
        </div>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          style={{ borderColor: "#E5E7EB", color: "#374151" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-24" style={{ borderColor: "#E5E7EB" }}>
          <Zap size={40} style={{ color: "#D1D5DB" }} className="mb-4" />
          <p className="font-semibold" style={{ color: "#374151" }}>Belum ada match yang berlangsung</p>
          <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>Mulai match dari tab Jadwal terlebih dahulu.</p>
        </div>
      ) : (
        <>
          {/* Match selector dropdown */}
          {matches.length > 1 && (
            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "#374151" }}>
                Pilih Match yang Anda Awasi
              </label>
              <div className="relative max-w-sm">
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  style={{ borderColor: "#D1D5DB", color: "#111827" }}
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>{labelFor(m)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
              </div>
            </div>
          )}

          {/* Scoring panel for selected match */}
          {selected && (
            selected.discipline?.isTeamEvent ? (
              selectedSubMatchId ? (
                <div>
                  <button onClick={() => setSelectedSubMatchId(null)} className="mb-4 text-sm font-semibold text-purple-600 hover:underline">&larr; Kembali ke Daftar Pertandingan Beregu</button>
                  <ScoringPanel key={selectedSubMatchId} match={selected.childMatches?.find((m: Match) => m.id === selectedSubMatchId)!} onRefresh={load} />
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="mb-4 text-lg font-bold" style={{ color: "#111827" }}>Daftar Pertandingan Beregu (Sub-Match)</h3>
                  <div className="grid gap-3">
                    {selected.childMatches?.map((child: any) => {
                      const assignedSlot = child.slotType?.replace(/_[12]$/, "");
                      const teamAAthletes = selected.teamA?.members?.filter((m: any) => m.assignedSlot === assignedSlot).map((m: any) => m.athlete?.name).join(" & ") || "-";
                      const teamBAthletes = selected.teamB?.members?.filter((m: any) => m.assignedSlot === assignedSlot).map((m: any) => m.athlete?.name).join(" & ") || "-";
                      const slotLabel = (child.slotType || "Tunggal/Ganda").replace(/_/g, " ").replace(/ 1$/, "").replace(/\w\S*/g, (w: string) => (w.replace(/^\w/, (c) => c.toUpperCase())));
                      
                      return (
                      <div key={child.id} className="flex items-center justify-between rounded-lg border bg-white px-5 py-4" style={{ borderColor: "#F3F4F6" }}>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#111827" }}>{slotLabel}</p>
                          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                            {teamAAthletes} <strong style={{ color: "#374151" }} className="mx-1">vs</strong> {teamBAthletes}
                          </p>
                        </div>
                        {child.status === "FINISHED" ? (
                          <span className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg">Selesai</span>
                        ) : (
                          <button onClick={() => setSelectedSubMatchId(child.id)} className="text-xs px-4 py-2 font-semibold text-white transition hover:opacity-90 rounded-lg" style={{ background: "#6C47D1" }}>
                            Buka Skor
                          </button>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 border-t pt-4" style={{ borderColor: "#F3F4F6" }}>
                    <button onClick={async () => {
                      if (!confirm("Selesaikan keseluruhan match beregu ini?\nPastikan semua partai yang perlu dimainkan sudah selesai.")) return;
                      await finishMatch(selected.id, {});
                      load();
                    }} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition hover:bg-red-50" style={{ borderColor: "#EF4444", color: "#EF4444" }}>
                      Selesaikan Match Beregu
                    </button>
                  </div>
                </div>
              )
            ) : (
              <ScoringPanel key={selected.id} match={selected} onRefresh={load} />
            )
          )}
        </>
      )}
    </div>
  );
}
