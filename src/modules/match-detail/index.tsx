import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronIcon } from "@/components/ui/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getMatchDetail } from "@/lib/constants/matches";
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
          <Link
            href="/pertandingan"
            className="group flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] py-2 pl-2.5 pr-4 text-xs font-semibold text-[#8A8A93] transition-colors hover:border-white/20 hover:text-white active:bg-white/[0.06]"
          >
            <ChevronIcon className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Kembali
          </Link>

          {/* Header, scoreboard and panels live together: the subtitle changes
              with the open tab. */}
          <MatchDetailTabs match={match} />
        </div>
      </main>

      <Footer />
    </>
  );
}
