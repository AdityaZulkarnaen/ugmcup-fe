"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "ugmcup_match_theme";

/**
 * Persistent theme hook for match-related pages (Pertandingan & Match Detail).
 *
 * Reads the last chosen theme from `localStorage` on mount (default: light).
 * Every toggle writes back to `localStorage` so the preference survives
 * navigation between /pertandingan and /pertandingan/[id].
 *
 * Using a `storage` event listener also keeps two tabs in sync, though that
 * is a nice-to-have rather than a hard requirement.
 */
export function useMatchTheme() {
  const [isLight, setIsLight] = useState<boolean>(true);
  // Track whether we've read from localStorage yet to avoid a flash
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first render (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsLight(stored === "light");
      }
    } catch {
      // localStorage unavailable (e.g. private browsing edge cases)
    }
    setHydrated(true);
  }, []);

  // Persist every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
    } catch {
      // ignore write errors
    }
  }, [isLight, hydrated]);

  // Keep other tabs/windows in sync via the storage event
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setIsLight(e.newValue === "light");
      }
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const toggle = () => setIsLight((v) => !v);

  return { isLight, toggle, hydrated };
}
