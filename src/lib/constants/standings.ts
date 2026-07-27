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

export const teamStandings: TeamCategory[] = [
  {
    id: "beregu-putra",
    label: "Beregu Putra",
    groups: [
      {
        id: "bp-a",
        label: "Grup A",
        entries: [
          {
            team: "FMIPA UGM",
            fullName: "Matematika dan Ilmu Pengetahuan Alam",
            played: 3,
            won: 0,
            lost: 3,
            gamesWon: 2,
            gamesLost: 9,
            pointsWon: 268,
            pointsLost: 371,
            form: ["L", "L", "L"],
          },
          {
            team: "FT UGM",
            fullName: "Teknik",
            // Demo of an admin-uploaded badge; drop this to fall back to the mark.
            logo: "/images/global/Logo icon.svg",
            played: 3,
            won: 3,
            lost: 0,
            gamesWon: 9,
            gamesLost: 2,
            pointsWon: 372,
            pointsLost: 289,
            form: ["W", "W", "W"],
          },
          {
            team: "FISIPOL UGM",
            fullName: "Ilmu Sosial dan Ilmu Politik",
            played: 3,
            won: 1,
            lost: 2,
            gamesWon: 5,
            gamesLost: 7,
            pointsWon: 331,
            pointsLost: 348,
            form: ["L", "W", "L"],
          },
          {
            team: "FEB UGM",
            fullName: "Ekonomika dan Bisnis",
            played: 3,
            won: 2,
            lost: 1,
            gamesWon: 7,
            gamesLost: 5,
            pointsWon: 358,
            pointsLost: 321,
            form: ["W", "L", "W"],
          },
        ],
      },
      {
        id: "bp-b",
        label: "Grup B",
        entries: [
          {
            team: "FH UGM",
            fullName: "Hukum",
            played: 3,
            won: 2,
            lost: 1,
            gamesWon: 7,
            gamesLost: 4,
            pointsWon: 349,
            pointsLost: 310,
            form: ["W", "W", "L"],
          },
          {
            team: "FK-KMK UGM",
            fullName: "Kedokteran, Kesehatan Masyarakat, dan Keperawatan",
            played: 3,
            won: 3,
            lost: 0,
            gamesWon: 9,
            gamesLost: 3,
            pointsWon: 376,
            pointsLost: 302,
            form: ["W", "W", "W"],
          },
          {
            team: "Farmasi UGM",
            fullName: "Farmasi",
            played: 3,
            won: 0,
            lost: 3,
            gamesWon: 1,
            gamesLost: 9,
            pointsWon: 254,
            pointsLost: 378,
            form: ["L", "L", "L"],
          },
          {
            team: "Fapet UGM",
            fullName: "Peternakan",
            played: 3,
            won: 1,
            lost: 2,
            gamesWon: 4,
            gamesLost: 8,
            pointsWon: 312,
            pointsLost: 356,
            form: ["L", "L", "W"],
          },
        ],
      },
    ],
  },
  {
    id: "beregu-putri",
    label: "Beregu Putri",
    groups: [
      {
        id: "bpi-a",
        label: "Grup A",
        entries: [
          {
            team: "FT UGM",
            fullName: "Teknik",
            logo: "/images/global/Logo icon.svg",
            played: 3,
            won: 2,
            lost: 1,
            gamesWon: 7,
            gamesLost: 4,
            pointsWon: 351,
            pointsLost: 308,
            form: ["W", "L", "W"],
          },
          {
            team: "FEB UGM",
            fullName: "Ekonomika dan Bisnis",
            played: 3,
            won: 3,
            lost: 0,
            gamesWon: 9,
            gamesLost: 1,
            pointsWon: 379,
            pointsLost: 281,
            form: ["W", "W", "W"],
          },
          {
            team: "FISIPOL UGM",
            fullName: "Ilmu Sosial dan Ilmu Politik",
            played: 3,
            won: 0,
            lost: 3,
            gamesWon: 2,
            gamesLost: 9,
            pointsWon: 271,
            pointsLost: 374,
            form: ["L", "L", "L"],
          },
          {
            team: "FMIPA UGM",
            fullName: "Matematika dan Ilmu Pengetahuan Alam",
            played: 3,
            won: 1,
            lost: 2,
            gamesWon: 4,
            gamesLost: 8,
            pointsWon: 318,
            pointsLost: 356,
            form: ["L", "W", "L"],
          },
        ],
      },
      {
        // Two teams tie on wins here, so the game-difference tiebreak decides.
        id: "bpi-b",
        label: "Grup B",
        entries: [
          {
            team: "Fapet UGM",
            fullName: "Peternakan",
            played: 3,
            won: 1,
            lost: 2,
            gamesWon: 4,
            gamesLost: 7,
            pointsWon: 316,
            pointsLost: 344,
            form: ["W", "L", "L"],
          },
          {
            team: "Farmasi UGM",
            fullName: "Farmasi",
            played: 3,
            won: 2,
            lost: 1,
            gamesWon: 6,
            gamesLost: 5,
            pointsWon: 341,
            pointsLost: 330,
            form: ["L", "W", "W"],
          },
          {
            team: "FH UGM",
            fullName: "Hukum",
            played: 3,
            won: 2,
            lost: 1,
            gamesWon: 8,
            gamesLost: 3,
            pointsWon: 362,
            pointsLost: 299,
            form: ["W", "W", "L"],
          },
          {
            team: "FK-KMK UGM",
            fullName: "Kedokteran, Kesehatan Masyarakat, dan Keperawatan",
            played: 3,
            won: 1,
            lost: 2,
            gamesWon: 4,
            gamesLost: 7,
            pointsWon: 309,
            pointsLost: 355,
            form: ["L", "L", "W"],
          },
        ],
      },
    ],
  },
];
