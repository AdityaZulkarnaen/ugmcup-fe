"use client";

import { useMemo, useState } from "react";
import {
  bracketPathFor,
  type BracketRound,
  type CategoryBracket,
} from "@/lib/constants/matches";
import { ChevronIcon } from "@/components/ui/icons";
import {
  BracketChampionCard,
  BracketMatchCard,
  type HighlightProps,
} from "./BracketMatchCard";

const roundLabel =
  "text-[11px] font-bold uppercase tracking-wider text-[#02F5D4]";

/**
 * Connector segments.
 *
 * These are 2px, not 1px. Slot heights are the column height divided by the
 * round's slot count, so the 25%/50%/75% offsets almost never land on whole
 * pixels — and a 1px hairline on a fractional offset gets antialiased into a
 * dotted grey smear. Two pixels always covers a full device pixel, so the line
 * stays solid wherever it falls.
 */
const connector = "absolute";
const connectorIdleDark = "bg-white/22";
const connectorIdleLight = "bg-[rgba(0,0,0,0.16)]";
const connectorLitDark = "bg-[#02F5D4]";
const connectorLitLight = "bg-[#8B5CF6]";

/** Column slot keys: match ids, or the round id for the champion column. */
export function columnKeys(round: BracketRound): string[] {
  return round.champion ? [round.id] : round.matches.map((match) => match.id);
}

