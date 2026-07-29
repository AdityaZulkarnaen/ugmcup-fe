"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { liveMatches } from "@/lib/constants/matches";
import { MatchTabs } from "./components/MatchTabs";
import { ThemeToggle } from "./components/ThemeToggle";

/**
 * Pertandingan (matches) page module root.
 * Supports Light Mode (Figma design) and Dark Mode toggle.
 * The app router renders this from `app/pertandingan/page.tsx`.
 */
export default function MatchPage() {
  const liveCount = liveMatches.length;
  const [isLight, setIsLight] = useState(false);

  return (
    <>
      <Navbar variant={isLight ? "light" : "dark"} />

      <main
        className={`relative pt-28 pb-24 transition-colors duration-300 ${isLight
            ? "bg-gradient-to-b from-[#FBFAFF] to-[#f5f5f5]"
            : "bg-linear-to-b from-[#1A162B] to-[#0F0E1A]"
          }`}
      >
        {/* Radial violet glow — visible in both modes but more prominent in light */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-full max-w-5xl transition-opacity duration-300 ${isLight ? "opacity-100" : "opacity-0"
            }`}
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,92,255,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <header className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center gap-2">
          {/* Live count badge */}
          {isLight ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9D3FF] bg-[#F3F0FF] px-4 py-1.5 text-xs font-semibold text-[#6C47D1] shadow-[0px_3px_6px_0px_rgba(139,92,246,0.02)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FB2C36]" />
              </span>
              {liveCount} match berlangsung
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#02F5D4]/30 bg-[#02F5D4]/12 px-4 py-1.5 text-xs font-medium text-[#5CFCE7]">
              <span className="h-2 w-2 rounded-full bg-[#FB2C36]" />
              {liveCount} match berlangsung
            </span>
          )}

          <div className="flex flex-col gap-2">
            <h1
              className={`text-4xl font-black italic sm:text-6xl lg:text-[64px] tracking-[-2.25px] leading-[1.1] transition-colors duration-300 ${isLight ? "text-[#1a162b]" : "text-white"
                }`}
            >
              Pertandingan
            </h1>
            <p
              className={`text-base transition-colors duration-300 ${isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#8A8A93]"
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
