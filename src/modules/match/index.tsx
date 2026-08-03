"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MatchTabs } from "./components/MatchTabs";
import { FloatingThemeToggle } from "./components/FloatingThemeToggle";
import { useMatchTheme } from "@/lib/hooks/useMatchTheme";
import { Calendar } from "lucide-react";

/**
 * Pertandingan (matches) page module root.
 * Supports Light Mode (Figma design) and Dark Mode toggle.
 * The app router renders this from `app/pertandingan/page.tsx`.
 */
export default function MatchPage() {
  const { isLight, toggle } = useMatchTheme();

  return (
    <>
      <Navbar variant={isLight ? "light" : "dark"} />

      <main
        className={`relative pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 transition-colors duration-300 ${
          isLight
            ? "bg-gradient-to-b from-[#FBFAFF] to-[#f5f5f5]"
            : "bg-linear-to-b from-[#1A162B] to-[#0F0E1A]"
        }`}
      >
        {/* Radial violet glow — visible in both modes but more prominent in light */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-full max-w-5xl transition-opacity duration-300 ${
            isLight ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,92,255,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <header className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center gap-2">
          {/* Calendar badge */}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${
              isLight
                ? "border-[#D9D3FF] bg-[#F3F0FF] text-[#6C47D1]"
                : "border-[#02F5D4]/30 bg-[#02F5D4]/12 text-[#5CFCE7]"
            }`}
          >
            <Calendar size={14} />
            Jadwal & Klasemen UGM CUP
          </span>

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
              Jadwal, bagan knockout, player stats, dan klasemen.
            </p>
          </div>


        </header>

        {/* Tabs + panels */}
        <div className="relative mt-8 sm:mt-12 lg:mt-18">
          <MatchTabs isLight={isLight} />
        </div>
      </main>

      <FloatingThemeToggle isLight={isLight} onToggle={toggle} />

      <Footer />
    </>
  );
}
