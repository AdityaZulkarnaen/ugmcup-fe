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
  Play,
  Trophy,
  ChevronRight
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

function SetTimerControl({
  matchId,
  setNumber,
  initialDuration = 0,
  initialStatus = "STOPPED",
  initialStartedAt,
  isSetCreated = true,
  isMatchFinished = false,
  onTimerUpdate
}: {
  matchId: string;
  setNumber: number;
  initialDuration?: number;
  initialStatus?: "STOPPED" | "RUNNING" | "LOCKED";
  initialStartedAt?: string | null;
  isSetCreated?: boolean;
  isMatchFinished?: boolean;
  onTimerUpdate?: (updated: { timerStatus: string; durationSeconds: number; timerStartedAt: string | null }) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [duration, setDuration] = useState(initialDuration);
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt ?? null);

  useEffect(() => {
    setStatus(initialStatus);
    setDuration(initialDuration);
    setStartedAt(initialStartedAt ?? null);
  }, [initialDuration, initialStatus, initialStartedAt]);

  const [elapsedMs, setElapsedMs] = useState(duration * 1000);

  useEffect(() => {
    let interval: any = null;
    if (status === "RUNNING" && startedAt && !isMatchFinished) {
      const startTime = new Date(startedAt).getTime();
      interval = setInterval(() => {
        const diffMs = Date.now() - startTime;
        setElapsedMs(duration * 1000 + Math.max(0, diffMs));
      }, 33);
    } else {
      setElapsedMs(duration * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startedAt, duration, isMatchFinished]);

  async function handleTimerAction(action: "START" | "PAUSE" | "RESET" | "STOP") {
    if (isMatchFinished) return;
    const nowIso = new Date().toISOString();
    const currentDurationSec = Math.floor(elapsedMs / 1000);

    let nextStatus: "STOPPED" | "RUNNING" | "LOCKED" = "STOPPED";
    if (action === "START") nextStatus = "RUNNING";
    else if (action === "STOP") nextStatus = "LOCKED";
    else if (action === "PAUSE") nextStatus = "STOPPED";

    setStatus(nextStatus);
    if (action === "START") setStartedAt(nowIso);

    onTimerUpdate?.({
      timerStatus: nextStatus,
      durationSeconds: currentDurationSec,
      timerStartedAt: action === "START" ? nowIso : null
    });

    try {
      const res = await updateSetTimer(matchId, setNumber, action);
      setDuration(res.durationSeconds);
      setStatus(res.timerStatus as any);
      setStartedAt(res.timerStartedAt ?? null);
      onTimerUpdate?.({
        timerStatus: res.timerStatus,
        durationSeconds: res.durationSeconds,
        timerStartedAt: res.timerStartedAt ?? null
      });
    } catch (e) {
      console.error("Failed to sync timer action:", e);
    }
  }

  const totalMs = Math.max(0, elapsedMs);
  const mins = String(Math.floor(totalMs / 60000)).padStart(2, "0");
  const secs = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, "0");
  const cs = String(Math.floor((totalMs % 1000) / 10)).padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border bg-[#F8F7FF] border-[#E9D5FF] shadow-xs">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Timer size={13} className="text-[#8352D9]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B21B6]">
          Set {isSetCreated ? setNumber : 0}
        </span>
        {status === "RUNNING" && !isMatchFinished && (
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
        )}
      </div>

      <div className="text-2xl font-bold tabular-nums tracking-tight text-[#2E1065] my-0.5">
        {mins}:{secs}:{cs}
      </div>

      <div className="flex items-center gap-2 mt-1">
        {status === "LOCKED" || isMatchFinished ? (
          <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
            Locked
          </span>
        ) : (
          <>
            {status === "RUNNING" ? (
              <button
                onClick={() => handleTimerAction("PAUSE")}
                aria-label="Jeda Timer"
                title="Jeda Timer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition bg-[#F59E0B] hover:opacity-90 active:scale-95 shadow-xs"
              >
                <Pause size={12} fill="currentColor" /> Jeda
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isSetCreated) {
                    alert("Buat Set 1 terlebih dahulu dengan menekan tombol '+ Mulai Set 1'");
                    return;
                  }
                  handleTimerAction("START");
                }}
                disabled={!isSetCreated || isMatchFinished}
                aria-label="Mulai Timer"
                title={!isSetCreated ? "Buat Set 1 terlebih dahulu" : "Mulai Timer"}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !isSetCreated || isMatchFinished
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#66FFB4] text-[#0F172A] hover:bg-[#50E69D] active:scale-95 shadow-[0_2px_8px_rgba(102,255,180,0.4)]"
                }`}
              >
                <Play size={12} fill="currentColor" /> Mulai
              </button>
            )}

            <button
              onClick={() => {
                if (!isSetCreated || isMatchFinished) return;
                if (confirm("Kunci timer untuk set ini? Waktu tidak bisa dilanjutkan lagi.")) {
                  handleTimerAction("STOP");
                }
              }}
              disabled={!isSetCreated || isMatchFinished}
              aria-label="Berhenti & Kunci Timer"
              title={!isSetCreated ? "Buat Set 1 terlebih dahulu" : "Berhenti & Kunci Timer"}
              className={`flex items-center justify-center p-1.5 rounded-lg text-white transition shadow-xs ${
                !isSetCreated || isMatchFinished
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#EF4444] hover:opacity-90 active:scale-95"
              }`}
            >
              <Square size={12} fill="currentColor" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoringPanel({
  match,
  parentMatch,
  onRefresh,
  onFinishSubMatch
}: {
  match: Match;
  parentMatch?: Match;
  onRefresh: () => void;
  onFinishSubMatch?: () => void;
}) {
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

  const isMatchFinished = match.status === "FINISHED";

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showRetiredModal, setShowRetiredModal] = useState(false);
  const [retiredWinnerId, setRetiredWinnerId] = useState("");

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
    if (socketFinished) {
      onRefresh();
      onFinishSubMatch?.();
    }
  }, [socketFinished, onRefresh, onFinishSubMatch]);

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

  const isTimerRunning = currentSet.timerStatus === "RUNNING" && !isMatchFinished;

  async function handleAddScore(field: "scoreA" | "scoreB") {
    if (!isTimerRunning || isMatchFinished || saving) return;

    const newScoreA = field === "scoreA" ? currentSet.scoreA + 1 : currentSet.scoreA;
    const newScoreB = field === "scoreB" ? currentSet.scoreB + 1 : currentSet.scoreB;

    setSaving(true);
    setError("");

    setSets((prev) => {
      const exists = prev.find((s) => s.setNumber === activeSet);
      if (exists) {
        return prev.map((s) =>
          s.setNumber === activeSet ? { ...s, scoreA: newScoreA, scoreB: newScoreB } : s
        );
      }
      return [...prev, { ...currentSet, scoreA: newScoreA, scoreB: newScoreB }];
    });

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
    if (isMatchFinished || saving) return;
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
    if (isMatchFinished || saving) return;
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
    if (isMatchFinished) return;
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
      onFinishSubMatch?.();
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
      onFinishSubMatch?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan status retired");
    } finally {
      setFinishing(false);
    }
  }

  const handleTimerUpdate = useCallback(
    (updated: { timerStatus: string; durationSeconds: number; timerStartedAt: string | null }) => {
      setSets((prev) => {
        const targetSetNumber = prev.length === 0 ? 1 : activeSet;
        const exists = prev.find((s) => s.setNumber === targetSetNumber);
        if (exists) {
          return prev.map((s) =>
            s.setNumber === targetSetNumber
              ? {
                  ...s,
                  timerStatus: updated.timerStatus as any,
                  durationSeconds: updated.durationSeconds,
                  timerStartedAt: updated.timerStartedAt ?? undefined
                }
              : s
          );
        }
        return [
          ...prev,
          {
            id: `new-${targetSetNumber}`,
            matchId: match.id,
            setNumber: targetSetNumber,
            scoreA: 0,
            scoreB: 0,
            isFinished: false,
            timerStatus: updated.timerStatus as any,
            durationSeconds: updated.durationSeconds,
            timerStartedAt: updated.timerStartedAt ?? undefined
          }
        ];
      });
    },
    [activeSet, match.id]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showFinishModal || showRetiredModal || isMatchFinished) return;
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
  }, [isTimerRunning, saving, showFinishModal, showRetiredModal, currentSet, isMatchFinished]);

  const effectiveTeamAInst =
    match.participantA?.institution?.name ??
    match.teamA?.institution?.name ??
    parentMatch?.participantA?.institution?.name ??
    parentMatch?.teamA?.institution?.name ??
    null;

  let athleteNamesA =
    (match.participantA?.athletes?.length ?? 0) > 0
      ? match.participantA?.athletes?.map((a: any) => a.athlete?.name).join(" & ")
      : null;

  if (!athleteNamesA && parentMatch && match.slotType) {
    const assignedSlot = match.slotType.replace(/_[12]$/, "");
    const members = parentMatch.teamA?.members?.filter((m: any) => m.assignedSlot === assignedSlot);
    if (members && members.length > 0) {
      athleteNamesA = members.map((m: any) => m.athlete?.name).join(" & ");
    }
  }

  const primaryA = effectiveTeamAInst || "Tim A";
  const secondaryA = athleteNamesA;

  const effectiveTeamBInst =
    match.participantB?.institution?.name ??
    match.teamB?.institution?.name ??
    parentMatch?.participantB?.institution?.name ??
    parentMatch?.teamB?.institution?.name ??
    null;

  let athleteNamesB =
    (match.participantB?.athletes?.length ?? 0) > 0
      ? match.participantB?.athletes?.map((a: any) => a.athlete?.name).join(" & ")
      : null;

  if (!athleteNamesB && parentMatch && match.slotType) {
    const assignedSlot = match.slotType.replace(/_[12]$/, "");
    const members = parentMatch.teamB?.members?.filter((m: any) => m.assignedSlot === assignedSlot);
    if (members && members.length > 0) {
      athleteNamesB = members.map((m: any) => m.athlete?.name).join(" & ");
    }
  }

  const primaryB = effectiveTeamBInst || "Tim B";
  const secondaryB = athleteNamesB;

  const totalSeconds = sets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalMins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const totalSecs = String(totalSeconds % 60).padStart(2, "0");

  const is00 = currentSet.scoreA === 0 && currentSet.scoreB === 0;

  return (
    <div className="w-full flex flex-col gap-2 max-h-[calc(100vh-6.5rem)] justify-between">
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
          {isMatchFinished && (
            <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
              Pertandingan Selesai
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

        {!isMatchFinished && (
          <button
            onClick={addSet}
            aria-label={sets.length === 0 ? "Mulai Set 1" : "Tambah Set Pertandingan"}
            title={sets.length === 0 ? "Mulai Set 1" : "Tambah Set Pertandingan"}
            className="ml-auto flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <Plus size={14} /> {sets.length === 0 ? "Mulai Set 1" : "Tambah Set"}
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-b-2xl rounded-tr-2xl px-4 py-8 shadow-xs flex flex-col justify-between gap-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[1fr_210px_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-center min-h-[44px] flex flex-col justify-end">
              <p className="text-lg font-bold text-gray-900 leading-tight">{primaryA}</p>
              {secondaryA && <p className="text-xs font-medium text-gray-500 mt-0.5">{secondaryA}</p>}
            </div>

            <div className="text-[100px] md:text-[120px] leading-none font-bold tabular-nums tracking-tighter text-gray-900 my-1">
              {currentSet.scoreA}
            </div>

            <button
              onClick={() => handleAddScore("scoreA")}
              disabled={saving || !isTimerRunning || isMatchFinished}
              aria-label={`Tambah 1 poin untuk ${primaryA}`}
              className={`w-full max-w-[240px] rounded-full py-4 text-2xl font-bold transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(102,255,180,0.4)] ${
                !isTimerRunning || isMatchFinished || saving
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#66FFB4] text-[#0F172A] hover:bg-[#50E69D]"
              }`}
            >
              {saving ? "..." : "+1 Point"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <SetTimerControl
              matchId={match.id}
              setNumber={sets.length === 0 ? 0 : activeSet}
              isSetCreated={sets.length > 0}
              isMatchFinished={isMatchFinished}
              initialDuration={currentSet.durationSeconds}
              initialStatus={currentSet.timerStatus as any}
              initialStartedAt={currentSet.timerStartedAt}
              onTimerUpdate={handleTimerUpdate}
            />

            <div className="text-[10px] text-gray-400 text-center font-medium">
              Match Time: <span className="font-bold text-gray-600 tabular-nums">{totalMins}:{totalSecs}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-center min-h-[44px] flex flex-col justify-end">
              <p className="text-lg font-bold text-gray-900 leading-tight">{primaryB}</p>
              {secondaryB && <p className="text-xs font-medium text-gray-500 mt-0.5">{secondaryB}</p>}
            </div>

            <div className="text-[100px] md:text-[120px] leading-none font-bold tabular-nums tracking-tighter text-gray-900 my-1">
              {currentSet.scoreB}
            </div>

            <button
              onClick={() => handleAddScore("scoreB")}
              disabled={saving || !isTimerRunning || isMatchFinished}
              aria-label={`Tambah 1 poin untuk ${primaryB}`}
              className={`w-full max-w-[240px] rounded-full py-4 text-2xl font-bold transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(102,255,180,0.4)] ${
                !isTimerRunning || isMatchFinished || saving
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#66FFB4] text-[#0F172A] hover:bg-[#50E69D]"
              }`}
            >
              {saving ? "..." : "+1 Point"}
            </button>
          </div>
        </div>

        {sets.length > 0 && (
          <div className="flex items-center gap-2 border-t pt-4 border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Set:</span>
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

      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={saving || is00 || isMatchFinished}
            aria-label="Undo Skor (Ctrl+Z)"
            title="Undo Skor (Ctrl+Z)"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <RotateCcw size={14} /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={saving || isMatchFinished}
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
            disabled={finishing || isMatchFinished}
            aria-label="Mark Match as Retired"
            className="px-4 py-2 rounded-lg border border-[#EF4444] text-xs font-semibold text-[#EF4444] hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Retired
          </button>

          <button
            onClick={() => setShowFinishModal(true)}
            disabled={finishing || isMatchFinished}
            aria-label="Selesaikan Pertandingan"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white transition shadow-md ${
              isMatchFinished ? "bg-gray-400 cursor-not-allowed" : "bg-[#2E1065] hover:bg-[#1E0A45] disabled:opacity-50"
            }`}
          >
            <CheckCircle size={15} /> {isMatchFinished ? "Pertandingan Selesai" : "Selesaikan Pertandingan"}
          </button>
        </div>
      </div>

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

