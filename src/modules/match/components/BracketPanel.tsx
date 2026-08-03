"use client";

import { useState, useMemo, useEffect } from "react";
import { DISCIPLINES, LEVELS } from "@/lib/constants";
import { getBracket } from "@/lib/api/admin";
import { cacheKeys } from "@/lib/api/cache";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import type { BracketNode } from "@/lib/types";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { AthleteSearch } from "./AthleteSearch";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { BracketBoardSkeleton } from "./MatchSkeletons";
import { BracketBoard } from "./BracketBoard";
import { type CategoryBracket, type BracketRound, type BracketSide, type BracketMatch } from "@/lib/constants/matches";

function mapSide(p: any, t: any, isFirstRound: boolean, matchStatus: string, won: boolean): BracketSide {
  if (p) {
    const inst = p.institution?.name;
    const names = p.athletes?.length > 0
      ? p.athletes.map((a: any) => a.athlete?.name).filter(Boolean).join(" - ")
      : undefined;
    return {
      participantId: p.id,
      name: names,
      inst,
      avatar: p.avatar,
      score: matchStatus === "SCHEDULED" ? null : 0,
      winner: won,
      retired: matchStatus === "RETIRED" && !won ? "cedera" : undefined
    };
  }
  if (t) {
    const inst = t.institution?.name;
    return {
      participantId: t.id,
      name: inst || "Tim",
      inst: undefined,
      avatar: t.avatar,
      score: matchStatus === "SCHEDULED" ? null : 0,
      winner: won,
      retired: matchStatus === "RETIRED" && !won ? "cedera" : undefined
    };
  }
  return {
    participantId: undefined,
    isBye: isFirstRound,
    score: null,
    winner: false
  };
}

