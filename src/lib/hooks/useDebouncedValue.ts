"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Jeda standar untuk seluruh search bar. Cukup panjang untuk melewati jeda
 * antar ketikan, masih cukup pendek supaya hasilnya terasa langsung muncul.
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Salinan `value` yang baru ikut berubah setelah `delay` ms tanpa perubahan
 * baru — perubahan terakhir yang menang.
 *
 * Polanya: input tetap memakai state aslinya supaya tiap ketikan langsung
 * terlihat, sedangkan pekerjaan mahalnya — memfilter daftar panjang, menulis
 * URL, memanggil API — dipasangkan ke nilai balikan hook ini sehingga hanya
 * jalan sekali setelah pengguna berhenti mengetik.
 *
 * Jangan pakai nilai ini untuk `value` input-nya sendiri: kursor akan terasa
 * tertinggal karena karakter yang baru diketik belum ikut terbawa.
 */
export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Bungkus `callback` sehingga hanya dijalankan setelah `delay` ms tanpa
 * panggilan baru — panggilan terakhir yang menang, argumennya ikut yang
 * terakhir.
 *
 * Dipakai saat efek ketikan bukan sekadar menghitung ulang tampilan, melainkan
 * tindakan yang tidak boleh diulang-ulang: menulis URL, memanggil API. Untuk
 * sekadar menunda hasil filter, [useDebouncedValue] lebih sederhana.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = SEARCH_DEBOUNCE_MS
) {
  const latest = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selalu jalankan versi terbaru: `callback` biasanya ditulis inline sehingga
  // identitasnya berubah tiap render, sedangkan fungsi balikan hook ini stabil.
  useEffect(() => {
    latest.current = callback;
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay]
  );
}
