/**
 * Cache in-memory sederhana untuk hasil GET API.
 *
 * Tujuannya supaya pindah tab / pindah filter tidak memicu loading ulang:
 * data yang sudah pernah diambil dipakai langsung, lalu di-refresh diam-diam
 * di belakang layar kalau umurnya sudah melewati TTL (stale-while-revalidate).
 *
 * Cache hidup selama tab browser terbuka saja — reload halaman = mulai bersih.
 */

/** Umur wajar sebelum data dianggap basi dan perlu di-refresh diam-diam. */
export const DEFAULT_TTL_MS = 60_000;

/**
 * Key cache halaman Pertandingan. Ditulis terpusat supaya panel yang butuh
 * data sama (mis. Jadwal & Player sama-sama butuh daftar match) benar-benar
 * memakai key yang identik dan ikut menikmati cache yang sama.
 */
export const cacheKeys = {
  matches: "matches:all",
  athletes: "athletes:all",
  bracket: (disciplineId: string) => `bracket:${disciplineId}`,
  standings: (disciplineId: string) => `standings:${disciplineId}`,
} as const;

interface CacheEntry {
  data: unknown;
  storedAt: number;
}

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export interface CachedValue<T> {
  data: T;
  isStale: boolean;
}

/** Baca cache tanpa menembak jaringan. `undefined` berarti belum pernah diambil. */
export function readCache<T>(
  key: string,
  ttlMs: number = DEFAULT_TTL_MS
): CachedValue<T> | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  return {
    data: entry.data as T,
    isStale: Date.now() - entry.storedAt > ttlMs,
  };
}

/**
 * Jalankan `fetcher` lalu simpan hasilnya ke cache. Permintaan dengan key yang
 * sama dan masih berjalan akan dipakai bersama, jadi dua panel yang butuh data
 * sama tidak menembak endpoint dua kali.
 */
export function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const request = fetcher()
    .then((data) => {
      store.set(key, { data, storedAt: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

/**
 * Buang cache. Tanpa argumen membuang semuanya; dengan `keyPrefix` hanya key
 * yang diawali prefix tersebut (mis. `"matches"` setelah admin mengubah skor).
 */
export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}
