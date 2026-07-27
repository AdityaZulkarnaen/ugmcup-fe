"use client";

import { useState } from "react";
import {
  bracketAthletes,
  categoryBrackets,
  type BracketAthlete,
} from "@/lib/constants/matches";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { AthleteSearch } from "./AthleteSearch";
import { BracketBoard } from "./BracketBoard";

/**
 * The bracket tab: category filter and athlete search on top of the board.
 * The statistics page renders `BracketBoard` on its own instead, fixed to the
 * category of the match being viewed.
 */
export function BracketPanel() {
  const [categoryId, setCategoryId] = useState(categoryBrackets[0].id);
  const [pinned, setPinned] = useState<BracketAthlete>();

  const bracket =
    categoryBrackets.find((item) => item.id === categoryId) ??
    categoryBrackets[0];

  /** Picking an athlete switches to their category and pins their path. */
  function selectAthlete(athlete?: BracketAthlete) {
    setPinned(athlete);
    if (athlete) setCategoryId(athlete.categoryId);
  }

  /** Clicking a name in the bracket pins that athlete; clicking again unpins. */
  function toggleFromBoard(participantId: string) {
    if (pinned?.participant.id === participantId) {
      setPinned(undefined);
      return;
    }
    setPinned(
      bracketAthletes.find(
        (item) =>
          item.participant.id === participantId &&
          item.categoryId === bracket.id,
      ),
    );
  }

  function changeCategory(id: string) {
    setCategoryId(id);
    // A pinned athlete only exists in their own bracket.
    if (pinned && pinned.categoryId !== id) setPinned(undefined);
  }

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

      {/* Remounting on category or pin resets the mobile pager to the right round */}
      <BracketBoard
        key={`${bracket.id}-${pinned?.participant.id ?? ""}`}
        bracket={bracket}
        pinnedId={pinned?.participant.id}
        onSelect={toggleFromBoard}
      />
    </div>
  );
}
