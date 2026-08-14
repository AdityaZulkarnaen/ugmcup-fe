"use client";

import { useState, useEffect, useCallback } from "react";

// ── Storage key ────────────────────────────────────────────────────────────
// Ubah versi (v3, v4, …) untuk invalidate cache lama saat ada breaking change.
const STORAGE_KEY = "ugmcup_match_filters_v3";

// ── Shape yang disimpan ────────────────────────────────────────────────────
interface PersistedFilters {
  tab: string;
  /** "" = otomatis pilih hari ini, "all" = semua hari, "YYYY-MM-DD" = hari tertentu */
  schedDay: string;
  schedCategory: string;
  schedLevel: string;
  schedPage: number;
  bracketLevel: string;
  bracketDiscipline: string;
  standingsDiscipline: string;
  playerLevel: string;
  playerDiscipline: string;
  playerSearch: string;
  playerPage: number;
}

const DEFAULTS: PersistedFilters = {
  tab: "jadwal",
  schedDay: "",           // "" → SchedulePanel akan auto-pilih hari ini
  schedCategory: "all",
  schedLevel: "all",
  schedPage: 1,
  bracketLevel: "univ",
  bracketDiscipline: "",
  standingsDiscipline: "",
  playerLevel: "ALL",
  playerDiscipline: "ALL",
  playerSearch: "",
  playerPage: 1,
};

// ── sessionStorage helpers ─────────────────────────────────────────────────
function readStorage(): PersistedFilters {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    // Merge dengan DEFAULTS agar field baru (versi baru) tidak undefined
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function writeStorage(state: PersistedFilters): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* Private / storage penuh — abaikan */ }
}

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * Hook tunggal untuk state filter halaman Pertandingan.
 *
 * State disimpan di React `useState` + `sessionStorage` — **tidak** bergantung
 * pada `useRouter`, `router.push/replace`, atau `useSearchParams`.
 *
 * Keuntungan vs URL-params:
 * - Tidak ada masalah stale router di production (Vercel/VPS)
 * - Tidak ada hydration mismatch antara SSR dan client
 * - Filter tetap tersimpan saat navigasi ke halaman lain dan kembali
 * - Tombol refresh → sessionStorage kosong → auto-select hari ini (bersih)
 *
 * Kekurangan (trade-off yang diterima):
 * - URL tidak mencerminkan filter → link tidak bisa di-share dengan filter
 * - Tombol Back browser antar tab tidak bekerja
 */
export function useMatchFilters() {
  const [state, setStateRaw] = useState<PersistedFilters>(() => {
    return typeof window !== "undefined" ? readStorage() : DEFAULTS;
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Pastikan sinkron dengan storage setelah hydration
  useEffect(() => {
    setStateRaw(readStorage());
    setIsHydrated(true);
  }, []);

  /** Update partial state + persist ke sessionStorage secara atomik. */
  const update = useCallback((patch: Partial<PersistedFilters>) => {
    setStateRaw((prev) => {
      const next = { ...prev, ...patch };
      writeStorage(next);
      return next;
    });
  }, []);

  // ── Nilai yang di-expose ────────────────────────────────────────────────
  // schedDay "" (default) → tampilkan "all" di dropdown sementara SchedulePanel
  // menjalankan auto-select → sangat singkat, tidak terasa.
  const schedDay = state.schedDay === "" ? "all" : state.schedDay;
  /** true saat belum ada hari yang dipilih user; SchedulePanel akan auto-pilih. */
  const schedDayIsDefault = state.schedDay === "";

  // ── Setter (API identik dengan versi URL-params) ────────────────────────
  const setTab = (v: string) => update({ tab: v });

  const setSchedDay      = (v: string) => update({ schedDay: v, schedPage: 1 });
  const setSchedCategory = (v: string) => update({ schedCategory: v, schedPage: 1 });
  const setSchedLevel    = (v: string) => update({ schedLevel: v, schedPage: 1 });
  const setSchedPage     = (v: number) => update({ schedPage: v });

  const setBracketLevel      = (v: string) => update({ bracketLevel: v });
  const setBracketDiscipline = (v: string) => update({ bracketDiscipline: v });

  const setStandingsDiscipline = (v: string) => update({ standingsDiscipline: v });

  const setPlayerLevel      = (v: string) => update({ playerLevel: v, playerDiscipline: "ALL", playerPage: 1 });
  const setPlayerDiscipline = (v: string) => update({ playerDiscipline: v, playerPage: 1 });
  const setPlayerSearch     = (v: string) => update({ playerSearch: v, playerPage: 1 });
  const setPlayerPage       = (v: number) => update({ playerPage: v });

  // ── Reset ───────────────────────────────────────────────────────────────
  /**
   * Reset filter jadwal ke setelan awal.
   * schedDay di-set ke "" agar auto-select hari ini berjalan ulang.
   */
  const resetSchedFilters = () => update({
    schedDay: "",
    schedCategory: "all",
    schedLevel: "all",
    schedPage: 1,
  });
  const resetBracketFilters = () => update({
    bracketLevel: "univ",
    bracketDiscipline: "",
  });
  const resetStandingsFilters = () => update({ standingsDiscipline: "" });
  const resetPlayerFilters = () => update({
    playerLevel: "ALL",
    playerDiscipline: "ALL",
    playerSearch: "",
    playerPage: 1,
  });

  // ── Flag "masih di default?" ────────────────────────────────────────────
  const bracketIsDefault =
    state.bracketLevel === "univ" && state.bracketDiscipline === "";
  const standingsIsDefault = state.standingsDiscipline === "";
  const playerIsDefault =
    state.playerLevel === "ALL" &&
    state.playerDiscipline === "ALL" &&
    state.playerSearch === "" &&
    state.playerPage === 1;

  return {
    isHydrated,

    tab: state.tab,
    setTab,

    schedDay,
    schedDayIsDefault,
    schedCategory: state.schedCategory,
    schedLevel: state.schedLevel,
    schedPage: state.schedPage,
    setSchedDay,
    setSchedCategory,
    setSchedLevel,
    setSchedPage,

    bracketLevel: state.bracketLevel,
    bracketDiscipline: state.bracketDiscipline,
    setBracketLevel,
    setBracketDiscipline,

    standingsDiscipline: state.standingsDiscipline,
    setStandingsDiscipline,

    playerLevel: state.playerLevel,
    playerDiscipline: state.playerDiscipline,
    playerSearch: state.playerSearch,
    playerPage: state.playerPage,
    setPlayerLevel,
    setPlayerDiscipline,
    setPlayerSearch,
    setPlayerPage,

    resetSchedFilters,
    resetBracketFilters,
    resetStandingsFilters,
    resetPlayerFilters,
    bracketIsDefault,
    standingsIsDefault,
    playerIsDefault,
  };
}