function buildCategoryBracket(disciplineId: string, nodes: BracketNode[]): CategoryBracket | null {
  if (!nodes || nodes.length === 0) return null;

  const groupedByRound: Record<string, BracketNode[]> = {};
  nodes.forEach((node) => {
    const round = node.match?.roundName ?? "Babak";
    if (!groupedByRound[round]) groupedByRound[round] = [];
    groupedByRound[round].push(node);
  });

  const roundsArray = Object.entries(groupedByRound).sort(
    (a, b) => b[1].length - a[1].length
  );

  // 1. Calculate true tree index for all nodes based on nextNodeId
  const treeIndices = new Map<string, number>();

  // Iterate backwards to establish parent-child relationships
  for (let rIdx = roundsArray.length - 1; rIdx >= 0; rIdx--) {
    const roundNodes = roundsArray[rIdx][1];

    // For the last round in our array, just assign sequential indices
    if (rIdx === roundsArray.length - 1) {
      // Sort by position just to have a consistent order for the root nodes
      [...roundNodes].sort((a, b) => a.position - b.position).forEach((node, i) => {
        treeIndices.set(node.id, i);
      });
      continue;
    }

    // For previous rounds, calculate index based on nextNodeId
    roundNodes.forEach(node => {
      if (node.nextNodeId && treeIndices.has(node.nextNodeId)) {
        const parentIdx = treeIndices.get(node.nextNodeId)!;
        const slotOffset = node.nextSlot === "B" ? 1 : 0;
        treeIndices.set(node.id, parentIdx * 2 + slotOffset);
      } else {
        // Fallback if nextNodeId is missing (shouldn't happen in a valid bracket)
        treeIndices.set(node.id, node.position);
      }
    });
  }

  // Base matches count from the last round
  const rootMatchesCount = roundsArray[roundsArray.length - 1][1].length || 1;

  const rounds: BracketRound[] = roundsArray.map(([roundName, roundNodes], rIdx) => {
    const isFirstRound = rIdx === 0;

    // Expected matches = (root matches count) * 2^(distance from root)
    const expectedMatches = rootMatchesCount * Math.pow(2, roundsArray.length - 1 - rIdx);

    // Map to BracketMatch, filling in missing or hidden BYE matches at their exact tree index
    const matches: BracketMatch[] = Array.from({ length: expectedMatches }).map((_, i) => {
      const node = roundNodes.find((n) => treeIndices.get(n.id) === i);

      if (!node) {
        return {
          id: `m-${rIdx}-${i}`,
          home: { isBye: true, score: null, winner: false },
          away: { isBye: true, score: null, winner: false },
          isByeMatch: true,
          isEmptySlot: true,
        };
      }

      const match = node.match;
      const wonA =
        (!!match?.winnerParticipantId &&
          match.winnerParticipantId === match.participantAId) ||
        (!!match?.winnerTeamId && match.winnerTeamId === match.teamAId);

      const wonB =
        (!!match?.winnerParticipantId &&
          match.winnerParticipantId === match.participantBId) ||
        (!!match?.winnerTeamId && match.winnerTeamId === match.teamBId);

      // Score from sets (number of sets won)
      const sets = match?.sets ?? [];
      let setsWonA = sets.filter(s => s.scoreA > s.scoreB).length;
      let setsWonB = sets.filter(s => s.scoreB > s.scoreA).length;

      // BYE = auto-advance karena salah satu sisi kosong. Bukan pertandingan
      // nyata, jadi set menang tidak boleh ditampilkan sama sekali.
      const hasA = !!(match?.participantA || match?.teamA);
      const hasB = !!(match?.participantB || match?.teamB);
      const isByeAdvance = match?.status === "RETIRED" && (!hasA || !hasB);

      // Hanya FINISHED/WALK_OVER tanpa set tercatat yang dihitung 2-0.
      // RETIRED mempertahankan set aktual (mis. 1-1) — pemenang tetap maju.
      if (!isByeAdvance && sets.length === 0 && (match?.status === "FINISHED" || match?.status === "WALK_OVER")) {
        if (wonA) setsWonA = 2;
        if (wonB) setsWonB = 2;
      }

      const homeSide = mapSide(match?.participantA, match?.teamA, isFirstRound, match?.status || "SCHEDULED", wonA);
      const awaySide = mapSide(match?.participantB, match?.teamB, isFirstRound, match?.status || "SCHEDULED", wonB);

      if (isByeAdvance) {
        // Jangan tampilkan skor set pada match BYE
        homeSide.score = null;
        awaySide.score = null;
      } else if (match?.status !== "SCHEDULED") {
        if (homeSide.score !== null) homeSide.score = setsWonA;
        if (awaySide.score !== null) awaySide.score = setsWonB;
      }

      return {
        id: `m-${rIdx}-${i}`,
        home: homeSide,
        away: awaySide,
        isByeMatch: homeSide.isBye || awaySide.isBye,
      };
    });

    return {
      id: `r-${rIdx}`,
      label: roundName,
      matches,
    };
  });

  return {
    id: disciplineId,
    disciplineId: disciplineId,
    label: disciplineId,
    tier: "universitas",
    seeds: [],
    rounds,
  };
}

interface BracketPanelProps {
  initialDisciplineId?: string;
  initialLevel?: string;
  highlightParticipantId?: string;
  isLight?: boolean;
}

