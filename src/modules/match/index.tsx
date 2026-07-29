"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MatchTabs } from "./components/MatchTabs";
import { ThemeToggle } from "./components/ThemeToggle";
import { getMatches } from "@/lib/api/matches";
import { useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";

/**
 * Pertandingan (matches) page module root.
 * Supports Light Mode (Figma design) and Dark Mode toggle.
 * The app router renders this from `app/pertandingan/page.tsx`.
 */
export default function MatchPage() {
  const [ongoingCount, setOngoingCount] = useState<number>(0);
  const [isLight, setIsLight] = useState(false);
  const { lastUpdate } = useGlobalPanitiaRoom();

  const fetchOngoingCount = useCallback(async () => {
    try {
      const data = await getMatches({ status: "ONGOING" });
      setOngoingCount(data ? data.length : 0);
    } catch (err) {
      console.error("Gagal mengambil jumlah match berlangsung:", err);
    }
  }, []);

  useEffect(() => {
    fetchOngoingCount();
  }, [fetchOngoingCount, lastUpdate]);

  // Polling fallback every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchOngoingCount, 15000);
    return () => clearInterval(interval);
  }, [fetchOngoingCount]);

  return (
    <>
      <Navbar variant={isLight ? "light" : "dark"} />

      <main
        className={`relative pt-28 pb-24 transition-colors duration-300 ${
          isLight
            ? "bg-gradient-to-b from-[#fffdf7] to-[#f5f5f5]"
            : "bg-linear-to-b from-[#1A162B] to-[#0F0E1A]"
        }`}
      >
        {/* Radial amber glow — visible in both modes but more prominent in light */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-full max-w-5xl transition-opacity duration-300 ${
            isLight ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,159,39,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <header className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center gap-2">
          {/* Live count badge */}
          {isLight ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#fee685] bg-[#fffbeb] px-4 py-1.5 text-xs font-semibold text-[#bb4d00] shadow-[0px_3px_6px_0px_rgba(139,92,246,0.02)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FB2C36]" />
              </span>
              {ongoingCount} match berlangsung
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#EF9F27]/30 bg-[#EF9F27]/12 px-4 py-1.5 text-xs font-medium text-[#FAC775]">
              <span className="h-2 w-2 rounded-full bg-[#FB2C36] animate-pulse" />
              {ongoingCount} match berlangsung
            </span>
          )}

          <div className="flex flex-col gap-2">
            <h1
              className={`text-4xl font-black italic sm:text-6xl lg:text-[64px] tracking-[-2.25px] leading-[1.1] transition-colors duration-300 ${
                isLight ? "text-[#1a162b]" : "text-white"
              }`}
            >
              Pertandingan
            </h1>
            <p
              className={`text-base transition-colors duration-300 ${
                isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#8A8A93]"
              }`}
            >
              Live score, jadwal, bagan knockout, dan klasemen.
            </p>
          </div>

          {/* Theme toggle — placed below the heading for accessibility */}
          <div className="mt-4">
            <ThemeToggle isLight={isLight} onToggle={() => setIsLight((v) => !v)} />
          </div>
        </header>

        {/* Tabs + live score list */}
        <div className="relative mt-10">
          <MatchTabs isLight={isLight} />
        </div>
      </main>

      <Footer />
    </>
  );
}
