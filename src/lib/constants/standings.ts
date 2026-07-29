/**
 * Group standings for the team events. Only the "beregu" categories have a
 * group stage, so the individual disciplines in `matches.ts` never appear here.
 */

/** Result of one tie, newest last. */
export type FormResult = "W" | "L";

/** One team's tally in a group, as the admin dashboard records it. */
export interface StandingEntry {
  /** Short tag shown in bold, e.g. "FT UGM". */
  team: string;
  /** Full faculty name, shown under the tag. */
  fullName: string;
  /** Badge the admin uploaded; falls back to a placeholder mark. */
  logo?: string;
  played: number;
  won: number;
  lost: number;
  /** Games (sets) won and lost — first tiebreak after wins. */
  gamesWon: number;
  gamesLost: number;
  /** Rally points won and lost — final tiebreak. */
  pointsWon: number;
  pointsLost: number;
  form: FormResult[];
}

export interface StandingGroup {
  id: string;
  label: string;
  entries: StandingEntry[];
}

/** A team discipline, e.g. Beregu Putra, with its groups. */
export interface TeamCategory {
  id: string;
  label: string;
  groups: StandingGroup[];
}

/** Three points per win; the table column is never stored, only derived. */
export function standingPoints(entry: StandingEntry): number {
  return entry.won * 3;
}

/**
 * PBSI order: most wins first, then game difference, then rally-point
 * difference. Returns a sorted copy so the stored order never matters.
 */
export function sortStandings(entries: StandingEntry[]): StandingEntry[] {
  const gameDiff = (e: StandingEntry) => e.gamesWon - e.gamesLost;
  const pointDiff = (e: StandingEntry) => e.pointsWon - e.pointsLost;

  return [...entries].sort(
    (a, b) =>
      b.won - a.won ||
      gameDiff(b) - gameDiff(a) ||
      pointDiff(b) - pointDiff(a) ||
      a.team.localeCompare(b.team),
  );
}

export const teamStandings: TeamCategory[] = [];
