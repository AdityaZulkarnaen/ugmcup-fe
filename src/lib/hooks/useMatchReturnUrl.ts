"use client";

/**
 * Filter halaman Pertandingan kini disimpan di sessionStorage oleh
 * `useMatchFilters`, sehingga cukup kembali ke `/pertandingan` dan filter
 * akan dipulihkan otomatis saat komponen mount.
 *
 * `useSaveMatchUrl` dipertahankan sebagai no-op agar MatchTabs tidak perlu
 * diubah.
 */
export function useSaveMatchUrl() {
  // No-op — tidak ada yang perlu disimpan; filter sudah persisten via sessionStorage.
}

/** URL yang dipakai tombol "Kembali" di halaman detail pertandingan. */
export function getMatchReturnUrl(): string {
  return "/pertandingan";
}
