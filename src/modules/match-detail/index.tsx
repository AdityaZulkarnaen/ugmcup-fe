"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronIcon } from "@/components/ui/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPublicMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { MatchDetailTabs } from "./components/MatchDetailTabs";
import { FloatingThemeToggle } from "@/modules/match/components/FloatingThemeToggle";
import { useMatchTheme } from "@/lib/hooks/useMatchTheme";
import { getMatchReturnUrl } from "@/lib/hooks/useMatchReturnUrl";

export default function MatchDetailPage({ id }: { id: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isLight, toggle } = useMatchTheme();
  // Baca URL kembali dari sessionStorage (termasuk semua filter params).
  // useState + useEffect agar tidak crash saat SSR.
  const [backUrl, setBackUrl] = useState("/pertandingan");
  useEffect(() => { setBackUrl(getMatchReturnUrl()); }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getPublicMatch(id);
        if (isMounted) {
          if (!data) setError(true);
          else setMatch(data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail match:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar variant={isLight ? "light" : "dark"} />
        <main
          className={`relative min-h-screen pt-28 pb-24 transition-colors duration-300 ${
            isLight
              ? "bg-gradient-to-b from-[#FBFAFF] to-[#f5f5f5]"
              : "bg-linear-to-b from-[#1A162B] to-[#0F0E1A]"
          }`}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
            <div
              className={`h-8 w-24 animate-pulse rounded-full ${
                isLight ? "bg-[#1a162b]/10" : "bg-white/10"
              }`}
            />
            <div
              className={`h-64 w-full animate-pulse rounded-2xl ${
                isLight ? "bg-[#1a162b]/[0.02]" : "bg-white/[0.02]"
              }`}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !match) {
    notFound();
  }

  return (
    <>
      <Navbar variant={isLight ? "light" : "dark"} />

      <main
        className={`relative pt-28 pb-24 transition-colors duration-300 ${
          isLight
            ? "bg-gradient-to-b from-[#FBFAFF] to-[#f5f5f5]"
            : "bg-linear-to-b from-[#1A162B] to-[#0F0E1A]"
        }`}
      >
        {/* Radial violet glow — light mode only */}
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

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6">
          <div>
            <Link
              href={backUrl}
              className={`group flex w-fit items-center gap-1.5 rounded-full border py-2 pl-2.5 pr-4 text-xs font-semibold transition-colors ${
                isLight
                  ? "border-[rgba(0,0,0,0.1)] bg-white text-[#6B6B73] hover:border-[rgba(0,0,0,0.2)] hover:text-[#1a162b] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)]"
                  : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] hover:border-white/20 hover:text-white"
              }`}
            >
              <ChevronIcon className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
              Kembali
            </Link>
          </div>

          <MatchDetailTabs initialMatch={match} isLight={isLight} />
        </div>
      </main>

      <FloatingThemeToggle isLight={isLight} onToggle={toggle} />

      <Footer />
    </>
  );
}
