import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getMatchDetail } from "@/lib/constants/matches";
import { MatchScoreboard } from "./components/MatchScoreboard";
import { MatchDetailTabs } from "./components/MatchDetailTabs";

/**
 * Match statistics page module root.
 * Reached by clicking a live score card or a schedule row; the app router
 * renders this from `app/pertandingan/[id]/page.tsx`.
 */
export default function MatchDetailPage({ id }: { id: string }) {
  const match = getMatchDetail(id);
  if (!match) notFound();

  return (
    <>
      <Navbar variant="dark" />

      <main className="relative bg-linear-to-b from-[#1A162B] to-[#0F0E1A] pt-28 pb-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6">
          <header className="text-center">
            <h1 className="text-5xl font-black italic text-white sm:text-7xl">
              Statistik Pertandingan
            </h1>
            <p className="mt-3 text-sm text-[#8A8A93] sm:text-base">
              Ringkasan hasil akhir, skor per set, dan lokasi pertandingan.
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-4">
            <MatchScoreboard match={match} />
            <MatchDetailTabs match={match} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
