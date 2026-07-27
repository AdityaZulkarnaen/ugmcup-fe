"use client";

import { useMemo, useState } from "react";
import {
  bracketAthletes,
  bracketPathFor,
  categoryBrackets,
  type BracketAthlete,
  type BracketRound,
  type CategoryBracket,
} from "@/lib/constants/matches";
import { ChevronIcon } from "@/components/ui/icons";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { AthleteSearch } from "./AthleteSearch";
import {
  BracketChampionCard,
  BracketMatchCard,
  type HighlightProps,
} from "./BracketMatchCard";

const roundLabel =
  "text-[11px] font-bold uppercase tracking-wider text-[#E3B24D]";

const connector = "absolute";
const connectorIdle = "bg-white/12";
const connectorLit = "bg-[#EF9F27]";

/** Column slot keys: match ids, or the round id for the champion column. */
function columnKeys(round: BracketRound): string[] {
  return round.champion ? [round.id] : round.matches.map((match) => match.id);
}

/** Index of the furthest round an athlete reached; drives the mobile pager. */
function pageOfDeepestRound(target: CategoryBracket, participantId: string) {
  const targetPath = bracketPathFor(target, participantId);
  return target.rounds.reduce(
    (deepest, round, index) =>
      columnKeys(round).some((key) => targetPath.has(key)) ? index : deepest,
    0,
  );
}

/** Card of a round, or the champion box for the last column. */
function RoundCard({
  round,
  index,
  ...highlight
}: { round: BracketRound; index: number } & HighlightProps) {
  if (round.champion) {
    return (
      <BracketChampionCard
        label={round.champion.label}
        name={round.champion.name}
        {...highlight}
      />
    );
  }
  return <BracketMatchCard match={round.matches[index]} {...highlight} />;
}

/**
 * One round column of the desktop bracket.
 *
 * Every card sits in an equal-height `flex-1` slot, so a slot here is exactly
 * twice as tall as the two slots feeding it. That makes the feeder centres land
 * on 25% and 75% of this slot — the two ends of the vertical fork line, which is
 * drawn in two halves so a single feeder's branch can be lit on its own. The
 * elbow meets in the middle of the 12px column gap, 6px on each side.
 */
