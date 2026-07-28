import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { liveMatches } from "@/lib/constants/matches";
import { MatchTabs } from "./components/MatchTabs";

/**
 * Pertandingan (matches) page module root.
 * Dark interior page: header + tabbed live-score view + footer.
 * The app router renders this from `app/pertandingan/page.tsx`.
 */
export default function MatchPage() {
  const liveCount = liveMatches.length;

  return (
    <>
      <Navbar variant="dark" />

      {/* No `overflow-hidden` here: it would clip the filter dropdowns at the
          footer edge when a panel is short. Clip decorations locally instead. */}
      <main className="relative bg-linear-to-b from-[#1A162B] to-[#0F0E1A] pt-28 pb-24">

        {/* Header */}
        <header className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#EF9F27]/30 bg-[#EF9F27]/12 px-4 py-1.5 text-xs font-medium text-[#FAC775]">
            <span className="h-2 w-2 rounded-full bg-[#FB2C36]" />
            {liveCount} match berlangsung
          </span>

          {/* "Pertandingan" is one long word: too large a step and it overflows
              a 360px screen instead of wrapping. */}
          <h1 className="mt-5 text-4xl font-black italic text-white sm:text-6xl lg:text-7xl">
            Pertandingan
          </h1>
          {/* <p className="mt-3 text-sm text-[#8A8A93] sm:text-base">
            Live score, jadwal, bagan knockout, dan klasemen.
          </p> */}
        </header>

        {/* Tabs + live score list */}
        <div className="relative mt-12">
          <MatchTabs />
        </div>
      </main>

      <Footer />
    </>
  );
}
