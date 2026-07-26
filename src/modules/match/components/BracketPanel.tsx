"use client";

import { useState } from "react";
import { bracketRounds, type BracketRound } from "@/lib/constants/matches";
import { ChevronIcon } from "@/components/ui/icons";
import { BracketChampionCard, BracketMatchCard } from "./BracketMatchCard";

const roundLabel =
  "text-[11px] font-bold uppercase tracking-wider text-[#E3B24D]";

const connector = "absolute bg-white/12";

/** Card of a round, or the champion box for the last column. */
function RoundCard({ round, index }: { round: BracketRound; index: number }) {
  if (round.champion) {
    return (
      <BracketChampionCard
        label={round.champion.label}
        name={round.champion.name}
      />
    );
  }
  return <BracketMatchCard match={round.matches[index]} />;
}

/**
 * One round column of the desktop bracket.
 *
 * Every card sits in an equal-height `flex-1` slot, so a slot here is exactly
 * twice as tall as the two slots feeding it. That makes the feeder centres land
 * on 25% and 75% of this slot — the two ends of the vertical fork line. The
 * elbow meets in the middle of the 12px column gap, 6px on each side.
 */
function RoundColumn({
  round,
  slotCount,
  feederCount,
  isLast,
}: {
  round: BracketRound;
  slotCount: number;
  feederCount: number;
  isLast: boolean;
}) {
  /** Two feeders per slot means the incoming line forks; 1-to-1 stays straight. */
  const forked = feederCount === slotCount * 2;

  return (
    <div className="flex h-full flex-col">
      <p className={`mb-3 ${roundLabel}`}>{round.label}</p>

      <div className="flex flex-1 flex-col">
        {Array.from({ length: slotCount }).map((_, i) => (
          <div key={i} className="relative flex flex-1 items-center py-1">
            {/* Incoming elbow from the previous round */}
            {feederCount > 0 && (
              <>
                {forked && (
                  <span
                    className={`${connector} -left-1.5 top-1/4 bottom-1/4 w-px`}
                  />
                )}
                <span className={`${connector} -left-1.5 top-1/2 h-px w-1.5`} />
              </>
            )}

            {/* Stub out towards the next round */}
            {!isLast && (
              <span className={`${connector} -right-1.5 top-1/2 h-px w-1.5`} />
            )}

            <div className="w-full">
              <RoundCard round={round} index={i} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BracketPanel() {
  const [page, setPage] = useState(0);
  const lastPage = bracketRounds.length - 1;
  const round = bracketRounds[page];

  /** Champion column holds one slot; match rounds hold one per match. */
  const slotCount = (item: BracketRound) =>
    item.champion ? 1 : item.matches.length;

  return (
    <>
      {/* Desktop: every round side by side, joined by connector lines */}
      <div className="hidden grid-cols-4 gap-3 lg:grid">
        {bracketRounds.map((item, i) => (
          <RoundColumn
            key={item.id}
            round={item}
            slotCount={slotCount(item)}
            feederCount={i === 0 ? 0 : slotCount(bracketRounds[i - 1])}
            isLast={i === lastPage}
          />
        ))}
      </div>

      {/* Mobile: one round per page */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Babak sebelumnya"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-[#8A8A93] transition-colors enabled:hover:border-white/20 enabled:hover:text-white disabled:opacity-30"
          >
            <ChevronIcon className="rotate-180" />
          </button>

          <div className="text-center">
            <p className={roundLabel}>{round.label}</p>
            <p className="mt-0.5 text-[11px] text-[#6B6B73]">
              Babak {page + 1} dari {bracketRounds.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            aria-label="Babak selanjutnya"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-[#8A8A93] transition-colors enabled:hover:border-white/20 enabled:hover:text-white disabled:opacity-30"
          >
            <ChevronIcon />
          </button>
        </div>

        {/* Page dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {bracketRounds.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Lihat ${item.label}`}
              aria-current={i === page}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-6 bg-[#EF9F27]" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {round.champion ? (
            <BracketChampionCard
              label={round.champion.label}
              name={round.champion.name}
            />
          ) : (
            round.matches.map((match) => (
              <BracketMatchCard key={match.id} match={match} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