function RoundColumn({
  round,
  keys,
  feederKeys,
  nextKeys,
  isOnPath,
  hasPath,
  ...highlight
}: {
  round: BracketRound;
  keys: string[];
  /** Slot keys of the previous column; empty for the first round. */
  feederKeys: string[];
  /** Slot keys of the next column; empty for the last column. */
  nextKeys: string[];
  isOnPath: (key?: string) => boolean;
  hasPath: boolean;
} & HighlightProps) {
  /** Two feeders per slot means the incoming line forks; 1-to-1 stays straight. */
  const forked = feederKeys.length === keys.length * 2;

  return (
    <div className="flex h-full flex-col">
      {/* Label with a rule running out to the edge of the column */}
      <div className="mb-3 flex items-center gap-3">
        <p className={roundLabel}>{round.label}</p>
        <span className="h-px flex-1 bg-white/12" />
      </div>

      <div className="flex flex-1 flex-col">
        {keys.map((key, i) => {
          const onPath = isOnPath(key);
          const upperFeeder = forked ? feederKeys[2 * i] : feederKeys[i];
          const lowerFeeder = forked ? feederKeys[2 * i + 1] : undefined;
          const upperLit = onPath && isOnPath(upperFeeder);
          const lowerLit = onPath && isOnPath(lowerFeeder);

          /** The slot this one feeds, so the outgoing stub can be lit too. */
          const nextKey =
            nextKeys.length > 0
              ? nextKeys[Math.floor(i / (keys.length / nextKeys.length))]
              : undefined;
          const outLit = onPath && isOnPath(nextKey);

          return (
            <div key={key} className="relative flex flex-1 items-center py-1">
              {/* Incoming elbow from the previous round */}
              {feederKeys.length > 0 && (
                <>
                  {forked && (
                    <>
                      <span
                        className={`${connector} -left-1.5 top-1/4 bottom-1/2 w-px ${upperLit ? connectorLit : connectorIdle}`}
                      />
                      <span
                        className={`${connector} -left-1.5 top-1/2 bottom-1/4 w-px ${lowerLit ? connectorLit : connectorIdle}`}
                      />
                    </>
                  )}
                  <span
                    className={`${connector} -left-1.5 top-1/2 h-px w-1.5 ${
                      upperLit || lowerLit ? connectorLit : connectorIdle
                    }`}
                  />
                </>
              )}

              {/* Stub out towards the next round */}
              {nextKeys.length > 0 && (
                <span
                  className={`${connector} -right-1.5 top-1/2 h-px w-1.5 ${outLit ? connectorLit : connectorIdle}`}
                />
              )}

              <div className="w-full">
                <RoundCard
                  round={round}
                  index={i}
                  onPath={onPath}
                  dimmed={hasPath && !onPath}
                  {...highlight}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BracketPanel({
  initialCategoryId,
  initialParticipantId,
}: {
  /** Opens on this category instead of the first one. */
  initialCategoryId?: string;
  /** Pins this athlete's path on first render, e.g. from a match page. */
  initialParticipantId?: string;
} = {}) {
  const [categoryId, setCategoryId] = useState(
    initialCategoryId ?? categoryBrackets[0].id,
  );
  const [pinned, setPinned] = useState<BracketAthlete | undefined>(() =>
    bracketAthletes.find(
      (item) =>
        item.participant.id === initialParticipantId &&
        item.categoryId === categoryId,
    ),
  );
  const [hovered, setHovered] = useState<string>();
  const [page, setPage] = useState(() => {
    const target = categoryBrackets.find((item) => item.id === categoryId);
    return target && initialParticipantId
      ? pageOfDeepestRound(target, initialParticipantId)
      : 0;
  });

  const bracket =
    categoryBrackets.find((item) => item.id === categoryId) ??
    categoryBrackets[0];
  const columns = useMemo(
    () =>
      bracket.rounds.map((round) => ({ round, keys: columnKeys(round) })),
    [bracket],
  );

  /** Hovering wins over the pinned athlete, so the bracket follows the cursor. */
  const activeId = hovered ?? pinned?.participant.id;
  const path = useMemo(
    () => bracketPathFor(bracket, activeId),
    [bracket, activeId],
  );
  const hasPath = path.size > 0;
  const isOnPath = (key?: string) => (key ? path.has(key) : false);

  const lastPage = columns.length - 1;
  const current = columns[Math.min(page, lastPage)];

  /** Picking an athlete switches to their category and pins their path. */
  function selectAthlete(athlete?: BracketAthlete) {
    setPinned(athlete);
    if (!athlete) return;

    setCategoryId(athlete.categoryId);
    const target = categoryBrackets.find(
      (item) => item.id === athlete.categoryId,
    );
    if (target) setPage(pageOfDeepestRound(target, athlete.participant.id));
  }

  /** Clicking a name in the bracket pins that athlete; clicking again unpins. */
  function toggleFromCard(participantId: string) {
    if (pinned?.participant.id === participantId) {
      setPinned(undefined);
      return;
    }
    const athlete = bracketAthletes.find(
      (item) =>
        item.participant.id === participantId &&
        item.categoryId === bracket.id,
    );
    if (athlete) setPinned(athlete);
  }

  function changeCategory(id: string) {
    setCategoryId(id);
    setPage(0);
    // A pinned athlete only exists in their own bracket.
    if (pinned && pinned.categoryId !== id) setPinned(undefined);
  }

  const highlight: HighlightProps = {
    activeId,
    onHover: setHovered,
    onSelect: toggleFromCard,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Category filter + athlete search */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <FilterSelect
          options={categoryBrackets.map(({ id, label }) => ({ id, label }))}
          value={bracket.id}
          onChange={changeCategory}
          label="Filter kategori bracket"
          accent="violet"
        />
        <AthleteSearch selected={pinned} onSelect={selectAthlete} />
      </div>

      {/* Desktop: every round side by side, joined by connector lines */}
      <div className="hidden grid-cols-4 gap-3 lg:grid">
        {columns.map(({ round, keys }, i) => (
          <RoundColumn
            key={round.id}
            round={round}
            keys={keys}
            feederKeys={i === 0 ? [] : columns[i - 1].keys}
            nextKeys={i === lastPage ? [] : columns[i + 1].keys}
            isOnPath={isOnPath}
            hasPath={hasPath}
            {...highlight}
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
            <p className={roundLabel}>{current.round.label}</p>
            <p className="mt-0.5 text-[11px] text-[#6B6B73]">
              Babak {page + 1} dari {columns.length}
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

        {/* Page dots; a dot glows on the rounds the lit athlete reached */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {columns.map(({ round, keys }, i) => {
            const roundOnPath = keys.some((key) => path.has(key));
            return (
              <button
                key={round.id}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Lihat ${round.label}`}
                aria-current={i === page}
                className={`h-1.5 rounded-full transition-all ${
                  i === page
                    ? "w-6 bg-[#EF9F27]"
                    : roundOnPath
                      ? "w-1.5 bg-[#EF9F27]/60"
                      : "w-1.5 bg-white/15"
                }`}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {current.keys.map((key, i) => {
            const onPath = path.has(key);
            return (
              <RoundCard
                key={key}
                round={current.round}
                index={i}
                onPath={onPath}
                dimmed={hasPath && !onPath}
                {...highlight}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