export function MatchAktifSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSubMatchId, setSelectedSubMatchId] = useState<string | null>(null);
  const [showFinishBereguModal, setShowFinishBereguModal] = useState(false);
  const [isFinishingBeregu, setIsFinishingBeregu] = useState(false);
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
                      parentMatch={selected}
                      onRefresh={load}
                      onFinishSubMatch={() => setSelectedSubMatchId(null)}
                    />
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-5 border-gray-200 shadow-xs">
                    <h3 className="mb-4 text-base font-bold text-gray-900">
                      Daftar Pertandingan Beregu (Sub-Match)
                    </h3>
                    <div className="grid gap-4">
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

                        const childSets = child.sets || [];
                        const setsA = childSets.filter((s: any) => s.scoreA > s.scoreB).length;
                        const setsB = childSets.filter((s: any) => s.scoreB > s.scoreA).length;
                        const totalDuration = childSets.reduce((sum: number, s: any) => sum + (s.durationSeconds || 0), 0);
                        const durationMins = String(Math.floor(totalDuration / 60)).padStart(2, "0");
                        const durationSecs = String(totalDuration % 60).padStart(2, "0");

                        const isChildFinished = child.status === "FINISHED";
                        const instA = selected.teamA?.institution?.name || "Tim A";
                        const instB = selected.teamB?.institution?.name || "Tim B";
                        const winnerName = setsA > setsB ? instA : (setsB > setsA ? instB : null);

                        return (
                          <div
                            key={child.id}
                            className={`rounded-2xl border transition-all p-4 ${
                              isChildFinished ? "bg-gray-50/50 border-gray-200" : "bg-white border-gray-200 shadow-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#8352D9] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                                  {slotLabel}
                                </span>
                                {isChildFinished ? (
                                  <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md border border-green-200">
                                    Selesai
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                                    Belum Selesai
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {totalDuration > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                    <Timer size={13} className="text-gray-400" />
                                    <span className="tabular-nums font-semibold text-gray-700">{durationMins}:{durationSecs}</span>
                                  </div>
                                )}
                                {!isChildFinished && (
                                  <button
                                    onClick={() => setSelectedSubMatchId(child.id)}
                                    className="text-xs px-4 py-1.5 font-bold text-white transition shadow-xs hover:opacity-90 rounded-lg bg-[#8352D9]"
                                  >
                                    Buka Skor
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <p className={`text-xs font-bold ${setsA > setsB ? "text-gray-900" : "text-gray-700"}`}>
                                  {teamAAthletes}
                                </p>
                                <p className="text-[11px] text-gray-400">{instA}</p>
                              </div>

                              <div className="flex items-center gap-2 px-3.5 py-1 bg-white rounded-lg border border-gray-200 shadow-2xs">
                                <span className={`text-sm font-bold tabular-nums ${setsA > setsB ? "text-gray-900" : "text-gray-700"}`}>
                                  {setsA}
                                </span>
                                <span className="text-xs text-gray-300 font-bold">-</span>
                                <span className={`text-sm font-bold tabular-nums ${setsB > setsA ? "text-gray-900" : "text-gray-700"}`}>
                                  {setsB}
                                </span>
                              </div>

                              <div className="flex-1 text-right">
                                <p className={`text-xs font-bold ${setsB > setsA ? "text-gray-900" : "text-gray-700"}`}>
                                  {teamBAthletes}
                                </p>
                                <p className="text-[11px] text-gray-400">{instB}</p>
                              </div>
                            </div>

                            {isChildFinished && childSets.length > 0 && (
                              <div className="flex items-center justify-between bg-white rounded-xl px-3.5 py-2 border border-gray-200/70 text-xs mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sets:</span>
                                  <div className="flex items-center gap-1.5">
                                    {childSets.map((s: any) => (
                                      <span key={s.setNumber} className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                        Set {s.setNumber}: <strong className="font-bold text-gray-900">{s.scoreA}–{s.scoreB}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {winnerName && (
                                  <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                                    <Trophy size={13} className="text-green-600" />
                                    <span>Pemenang: {winnerName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 border-t pt-4 border-gray-100">
                      <button
                        onClick={() => setShowFinishBereguModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#EF4444] py-2.5 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition"
                      >
                        <CheckCircle size={15} /> Selesaikan Match Beregu
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

      {showFinishBereguModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="border-b px-6 py-4 bg-red-50">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={18} /> Selesaikan Match Beregu?
              </h3>
              <p className="text-xs text-red-800 mt-1">
                Pertandingan beregu keseluruhan akan diselesaikan dan skor dikunci.
              </p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skor Akhir Partai Beregu</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-gray-900">{selected.teamA?.institution?.name || "Tim A"}</p>
                    <p className="text-xs text-gray-500">
                      {(selected.childMatches?.filter((child: any) => {
                        const childSets = child.sets || [];
                        const setsA = childSets.filter((s: any) => s.scoreA > s.scoreB).length;
                        const setsB = childSets.filter((s: any) => s.scoreB > s.scoreA).length;
                        return child.status === "FINISHED" && setsA > setsB;
                      }).length ?? 0)} Partai Menang
                    </p>
                  </div>
                  <div className="px-3.5 py-1 bg-white rounded-lg border border-gray-300 font-bold text-base text-gray-900 tabular-nums">
                    {(selected.childMatches?.filter((child: any) => {
                      const childSets = child.sets || [];
                      const setsA = childSets.filter((s: any) => s.scoreA > s.scoreB).length;
                      const setsB = childSets.filter((s: any) => s.scoreB > s.scoreA).length;
                      return child.status === "FINISHED" && setsA > setsB;
                    }).length ?? 0)} - {(selected.childMatches?.filter((child: any) => {
                      const childSets = child.sets || [];
                      const setsA = childSets.filter((s: any) => s.scoreA > s.scoreB).length;
                      const setsB = childSets.filter((s: any) => s.scoreB > s.scoreA).length;
                      return child.status === "FINISHED" && setsB > setsA;
                    }).length ?? 0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-900">{selected.teamB?.institution?.name || "Tim B"}</p>
                    <p className="text-xs text-gray-500">
                      {(selected.childMatches?.filter((child: any) => {
                        const childSets = child.sets || [];
                        const setsA = childSets.filter((s: any) => s.scoreA > s.scoreB).length;
                        const setsB = childSets.filter((s: any) => s.scoreB > s.scoreA).length;
                        return child.status === "FINISHED" && setsB > setsA;
                      }).length ?? 0)} Partai Menang
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Pastikan seluruh partai yang perlu dimainkan sudah selesai. Skor pertandingan beregu ini akan dikunci dan pemenang akan otomatis dicatat di sistem.
              </p>
            </div>

            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowFinishBereguModal(false)}
                disabled={isFinishingBeregu}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setIsFinishingBeregu(true);
                  try {
                    await finishMatch(selected.id, {});
                    setShowFinishBereguModal(false);
                    load();
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Gagal menyelesaikan match beregu");
                  } finally {
                    setIsFinishingBeregu(false);
                  }
                }}
                disabled={isFinishingBeregu}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#EF4444] hover:bg-red-600 transition disabled:opacity-50 shadow-md"
              >
                {isFinishingBeregu ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Menyelesaikan...</span>
                  </>
                ) : (
                  "Ya, Selesaikan Match Beregu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