export function BracketPanel({
  initialDisciplineId,
  initialLevel,
  highlightParticipantId,
  isLight = false,
}: BracketPanelProps = {}) {
  const [level, setLevel] = useState(initialLevel || "univ");

  const availableDisciplines = useMemo(() => {
    return DISCIPLINES.filter((d) => d.level === level);
  }, [level]);

  const [disciplineId, setDisciplineId] = useState(
    initialDisciplineId || availableDisciplines[0]?.id || ""
  );

  const [pinnedId, setPinnedId] = useState<string | undefined>(
    highlightParticipantId
  );

  useEffect(() => {
    if (initialDisciplineId) {
      setDisciplineId(initialDisciplineId);
      const disc = DISCIPLINES.find((d) => d.id === initialDisciplineId);
      if (disc && disc.level) {
        setLevel(disc.level);
      }
    }
  }, [initialDisciplineId]);

  useEffect(() => {
    if (highlightParticipantId) {
      setPinnedId(highlightParticipantId);
    }
  }, [highlightParticipantId]);

  useEffect(() => {
    if (
      !initialDisciplineId &&
      availableDisciplines.length > 0 &&
      !availableDisciplines.some((d) => d.id === disciplineId)
    ) {
      setDisciplineId(availableDisciplines[0].id);
      setPinnedId(undefined);
    }
  }, [availableDisciplines, disciplineId, initialDisciplineId]);

  const { data, isLoading: loading } = useCachedQuery<BracketNode[]>(
    disciplineId ? cacheKeys.bracket(disciplineId) : null,
    () => getBracket(disciplineId)
  );
  const bracketNodes = useMemo(() => data ?? [], [data]);

  const categoryBracket = useMemo(() => buildCategoryBracket(disciplineId, bracketNodes), [disciplineId, bracketNodes]);

  const currentDiscObj = DISCIPLINES.find((d) => d.id === disciplineId);
  const currentLevelObj = LEVELS.find((l) => l.value === level);
  const categoryHeaderLabel = `BAGAN ${currentDiscObj?.name?.toUpperCase() || currentDiscObj?.label?.toUpperCase() || disciplineId.toUpperCase()} · ${currentLevelObj?.label?.toUpperCase() || level.toUpperCase()}`;

  const searchOptions = useMemo(() => {
    if (!categoryBracket || categoryBracket.rounds.length === 0) return [];

    // Extract unique participants from all rounds
    const optionsMap = new Map<string, { id: string; name: string; inst?: string; }>();
    categoryBracket.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        if (match.home.participantId && match.home.name && match.home.name !== "BYE") {
          optionsMap.set(match.home.participantId, {
            id: match.home.participantId,
            name: match.home.name,
            inst: match.home.inst,
          });
        }
        if (match.away.participantId && match.away.name && match.away.name !== "BYE") {
          optionsMap.set(match.away.participantId, {
            id: match.away.participantId,
            name: match.away.name,
            inst: match.away.inst,
          });
        }
      });
    });
    return Array.from(optionsMap.values());
  }, [categoryBracket]);

  return (
    <div className="flex flex-col gap-5">
      {/* Level + Category Filter + Search */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect
          options={LEVELS.map((l) => ({ id: l.value, label: l.label }))}
          value={level}
          onChange={(val) => {
            setLevel(val);
            setPinnedId(undefined);
          }}
          label="Filter jenjang"
          accent="mint"
          className="min-w-0 flex-1 basis-[45%] md:basis-2/12"
          isLight={isLight}
        />
        <FilterSelect
          options={availableDisciplines.map((d) => ({ id: d.id, label: d.label }))}
          value={disciplineId}
          onChange={(val) => {
            setDisciplineId(val);
            setPinnedId(undefined);
          }}
          label="Filter kategori"
          accent="violet"
          className="min-w-0 flex-1 basis-[45%] md:basis-2/12"
          isLight={isLight}
        />
        <AthleteSearch
          options={searchOptions}
          selectedId={pinnedId}
          onSelect={setPinnedId}
          className="min-w-0 flex-1 basis-full md:basis-4/12"
          isLight={isLight}
        />
      </div>

      {loading ? (
        <SkeletonPanel label="Memuat bagan pertandingan…" isLight={isLight} className="gap-4">
          <BracketBoardSkeleton isLight={isLight} />
        </SkeletonPanel>
      ) : categoryBracket ? (
        <div className={`overflow-x-auto rounded-2xl border p-6 ${isLight ? "border-[rgba(0,0,0,0.08)] bg-white shadow-sm" : "border-white/[0.06] bg-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]"}`}>
          <div className={`mb-4 text-xs font-bold uppercase tracking-wider ${isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[#8A8A93]"}`}>
            {categoryHeaderLabel}
          </div>
          <BracketBoard
            key={disciplineId}
            bracket={categoryBracket}
            interactive={true}
            pinnedId={pinnedId}
            onSelect={setPinnedId}
            isLight={isLight}
          />
        </div>
      ) : (
        <EmptyState
          title="Bagan Bracket Belum Tersedia"
          description="Panitia sedang menyusun bagan alur pertandingan untuk kategori ini. Silakan cek secara berkala."
          footerNote="Bagan akan diperbarui otomatis saat undian dirilis"
          isLight={isLight}
        />
      )}
    </div>
  );
}
