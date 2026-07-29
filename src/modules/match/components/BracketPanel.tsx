"use client";

import { useState } from "react";
import {
  bracketAthletes,
  categoryBrackets,
  participantTiers,
  type BracketAthlete,
  type ParticipantTier,
} from "@/lib/constants/matches";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { AthleteSearch } from "./AthleteSearch";
import { BracketBoard } from "./BracketBoard";

interface BracketPanelProps {
  isLight?: boolean;
}

/**
 * The bracket tab: entrant level and category filters plus athlete search on
 * top of the board. The statistics page renders `BracketBoard` on its own
 * instead, fixed to the draw of the match being viewed.
 */
export function BracketPanel({ isLight = false }: BracketPanelProps) {
  const [tier, setTier] = useState<ParticipantTier>("universitas");
  const [categoryId, setCategoryId] = useState(categoryBrackets[0].id);
  const [pinned, setPinned] = useState<BracketAthlete>();

  /** Only the categories that exist for the chosen entrant level. */
  const options = categoryBrackets.filter((item) => item.tier === tier);
  const bracket =
    options.find((item) => item.id === categoryId) ??
    options[0] ??
    categoryBrackets[0];

  /** Picking an athlete jumps to their draw and pins their path. */
  function selectAthlete(athlete?: BracketAthlete) {
    setPinned(athlete);
    if (!athlete) return;

    const target = categoryBrackets.find(
      (item) => item.id === athlete.categoryId,
    );
    if (!target) return;
    setTier(target.tier);
    setCategoryId(target.id);
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
    // A pinned athlete only exists in their own draw.
    if (pinned && pinned.categoryId !== id) setPinned(undefined);
  }

  function changeTier(next: string) {
    const nextTier = next as ParticipantTier;
    setTier(nextTier);
    setPinned(undefined);

    // Keep the same discipline when it also runs at the new level.
    const sameDiscipline = categoryBrackets.find(
      (item) =>
        item.tier === nextTier && item.disciplineId === bracket.disciplineId,
    );
    const fallback = categoryBrackets.find((item) => item.tier === nextTier);
    setCategoryId((sameDiscipline ?? fallback ?? bracket).id);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Level + category beside the search; the search gets the widest share */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect
          options={participantTiers}
          value={tier}
          onChange={changeTier}
          label="Filter jenjang bracket"
          accent="gold"
          className="min-w-0 flex-1 basis-[45%] md:basis-2/12"
          isLight={isLight}
        />
        <FilterSelect
          options={options.map(({ id, label }) => ({ id, label }))}
          value={bracket.id}
          onChange={changeCategory}
          label="Filter kategori bracket"
          accent="violet"
          className="min-w-0 flex-1 basis-[45%] md:basis-2/12"
          isLight={isLight}
        />
        <AthleteSearch
          selected={pinned}
          onSelect={selectAthlete}
          className="min-w-0 flex-1 basis-full md:basis-4/12"
          isLight={isLight}
        />
      </div>

      {/* Remounting on category or pin resets the mobile pager to the right round */}
      <BracketBoard
        key={`${bracket.id}-${pinned?.participant.id ?? ""}`}
        bracket={bracket}
        pinnedId={pinned?.participant.id}
        onSelect={toggleFromBoard}
        isLight={isLight}
      />
    </div>
  );
}
