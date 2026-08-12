"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "ugmcup_match_return_url";

/**
 * Simpan URL halaman pertandingan (dengan semua filter params) ke sessionStorage
 * setiap kali URL-nya berubah. Dipanggil di dalam halaman `/pertandingan`.
 */
export function useSaveMatchUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname.startsWith("/pertandingan") || pathname !== "/pertandingan") {
      return;
    }
    const qs = searchParams.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    try {
      sessionStorage.setItem(STORAGE_KEY, url);
    } catch {
      // sessionStorage mungkin tidak tersedia (private mode ketat)
    }
  }, [pathname, searchParams]);
}

/**
 * Baca URL kembali ke halaman pertandingan yang tersimpan.
 * Fallback ke "/pertandingan" jika belum ada.
 */
export function getMatchReturnUrl(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "/pertandingan";
  } catch {
    return "/pertandingan";
  }
}
