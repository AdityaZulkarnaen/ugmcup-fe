"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Semua kunci URL search param yang dipakai di halaman Pertandingan.
 * Dipusatkan di sini agar tidak ada typo antar komponen.
 */
export const MATCH_PARAM = {
  tab: "tab",
  /** SchedulePanel */
  schedDay: "hari",
  schedCategory: "kategori",
  schedLevel: "jenjang",
  schedPage: "halaman",
  /** BracketPanel */
  bracketLevel: "bagan_jenjang",
  bracketDiscipline: "bagan_kategori",
  /** StandingsPanel */
  standingsDiscipline: "klasemen_kategori",
  /** PlayerPanel */
  playerLevel: "pemain_jenjang",
  playerDiscipline: "pemain_kategori",
  playerSearch: "pemain_cari",
  playerPage: "pemain_halaman",
} as const;

/** Baca satu param dari URLSearchParams dengan fallback. */
function getParam(
  params: URLSearchParams,
  key: string,
  fallback: string
): string {
  return params.get(key) ?? fallback;
}

/**
 * Hook tunggal untuk membaca & memperbarui filter halaman Pertandingan via URL.
 *
 * Setiap setter hanya mengubah param yang bersangkutan; param lain tetap utuh.
 * Navigasi dilakukan dengan `router.push` (bukan replace) sehingga browser
 * menyimpan histori — tombol Back akan mengembalikan filter sebelumnya.
 */
export function useMatchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /** Buat URLSearchParams baru berdasar state sekarang + patch. */
  const buildQuery = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v === undefined) {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      return next.toString();
    },
    [searchParams]
  );

  const push = useCallback(
    (patch: Record<string, string>) => {
      const qs = buildQuery(patch);
      startTransition(() => {
        router.push(`${pathname}?${qs}`, { scroll: false });
      });
    },
    [buildQuery, router, pathname]
  );

  // ── Nilai saat ini ───────────────────────────────────────────────────────
  const tab = getParam(searchParams, MATCH_PARAM.tab, "jadwal");

  // Schedule
  const schedDay = getParam(searchParams, MATCH_PARAM.schedDay, "all");
  /** true hanya saat URL tidak punya param `hari` sama sekali (belum di-set user). */
  const schedDayIsDefault = searchParams.get(MATCH_PARAM.schedDay) === null;
  const schedCategory = getParam(
    searchParams,
    MATCH_PARAM.schedCategory,
    "all"
  );
  const schedLevel = getParam(searchParams, MATCH_PARAM.schedLevel, "all");
  const schedPage = Number(
    getParam(searchParams, MATCH_PARAM.schedPage, "1")
  );

  // Bracket
  const bracketLevel = getParam(
    searchParams,
    MATCH_PARAM.bracketLevel,
    "univ"
  );
  const bracketDiscipline = getParam(
    searchParams,
    MATCH_PARAM.bracketDiscipline,
    ""
  );

  // Standings
  const standingsDiscipline = getParam(
    searchParams,
    MATCH_PARAM.standingsDiscipline,
    ""
  );

  // Player
  const playerLevel = getParam(
    searchParams,
    MATCH_PARAM.playerLevel,
    "ALL"
  );
  const playerDiscipline = getParam(
    searchParams,
    MATCH_PARAM.playerDiscipline,
    "ALL"
  );
  const playerSearch = getParam(searchParams, MATCH_PARAM.playerSearch, "");
  const playerPage = Number(
    getParam(searchParams, MATCH_PARAM.playerPage, "1")
  );

  // ── Setter ───────────────────────────────────────────────────────────────
  const setTab = (v: string) => push({ [MATCH_PARAM.tab]: v });

  // Schedule setters
  const setSchedDay = (v: string) =>
    push({ [MATCH_PARAM.schedDay]: v, [MATCH_PARAM.schedPage]: "1" });
  const setSchedCategory = (v: string) =>
    push({ [MATCH_PARAM.schedCategory]: v, [MATCH_PARAM.schedPage]: "1" });
  const setSchedLevel = (v: string) =>
    push({ [MATCH_PARAM.schedLevel]: v, [MATCH_PARAM.schedPage]: "1" });
  const setSchedPage = (v: number) =>
    push({ [MATCH_PARAM.schedPage]: String(v) });

  // Bracket setters
  const setBracketLevel = (v: string) =>
    push({ [MATCH_PARAM.bracketLevel]: v });
  const setBracketDiscipline = (v: string) =>
    push({ [MATCH_PARAM.bracketDiscipline]: v });

  // Standings setters
  const setStandingsDiscipline = (v: string) =>
    push({ [MATCH_PARAM.standingsDiscipline]: v });

  // Player setters
  const setPlayerLevel = (v: string) =>
    push({
      [MATCH_PARAM.playerLevel]: v,
      [MATCH_PARAM.playerDiscipline]: "ALL",
      [MATCH_PARAM.playerPage]: "1",
    });
  const setPlayerDiscipline = (v: string) =>
    push({ [MATCH_PARAM.playerDiscipline]: v, [MATCH_PARAM.playerPage]: "1" });
  const setPlayerSearch = (v: string) =>
    push({ [MATCH_PARAM.playerSearch]: v, [MATCH_PARAM.playerPage]: "1" });
  const setPlayerPage = (v: number) =>
    push({ [MATCH_PARAM.playerPage]: String(v) });

  return {
    isPending,

    tab,
    setTab,

    schedDay,
    schedDayIsDefault,
    schedCategory,
    schedLevel,
    schedPage,
    setSchedDay,
    setSchedCategory,
    setSchedLevel,
    setSchedPage,

    bracketLevel,
    bracketDiscipline,
    setBracketLevel,
    setBracketDiscipline,

    standingsDiscipline,
    setStandingsDiscipline,

    playerLevel,
    playerDiscipline,
    playerSearch,
    playerPage,
    setPlayerLevel,
    setPlayerDiscipline,
    setPlayerSearch,
    setPlayerPage,
  };
}
