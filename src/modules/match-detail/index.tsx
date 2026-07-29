"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronIcon } from "@/components/ui/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { MatchDetailTabs } from "./components/MatchDetailTabs";

export default function MatchDetailPage({ id }: { id: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getMatch(id);
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
        <Navbar variant="dark" />
        <main className="relative min-h-screen bg-linear-to-b from-[#1A162B] to-[#0F0E1A] pt-28 pb-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-white/[0.02]" />
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
      <Navbar variant="dark" />

      <main className="relative bg-linear-to-b from-[#1A162B] to-[#0F0E1A] pt-28 pb-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6">
          <Link
            href="/pertandingan"
            className="group flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] py-2 pl-2.5 pr-4 text-xs font-semibold text-[#8A8A93] transition-colors hover:border-white/20 hover:text-white active:bg-white/[0.06]"
          >
            <ChevronIcon className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Kembali
          </Link>

          <MatchDetailTabs initialMatch={match} />
        </div>
      </main>

      <Footer />
    </>
  );
}
