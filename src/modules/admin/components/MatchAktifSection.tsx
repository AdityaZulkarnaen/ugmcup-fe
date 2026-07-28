"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  CheckCircle,
  Wifi,
  WifiOff,
  Zap,
  RotateCcw,
  RotateCw,
  Timer,
  Plus,
  Square,
  AlertTriangle,
  Award,
  Pause,
  Play
} from "lucide-react";

import {
  getMatches,
  getMatch,
  updateScore,
  finishMatch,
  undoScore,
  redoScore,
  updateSetTimer
} from "@/lib/api/matches";
import { useMatchRoom, useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";
import type { Match, MatchSet } from "@/lib/types";

// ─────────────────────────────────────────────
// Timer Control Component
// ─────────────────────────────────────────────
function SetTimerControl({
  matchId,
  setNumber,
  initialDuration = 0,
  initialStatus = "STOPPED",
  initialStartedAt,
  onStatusChange
}: {
  matchId: string;
  setNumber: number;
  initialDuration?: number;
  initialStatus?: "STOPPED" | "RUNNING" | "LOCKED";
  initialStartedAt?: string | null;
  onStatusChange?: (status: "STOPPED" | "RUNNING" | "LOCKED") => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [duration, setDuration] = useState(initialDuration);
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setDuration(initialDuration);
    setStartedAt(initialStartedAt ?? null);
    onStatusChange?.(initialStatus);
  }, [initialDuration, initialStatus, initialStartedAt, onStatusChange]);

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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startedAt, duration]);

  async function handleTimerAction(action: "START" | "PAUSE" | "RESET" | "STOP") {
    setLoading(true);
    try {
      const res = await updateSetTimer(matchId, setNumber, action);
      setDuration(res.durationSeconds);
      setStatus(res.timerStatus as any);
      setStartedAt(res.timerStartedAt ?? null);
      onStatusChange?.(res.timerStatus as any);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const secs = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border bg-[#F8F7FF] border-[#E9D5FF] shadow-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <Timer size={14} className="text-[#8352D9]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B21B6]">
          Set {setNumber}
        </span>
        {status === "RUNNING" && (
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
        )}
      </div>

      <div className="text-4xl font-bold tabular-nums tracking-tight text-[#2E1065] my-0.5">
        {mins}:{secs}
      </div>

      <div className="flex items-center gap-2 mt-1">
        {status === "LOCKED" ? (
          <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
            Locked
          </span>
        ) : (
          <>
            {status === "RUNNING" ? (
              <button
                onClick={() => handleTimerAction("PAUSE")}
                disabled={loading}
                aria-label="Jeda Timer"
                title="Jeda Timer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition bg-[#F59E0B] hover:opacity-90 active:scale-95 shadow-xs"
              >
                <Pause size={12} fill="currentColor" /> Jeda
              </button>
            ) : (
              <button
                onClick={() => handleTimerAction("START")}
                disabled={loading}
                aria-label="Mulai Timer"
                title="Mulai Timer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0F172A] transition bg-[#66FFB4] hover:bg-[#50E69D] active:scale-95 shadow-[0_2px_8px_rgba(102,255,180,0.4)]"
              >
                <Play size={12} fill="currentColor" /> Mulai
              </button>
            )}

            <button
              onClick={() => {
                if (confirm("Kunci timer untuk set ini? Waktu tidak bisa dilanjutkan lagi.")) {
                  handleTimerAction("STOP");
                }
              }}
              disabled={loading}
              aria-label="Berhenti & Kunci Timer"
              title="Berhenti & Kunci Timer"
              className="flex items-center justify-center p-1.5 rounded-lg text-white transition bg-[#EF4444] hover:opacity-90 active:scale-95 shadow-xs"
            >
              <Square size={12} fill="currentColor" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Scoring Panel (1 Match Focused)
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

  // Modals
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showRetiredModal, setShowRetiredModal] = useState(false);
  const [retiredWinnerId, setRetiredWinnerId] = useState("");

  // Realtime updates via WebSocket
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
        {
          id: `ws-${lastScore.setNumber}`,
          matchId: match.id,
          setNumber: lastScore.setNumber,
          scoreA: lastScore.scoreA,
          scoreB: lastScore.scoreB,
          isFinished: false
        }
      ];
    });
  }, [lastScore, match.id]);

  useEffect(() => {
    if (socketFinished) onRefresh();
  }, [socketFinished, onRefresh]);

  const currentSet = sets.find((s) => s.setNumber === activeSet) ?? {
    id: `new-${activeSet}`,
    matchId: match.id,
    setNumber: activeSet,
    scoreA: 0,
    scoreB: 0,
    isFinished: false,
    timerStatus: "STOPPED",
    durationSeconds: 0
  };

  const isTimerRunning = currentSet.timerStatus === "RUNNING";

  async function handleAddScore(field: "scoreA" | "scoreB") {
    if (!isTimerRunning) {
      alert("Nyalakan timer terlebih dahulu untuk set ini sebelum menambahkan skor!");
      return;
    }
    const newScoreA = field === "scoreA" ? currentSet.scoreA + 1 : currentSet.scoreA;
    const newScoreB = field === "scoreB" ? currentSet.scoreB + 1 : currentSet.scoreB;

    // Ensure set exists in `sets`
    setSets((prev) => {
      const exists = prev.find((s) => s.setNumber === activeSet);
      if (exists) {
        return prev.map((s) =>
          s.setNumber === activeSet ? { ...s, scoreA: newScoreA, scoreB: newScoreB } : s
        );
      }
      return [...prev, { ...currentSet, scoreA: newScoreA, scoreB: newScoreB }];
    });

    setSaving(true);
    setError("");
    try {
      const updated = await updateScore(match.id, {
        setNumber: activeSet,
        scoreA: newScoreA,
        scoreB: newScoreB,
        version
      });
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e: any) {
      if (e?.status === 409) {
        setError("Konflik data - menyinkronkan ulang...");
        const refreshed = await getMatch(match.id);
        setSets(refreshed.sets ?? []);
        setVersion(refreshed.version);
      } else {
        setError(e instanceof Error ? e.message : "Gagal update skor");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUndo() {
    setSaving(true);
    setError("");
    try {
      const updated = await undoScore(match.id);
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tidak ada skor untuk di-undo");
    } finally {
      setSaving(false);
    }
  }

  async function handleRedo() {
    setSaving(true);
    setError("");
    try {
      const updated = await redoScore(match.id);
      setVersion(updated.version);
      if (updated.sets) setSets(updated.sets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tidak ada skor untuk di-redo");
    } finally {
      setSaving(false);
    }
  }

  function addSet() {
    const next = sets.length > 0 ? Math.max(...sets.map((s) => s.setNumber)) + 1 : 1;
    const newSet = {
      id: `new-${next}`,
      matchId: match.id,
      setNumber: next,
      scoreA: 0,
      scoreB: 0,
      isFinished: false
    };
    setSets((prev) => [...prev, newSet]);
    setActiveSet(next);
  }

  async function handleFinishConfirm() {
    setFinishing(true);
    try {
      await finishMatch(match.id, {});
      setShowFinishModal(false);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyelesaikan match");
    } finally {
      setFinishing(false);
    }
  }

  async function handleRetiredSubmit() {
    if (!retiredWinnerId) {
      alert("Silakan pilih tim yang memenangkan match ini.");
      return;
    }
    setFinishing(true);
    try {
      await finishMatch(match.id, { retired: true, winnerId: retiredWinnerId });
      setShowRetiredModal(false);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan status retired");
    } finally {
      setFinishing(false);
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showFinishModal || showRetiredModal) return;
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if ((e.key === "a" || e.key === "A") && isTimerRunning && !saving) {
        e.preventDefault();
        handleAddScore("scoreA");
      } else if ((e.key === "b" || e.key === "B") && isTimerRunning && !saving) {
        e.preventDefault();
        handleAddScore("scoreB");
      } else if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey) && !saving) {
        e.preventDefault();
        handleUndo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTimerRunning, saving, showFinishModal, showRetiredModal, currentSet]);

  // Clean Participant & Institution Label Logic
  const athleteNamesA =
    (match.participantA?.athletes?.length ?? 0) > 0
      ? match.participantA?.athletes?.map((a: any) => a.athlete?.name).join(" & ")
      : null;
  const instA =
    match.participantA?.institution?.name ??
    match.teamA?.institution?.name ??
    null;
  const primaryA = athleteNamesA || instA || "Tim A";
  const secondaryA = athleteNamesA && instA && athleteNamesA !== instA ? instA : null;

  const athleteNamesB =
    (match.participantB?.athletes?.length ?? 0) > 0
      ? match.participantB?.athletes?.map((a: any) => a.athlete?.name).join(" & ")
      : null;
  const instB =
    match.participantB?.institution?.name ??
    match.teamB?.institution?.name ??
    null;
  const primaryB = athleteNamesB || instB || "Tim B";
  const secondaryB = athleteNamesB && instB && athleteNamesB !== instB ? instB : null;

  const totalSeconds = sets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalMins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const totalSecs = String(totalSeconds % 60).padStart(2, "0");

  const is00 = currentSet.scoreA === 0 && currentSet.scoreB === 0;

  return (
    <div className="w-full flex flex-col gap-2 max-h-[calc(100vh-6.5rem)] justify-between">
      {/* 1. Match Context Bar */}
      <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 shadow-xs border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900">
            {match.roundName}{match.groupName ? ` — ${match.groupName}` : ""}
          </span>
          {match.courtNumber && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
              Lapangan {match.courtNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200">
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
                <Wifi size={13} /> Terhubung
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                <WifiOff size={13} /> Offline
              </span>
            )}
            <div className="h-3 w-px bg-gray-200 mx-0.5" />
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#EF4444]" />
            <span className="text-xs font-black tracking-wider text-[#EF4444] uppercase">Live</span>
          </div>

          <button
            onClick={onRefresh}
            aria-label="Refresh Data"
            title="Refresh Data"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Set Navigator Tabs (Hide tabs if sets.length === 0) */}
      <div className="flex items-center gap-1.5 mt-1 min-h-[34px]">
        {sets.map((s) => (
          <button
            key={s.setNumber}
            onClick={() => setActiveSet(s.setNumber)}
            className={`rounded-t-xl border border-b-0 px-5 py-2 text-xs font-semibold transition-colors shadow-xs ${
              activeSet === s.setNumber
                ? "bg-[#8352D9] text-white border-[#8352D9]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Set {s.setNumber}
          </button>
        ))}

        <button
          onClick={addSet}
          aria-label={sets.length === 0 ? "Mulai Set 1" : "Tambah Set Pertandingan"}
          title={sets.length === 0 ? "Mulai Set 1" : "Tambah Set Pertandingan"}
          className="ml-auto flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
        >
          <Plus size={14} /> {sets.length === 0 ? "Mulai Set 1" : "Tambah Set"}
        </button>
      </div>

      {/* 3. Score & Timer Card */}
      <div className="bg-white border border-gray-200 rounded-b-2xl rounded-tr-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[1fr_210px_1fr] items-center gap-4">
          {/* Team A Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-center min-h-[44px] flex flex-col justify-end">
              <p className="text-lg font-bold text-gray-900 leading-tight">{primaryA}</p>
              {secondaryA && <p className="text-xs font-medium text-gray-500 mt-0.5">{secondaryA}</p>}
            </div>

            <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-gray-900 my-1">
              {currentSet.scoreA}
            </div>

            <button
              onClick={() => handleAddScore("scoreA")}
              disabled={saving || !isTimerRunning}
              aria-label={`Tambah 1 poin untuk ${primaryA} (Tekan A)`}
              title={isTimerRunning ? "Tekan A pada keyboard" : "Nyalakan timer dahulu"}
              className={`w-full max-w-[220px] rounded-full py-3.5 text-xl font-bold transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(102,255,180,0.4)] ${
                !isTimerRunning
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#66FFB4] text-[#0F172A] hover:bg-[#50E69D]"
              }`}
            >
              +1 Point
            </button>
          </div>

          {/* Center Section: Timer Control & Small Match Time */}
          <div className="flex flex-col gap-2">
            <SetTimerControl
              matchId={match.id}
              setNumber={activeSet}
              initialDuration={currentSet.durationSeconds}
              initialStatus={currentSet.timerStatus as any}
              initialStartedAt={currentSet.timerStartedAt}
            />

            <div className="text-[10px] text-gray-400 text-center font-medium">
              Match Time: <span className="font-bold text-gray-600 tabular-nums">{totalMins}:{totalSecs}</span>
            </div>
          </div>

          {/* Team B Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-center min-h-[44px] flex flex-col justify-end">
              <p className="text-lg font-bold text-gray-900 leading-tight">{primaryB}</p>
              {secondaryB && <p className="text-xs font-medium text-gray-500 mt-0.5">{secondaryB}</p>}
            </div>

            <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-gray-900 my-1">
              {currentSet.scoreB}
            </div>

            <button
              onClick={() => handleAddScore("scoreB")}
              disabled={saving || !isTimerRunning}
              aria-label={`Tambah 1 poin untuk ${primaryB} (Tekan B)`}
              title={isTimerRunning ? "Tekan B pada keyboard" : "Nyalakan timer dahulu"}
              className={`w-full max-w-[220px] rounded-full py-3.5 text-xl font-bold transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(102,255,180,0.4)] ${
                !isTimerRunning
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#66FFB4] text-[#0F172A] hover:bg-[#50E69D]"
              }`}
            >
              +1 Point
            </button>
          </div>
        </div>

        {/* 4. Set Summary Row */}
        {sets.length > 0 && (
          <div className="flex items-center gap-2 border-t pt-2.5 border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ringkasan Set:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {sets.map((s) => (
                <span
                  key={s.setNumber}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                    s.setNumber === activeSet
                      ? "bg-purple-50 text-[#8352D9] border-purple-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  Set {s.setNumber}: <strong className="font-bold">{s.scoreA}–{s.scoreB}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Action Footer */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={saving || is00}
            aria-label="Undo Skor (Ctrl+Z)"
            title="Undo Skor (Ctrl+Z)"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <RotateCcw size={14} /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={saving}
            aria-label="Redo Skor"
            title="Redo Skor"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <RotateCw size={14} /> Redo
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRetiredModal(true)}
            disabled={finishing}
            aria-label="Mark Match as Retired"
            title="Mark Match as Retired"
            className="px-4 py-2 rounded-lg border border-[#EF4444] text-xs font-semibold text-[#EF4444] hover:bg-red-50 disabled:opacity-50 transition"
          >
            Retired
          </button>

          <button
            onClick={() => setShowFinishModal(true)}
            disabled={finishing}
            aria-label="Selesaikan Pertandingan"
            title="Selesaikan Pertandingan"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white transition bg-[#2E1065] hover:bg-[#1E0A45] disabled:opacity-50 shadow-md"
          >
            <CheckCircle size={15} /> Selesaikan Pertandingan
          </button>
        </div>
      </div>

      {/* MODAL 1: Finish Confirmation */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#8352D9] mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Selesaikan Pertandingan?</h3>
              <p className="text-xs text-gray-500 mt-2">
                Skor akhir akan dikunci dan pemenang akan otomatis dicatat di sistem. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleFinishConfirm}
                disabled={finishing}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#2E1065] hover:bg-[#1E0A45] transition disabled:opacity-50"
              >
                {finishing ? "Menyelesaikan..." : "Ya, Selesaikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Retired Confirmation */}
      {showRetiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="border-b px-6 py-4 bg-red-50">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={18} /> Pertandingan Retired
              </h3>
              <p className="text-xs text-red-800 mt-1">
                Pilih tim pemenang (tim lawan mundur/cedera).
              </p>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold text-gray-700 mb-3">Pilih Pemenang Pertandingan:</p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setRetiredWinnerId(match.participantA?.id || match.teamA?.id || "")}
                  className={`p-3.5 border-2 rounded-xl text-left transition-all ${
                    retiredWinnerId === (match.participantA?.id || match.teamA?.id)
                      ? "border-green-500 bg-green-50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{primaryA}</p>
                  {secondaryA && <p className="text-xs text-gray-500">{secondaryA}</p>}
                </button>

                <button
                  onClick={() => setRetiredWinnerId(match.participantB?.id || match.teamB?.id || "")}
                  className={`p-3.5 border-2 rounded-xl text-left transition-all ${
                    retiredWinnerId === (match.participantB?.id || match.teamB?.id)
                      ? "border-green-500 bg-green-50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{primaryB}</p>
                  {secondaryB && <p className="text-xs text-gray-500">{secondaryB}</p>}
                </button>
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowRetiredModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleRetiredSubmit}
                disabled={!retiredWinnerId || finishing}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#EF4444] hover:bg-red-600 transition disabled:opacity-50"
              >
                Konfirmasi Retired
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MatchAktifSection Main Layout
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (lastUpdate > 0) load(true);
  }, [lastUpdate, load]);

  useEffect(() => {
    setSelectedSubMatchId(null);
  }, [selectedId]);

  const selected = matches.find((m) => m.id === selectedId);

  const labelFor = (m: Match) => {
    const getPName = (p: any) =>
      p?.athletes?.length > 0 ? p.athletes.map((a: any) => a.athlete?.name).join(" & ") : null;
    const instA = m.participantA?.institution?.name ?? m.teamA?.institution?.name ?? "Tim A";
    const nameA = getPName(m.participantA) ? `${getPName(m.participantA)} (${instA})` : instA;

    const instB = m.participantB?.institution?.name ?? m.teamB?.institution?.name ?? "Tim B";
    const nameB = getPName(m.participantB) ? `${getPName(m.participantB)} (${instB})` : instB;

    return `${nameA} vs ${nameB} — Lap. ${m.courtNumber ?? "?"}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: "#8352D9" }}
          />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-24 border-gray-200">
          <Zap size={40} className="mb-4 text-gray-300" />
          <p className="font-semibold text-gray-700">Belum ada match yang berlangsung</p>
          <p className="mt-1 text-xs text-gray-400">Mulai match dari tab Jadwal terlebih dahulu.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-5 overflow-hidden">
          {/* Sidebar Match Selector (~240px) */}
          <div className="w-full md:w-[240px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 pr-0 md:pr-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Match Diawasi ({matches.length})
              </label>
              <button
                onClick={() => load()}
                title="Refresh Daftar Match"
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0 pr-1">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all shrink-0 md:shrink ${
                    selectedId === m.id
                      ? "border-[#8352D9] bg-purple-50/60 shadow-xs"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-xs font-bold truncate ${
                      selectedId === m.id ? "text-[#5B21B6]" : "text-gray-900"
                    }`}
                  >
                    {labelFor(m).split(" — ")[0]}
                  </p>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className={selectedId === m.id ? "text-[#8352D9]" : "text-gray-500"}>
                      Lap. {m.courtNumber ?? "?"}
                    </span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pr-1">
            {selected &&
              (selected.discipline?.isTeamEvent ? (
                selectedSubMatchId ? (
                  <div className="max-w-3xl mx-auto">
                    <button
                      onClick={() => setSelectedSubMatchId(null)}
                      className="mb-3 text-xs font-semibold text-[#8352D9] hover:underline flex items-center gap-1"
                    >
                      &larr; Kembali ke Daftar Pertandingan Beregu
                    </button>
                    <ScoringPanel
                      key={selectedSubMatchId}
                      match={selected.childMatches?.find((m: Match) => m.id === selectedSubMatchId)!}
                      onRefresh={load}
                    />
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-5 border-gray-200 shadow-xs">
                    <h3 className="mb-4 text-base font-bold text-gray-900">
                      Daftar Pertandingan Beregu (Sub-Match)
                    </h3>
                    <div className="grid gap-3">
                      {selected.childMatches?.map((child: any) => {
                        const assignedSlot = child.slotType?.replace(/_[12]$/, "");
                        const teamAAthletes =
                          selected.teamA?.members
                            ?.filter((m: any) => m.assignedSlot === assignedSlot)
                            .map((m: any) => m.athlete?.name)
                            .join(" & ") || "-";
                        const teamBAthletes =
                          selected.teamB?.members
                            ?.filter((m: any) => m.assignedSlot === assignedSlot)
                            .map((m: any) => m.athlete?.name)
                            .join(" & ") || "-";
                        const slotLabel = (child.slotType || "Tunggal/Ganda")
                          .replace(/_/g, " ")
                          .replace(/ 1$/, "")
                          .replace(/\w\S*/g, (w: string) =>
                            w.replace(/^\w/, (c) => c.toUpperCase())
                          );

                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 border-gray-100 shadow-xs"
                          >
                            <div>
                              <p className="font-bold text-xs text-gray-900">{slotLabel}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {teamAAthletes}{" "}
                                <strong className="text-gray-700 mx-1">vs</strong>{" "}
                                {teamBAthletes}
                              </p>
                            </div>
                            {child.status === "FINISHED" ? (
                              <span className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                                Selesai
                              </span>
                            ) : (
                              <button
                                onClick={() => setSelectedSubMatchId(child.id)}
                                className="text-xs px-4 py-2 font-bold text-white transition shadow-xs hover:opacity-90 rounded-lg bg-[#8352D9]"
                              >
                                Buka Skor
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 border-t pt-4 border-gray-100">
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              "Selesaikan keseluruhan match beregu ini?\nPastikan semua partai yang perlu dimainkan sudah selesai."
                            )
                          )
                            return;
                          await finishMatch(selected.id, {});
                          load();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#EF4444] py-2.5 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition"
                      >
                        Selesaikan Match Beregu
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="max-w-4xl mx-auto">
                  <ScoringPanel key={selected.id} match={selected} onRefresh={load} />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
