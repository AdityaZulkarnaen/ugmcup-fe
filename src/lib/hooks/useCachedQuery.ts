"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_TTL_MS, fetchWithCache, readCache } from "@/lib/api/cache";

interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: unknown;
}

function stateFromCache<T>(key: string | null, ttlMs: number): QueryState<T> {
  if (!key) return { data: undefined, isLoading: false, error: null };
  const cached = readCache<T>(key, ttlMs);
  // Ada isian cache → tampilkan langsung, tanpa status loading.
  return { data: cached?.data, isLoading: cached === undefined, error: null };
}

export interface UseCachedQueryResult<T> {
  data: T | undefined;
  /** Hanya true kalau belum ada apa pun untuk ditampilkan. */
  isLoading: boolean;
  error: unknown;
  /** Paksa ambil ulang dari server, mengabaikan TTL. */
  refresh: () => void;
}

/**
 * Ambil data GET dengan cache in-memory bersama antar komponen.
 *
 * Key yang sudah pernah diambil langsung tampil tanpa loading; kalau isinya
 * sudah melewati TTL, data lama tetap ditampilkan sementara versi barunya
 * diambil diam-diam di belakang layar.
 *
 * `key` boleh `null` untuk menunda permintaan (mis. filter belum siap).
 */
export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: { ttlMs?: number } = {}
): UseCachedQueryResult<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  const [state, setState] = useState<QueryState<T>>(() =>
    stateFromCache<T>(key, ttlMs)
  );
  const [activeKey, setActiveKey] = useState(key);
  const [refreshToken, setRefreshToken] = useState(0);

  // Key berganti (pindah kategori/jenjang) — ambil dari cache saat render juga,
  // supaya tidak ada kedipan loading untuk data yang sudah pernah dibuka.
  if (activeKey !== key) {
    setActiveKey(key);
    setState(stateFromCache<T>(key, ttlMs));
    setRefreshToken(0);
  }

  // `fetcher` biasanya arrow inline yang berubah tiap render; simpan di ref
  // agar effect hanya bergantung pada key.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!key) return;

    const cached = readCache<T>(key, ttlMs);
    // Masih segar dan bukan refresh manual — tidak perlu menembak jaringan.
    if (cached && !cached.isStale && refreshToken === 0) return;

    let cancelled = false;

    fetchWithCache<T>(key, () => fetcherRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((prev) => ({ data: prev.data, isLoading: false, error }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, ttlMs, refreshToken]);

  const refresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}