/** Index of the furthest round an athlete reached; drives the mobile pager. */
export function pageOfDeepestRound(
  target: CategoryBracket,
  participantId: string,
) {
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
  isLight,
  ...highlight
}: { round: BracketRound; index: number; isLight: boolean } & HighlightProps) {
  if (round.champion) {
    return (
      <BracketChampionCard
        label={round.champion.label}
        name={round.champion.name}
        isLight={isLight}
        {...highlight}
      />
    );
  }
  return <BracketMatchCard match={round.matches[index]} isLight={isLight} {...highlight} />;
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
  isEmptySlot,
  isLight,
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
  /** True for a tree position that holds no match at all. */
  isEmptySlot: (key?: string) => boolean;
  isLight: boolean;
} & HighlightProps) {
  /** Two feeders per slot means the incoming line forks; 1-to-1 stays straight. */
  const forked = feederKeys.length === keys.length * 2;
  const connectorIdle = isLight ? connectorIdleLight : connectorIdleDark;
  const connectorLit = isLight ? connectorLitLight : connectorLitDark;

  return (
    <div className="flex h-full flex-col">
      {/* Label with a rule running out to the edge of the column */}
      <div className="mb-3 flex items-center gap-3">
        <p className={isLight ? "text-[11px] font-bold uppercase tracking-wider text-[#6C47D1]" : roundLabel}>{round.label}</p>
        <span className={`h-px flex-1 ${isLight ? "bg-[rgba(0,0,0,0.08)]" : "bg-white/12"}`} />
      </div>

      <div className="flex flex-1 flex-col">
        {keys.map((key, i) => {
          const onPath = isOnPath(key);
          const upperFeeder = forked ? feederKeys[2 * i] : feederKeys[i];
          const lowerFeeder = forked ? feederKeys[2 * i + 1] : undefined;
          const upperLit = onPath && isOnPath(upperFeeder);
          const lowerLit = onPath && isOnPath(lowerFeeder);

          /**
           * A branch is drawn when something real sits at its far end. Byes
           * count — a walkover has a card and feeds this slot — but a tree
           * position nothing was drawn into has nowhere for the line to land.
           */
          const upperFeeds = Boolean(upperFeeder) && !isEmptySlot(upperFeeder);
          const lowerFeeds = Boolean(lowerFeeder) && !isEmptySlot(lowerFeeder);
          const hasIncoming = forked
            ? upperFeeds || lowerFeeds
            : feederKeys.length > 0 && upperFeeds;

          /** The slot this one feeds, so the outgoing stub can be lit too. */
          const nextKey =
            nextKeys.length > 0
              ? nextKeys[Math.floor(i / (keys.length / nextKeys.length))]
              : undefined;
          const outLit = onPath && isOnPath(nextKey);

          return (
            <div key={key} className="relative flex flex-1 items-center py-1">
              {/* Incoming elbow from the previous round */}
              {hasIncoming && (
                <>
                  {forked && (
                    <>
                      {upperFeeds && (
                        <span
                          className={`${connector} -left-1.5 top-1/4 bottom-1/2 w-0.5 ${upperLit ? connectorLit : connectorIdle}`}
                        />
                      )}
                      {lowerFeeds && (
                        <span
                          className={`${connector} -left-1.5 top-1/2 bottom-1/4 w-0.5 ${lowerLit ? connectorLit : connectorIdle}`}
                        />
                      )}
                    </>
                  )}
                  <span
                    className={`${connector} -left-1.5 top-1/2 h-0.5 w-1.5 -translate-y-1/2 ${
                      upperLit || lowerLit ? connectorLit : connectorIdle
                    }`}
                  />
                </>
              )}

              {/* Stub out towards the next round */}
              {nextKeys.length > 0 && !isEmptySlot(key) && (
                <span
                  className={`${connector} -right-1.5 top-1/2 h-0.5 w-1.5 -translate-y-1/2 ${outLit ? connectorLit : connectorIdle}`}
                />
              )}


              <div className="w-full">
                <RoundCard
                  round={round}
                  index={i}
                  onPath={onPath}
                  dimmed={hasPath && !onPath}
                  isLight={isLight}
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

/**
 * The bracket itself: every round side by side on desktop, one round per page on
 * mobile, with the pinned athlete's run highlighted.
 *
 * `interactive` false makes it a read-only board — no hover or click highlight —
 * which is what the match statistics page renders.
 */
export function BracketBoard({
  bracket,
  pinnedId,
  onSelect,
  interactive = true,
  isLight = false,
}: {
  bracket: CategoryBracket;
  /** Participant whose path stays lit. */
  pinnedId?: string;
  /** Called when a name is clicked; omit to make names non-clickable. */
  onSelect?: (participantId: string) => void;
  interactive?: boolean;
  isLight?: boolean;
}) {
  const [hovered, setHovered] = useState<string>();
  const [page, setPage] = useState(() =>
    pinnedId ? pageOfDeepestRound(bracket, pinnedId) : 0,
  );

  const columns = useMemo(
    () => bracket.rounds.map((round) => ({ round, keys: columnKeys(round) })),
    [bracket],
  );

  /** Hovering wins over the pinned athlete, so the bracket follows the cursor. */
  const activeId = (interactive ? hovered : undefined) ?? pinnedId;
  const path = useMemo(
    () => bracketPathFor(bracket, activeId),
    [bracket, activeId],
  );
  const hasPath = path.size > 0;
  const isOnPath = (key?: string) => (key ? path.has(key) : false);

  const isEmptySlot = (key?: string) => {
    if (!key) return false;
    for (const round of bracket.rounds) {
      const match = round.matches.find((m) => m.id === key);
      if (match) return Boolean(match.isEmptySlot);
    }
    return false;
  };

  const lastPage = columns.length - 1;
  const current = columns[Math.min(page, lastPage)];

  const highlight: HighlightProps = {
    activeId,
    onHover: interactive ? setHovered : undefined,
    onSelect: interactive ? onSelect : undefined,
  };

  /**
   * Up to four columns share the width evenly. Beyond that they would be too
   * narrow to read, so the columns take a fixed width and the board scrolls
   * sideways instead of wrapping onto a second row.
   */
  const scrolls = columns.length > 4;

  return (
    <>
      {/* Desktop: every round side by side, joined by connector lines */}
      <div
        className={`hidden lg:block ${scrolls ? "scrollbar-thumb-only overflow-x-auto pb-3" : ""
          }`}
      >
        <div
          className={`grid grid-flow-col gap-3 ${scrolls ? "w-max auto-cols-[15rem]" : "auto-cols-fr"
            }`}
        >
          {columns.map(({ round, keys }, i) => (
            <RoundColumn
              key={round.id}
              round={round}
              keys={keys}
              feederKeys={i === 0 ? [] : columns[i - 1].keys}
              nextKeys={i === lastPage ? [] : columns[i + 1].keys}
              isOnPath={isOnPath}
              hasPath={hasPath}
              isEmptySlot={isEmptySlot}
              isLight={isLight}
              {...highlight}
            />
          ))}
        </div>
      </div>

      {/* Mobile: one round per page */}
      <div className="lg:hidden">
        {/* Kontrol babak ditandai agar tidak dihitung sebagai "klik di luar"
            oleh panel: berpindah babak justru cara mengikuti jalur peserta yang
            sedang tersorot, jadi sorotannya harus bertahan. Penandanya hanya di
            baris kontrol, bukan seluruh kolom — mengklik ruang kosong di antara
            kartu tetap berarti melepas sorotan. */}
        <div className="flex items-center justify-between gap-3" data-bracket-nav>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Babak sebelumnya"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30 ${isLight ? "border-[rgba(0,0,0,0.08)] bg-white text-[#808080] enabled:hover:border-[rgba(0,0,0,0.15)] enabled:hover:text-[#1a162b]" : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] enabled:hover:border-white/20 enabled:hover:text-white"}`}
          >
            <ChevronIcon className="rotate-180" />
          </button>

          <div className="text-center">
            <p className={isLight ? "text-[11px] font-bold uppercase tracking-wider text-[#6C47D1]" : roundLabel}>{current.round.label}</p>
            <p className={`mt-0.5 text-[11px] ${isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"}`}>
              Babak {page + 1} dari {columns.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            aria-label="Babak selanjutnya"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30 ${isLight ? "border-[rgba(0,0,0,0.08)] bg-white text-[#808080] enabled:hover:border-[rgba(0,0,0,0.15)] enabled:hover:text-[#1a162b]" : "border-white/[0.08] bg-white/[0.02] text-[#8A8A93] enabled:hover:border-white/20 enabled:hover:text-white"}`}
          >
            <ChevronIcon />
          </button>
        </div>

        {/* Page dots; a dot glows on the rounds the lit athlete reached */}
        <div className="mt-3 flex items-center justify-center gap-1.5" data-bracket-nav>
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
                    ? isLight
                      ? "w-6 bg-[#8b5cf6]"
                      : "w-6 bg-[#02F5D4]"
                    : roundOnPath
                      ? isLight
                        ? "w-1.5 bg-[#8b5cf6]/60"
                        : "w-1.5 bg-[#02F5D4]/60"
                      : isLight
                        ? "w-1.5 bg-black/15"
                        : "w-1.5 bg-white/15"
                }`}
              />
            );
          })}
        </div>

        {/* No connectors to keep aligned here, so empty tree positions are
            dropped outright rather than left as blank gaps in the list. */}
        <div className="mt-4 flex flex-col gap-2.5">
          {current.keys.map((key, i) => {
            if (isEmptySlot(key)) return null;
            const onPath = path.has(key);
            return (
              <RoundCard
                key={key}
                round={current.round}
                index={i}
                onPath={onPath}
                dimmed={hasPath && !onPath}
                isLight={isLight}
                {...highlight}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
