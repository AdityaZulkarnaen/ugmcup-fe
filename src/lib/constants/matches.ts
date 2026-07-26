/** One completed game inside a match, shown as a pair of score boxes. */
export interface MatchGame {
  home: number;
  away: number;
}

export interface MatchSide {
  /** One name for singles, two for doubles. */
  players: string[];
  /** Short faculty/team tag, e.g. "FT UGM". */
  team: string;
}

export interface LiveMatch {
  id: string;
  /** Discipline label shown in the gold pill, e.g. "Tunggal Putra U-21". */
  category: string;
  /** Court label, e.g. "Lapangan 1". */
  court: string;
  home: MatchSide;
  away: MatchSide;
  /** Live score of the game currently in progress. */
  live: { home: number; away: number };
  /** Games already finished, rendered as score boxes. */
  games: MatchGame[];
  /** Human label for the set/game in progress, e.g. "Set 2". */
  setLabel: string;
  /** 1-based index of the game in progress; drives the progress bar. */
  currentGame: number;
  /** Total games in the match (best-of), i.e. progress-bar segments. */
  totalGames: number;
}

export const liveMatches: LiveMatch[] = [
  {
    id: "match-1",
    category: "Tunggal Putra U-21",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah"], team: "FT UGM" },
    away: { players: ["Arya Pratama"], team: "FEB UGM" },
    live: { home: 14, away: 11 },
    games: [{ home: 21, away: 18 }],
    setLabel: "Set 2",
    currentGame: 2,
    totalGames: 3,
  },
  {
    id: "match-2",
    category: "Ganda Putri Open",
    court: "Lapangan 2",
    home: { players: ["Sinta Rahayu", "Devi Kurnia"], team: "FT UGM" },
    away: { players: ["Arya Pratama", "Arya Pratama"], team: "FEB UGM" },
    live: { home: 8, away: 6 },
    games: [
      { home: 21, away: 18 },
      { home: 21, away: 18 },
    ],
    setLabel: "Set 3",
    currentGame: 3,
    totalGames: 3,
  },
  {
    id: "match-3",
    category: "Ganda Campuran U-19",
    court: "Lapangan 3",
    home: { players: ["Sinta Rahayu", "Devi Kurnia"], team: "FT UGM" },
    away: { players: ["Arya Pratama", "Arya Pratama"], team: "FEB UGM" },
    live: { home: 8, away: 6 },
    games: [
      { home: 21, away: 18 },
      { home: 21, away: 18 },
    ],
    setLabel: "Set 3",
    currentGame: 3,
    totalGames: 3,
  },
];

/** Status of a scheduled match, drives the badge + accent colours. */
export type ScheduleStatus = "live" | "upcoming" | "done";

export interface ScheduleMatch {
  id: string;
  /** Day filter key, matches a `scheduleDays` id. */
  dayId: string;
  /** Category filter key, matches a `scheduleCategories` id. */
  categoryId: string;
  /** Start time, e.g. "08:00". */
  time: string;
  /** Discipline label shown in the gold pill, e.g. "Tunggal Putra". */
  category: string;
  /** Age group / division shown next to the pill, e.g. "U-21" or "Open". */
  level: string;
  /** Court label, e.g. "Lapangan 1". */
  court: string;
  home: MatchSide;
  away: MatchSide;
  status: ScheduleStatus;
  /** Finished games, rendered as "21-15 · 18-21" under the centre column. */
  games?: MatchGame[];
  /** Which side won; only set when `status` is "done". */
  winner?: "home" | "away";
}

export interface ScheduleFilter {
  id: string;
  label: string;
}

export const scheduleDays: ScheduleFilter[] = [
  { id: "all", label: "Semua" },
  { id: "2025-07-16", label: "Rab, 16 Jul" },
  { id: "2025-07-17", label: "Kam, 17 Jul" },
  { id: "2025-07-18", label: "Jum, 18 Jul" },
  { id: "2025-07-19", label: "Sab, 19 Jul" },
];

export const scheduleCategories: ScheduleFilter[] = [
  { id: "all", label: "Semua" },
  { id: "tunggal-putra", label: "Tunggal Putra" },
  { id: "tunggal-putri", label: "Tunggal Putri" },
  { id: "ganda-putra", label: "Ganda Putra" },
  { id: "ganda-putri", label: "Ganda Putri" },
  { id: "ganda-campuran", label: "Ganda Campuran" },
];

export const scheduleMatches: ScheduleMatch[] = [
  {
    id: "sched-1",
    dayId: "2025-07-16",
    categoryId: "tunggal-putra",
    time: "08:00",
    category: "Tunggal Putra",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah"], team: "FT UGM" },
    away: { players: ["Arya Pratama"], team: "FEB UGM" },
    status: "live",
  },
  {
    id: "sched-2",
    dayId: "2025-07-16",
    categoryId: "ganda-putri",
    time: "08:00",
    category: "Ganda Putri",
    level: "Open",
    court: "Lapangan 2",
    home: { players: ["Sinta Rahayu", "Devi Kurnia"], team: "FT UGM" },
    away: { players: ["Layla Azhar", "Putri Wulandari"], team: "FEB UGM" },
    status: "live",
  },
  {
    id: "sched-3",
    dayId: "2025-07-17",
    categoryId: "ganda-putra",
    time: "08:00",
    category: "Ganda Putra",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-4",
    dayId: "2025-07-17",
    categoryId: "tunggal-putra",
    time: "08:00",
    category: "Tunggal Putra",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah"], team: "FT UGM" },
    away: { players: ["Arya Pratama"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-5",
    dayId: "2025-07-18",
    categoryId: "ganda-putra",
    time: "08:00",
    category: "Ganda Putra",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-6",
    dayId: "2025-07-18",
    categoryId: "ganda-putra",
    time: "08:00",
    category: "Ganda Putra",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-7",
    dayId: "2025-07-19",
    categoryId: "tunggal-putra",
    time: "08:00",
    category: "Tunggal Putra",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan"], team: "FT UGM" },
    away: { players: ["Wahyu Nugroho"], team: "FEB UGM" },
    status: "done",
    winner: "home",
    games: [
      { home: 21, away: 15 },
      { home: 18, away: 21 },
      { home: 21, away: 12 },
    ],
  },
  {
    id: "sched-8",
    dayId: "2025-07-19",
    categoryId: "ganda-putra",
    time: "08:00",
    category: "Ganda Putra",
    level: "U-21",
    court: "Lapangan 2",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "done",
    winner: "away",
    games: [
      { home: 18, away: 21 },
      { home: 16, away: 21 },
    ],
  },
];

/**
 * A competitor the admin registers once and the bracket references by id, so
 * name, team and badge image live in a single place.
 */
export interface Participant extends MatchSide {
  id: string;
  /**
   * Badge image the admin uploads — a path under `public/` or a remote URL.
   * Remote hosts must be allowed in `next.config.ts` under `images.remotePatterns`.
   * Falls back to the gold shuttlecock mark when empty.
   */
  avatar?: string;
}

export const participants: Participant[] = [
  {
    id: "rizky-fadhilah",
    players: ["Rizky Fadhilah"],
    team: "FT UGM",
  },
  {
    id: "dani-setiawan",
    players: ["Dani Setiawan"],
    team: "FEB UGM",
    // Demo of an admin-supplied badge; drop this line to fall back to the mark.
    avatar: "/images/hero/cock1.png",
  },
];

export function getParticipant(id: string): Participant | undefined {
  return participants.find((participant) => participant.id === id);
}

/** One competitor slot inside a bracket match. */
export interface BracketSide {
  /** Registry id; omitted while the slot is still undecided (shows "TBD"). */
  participantId?: string;
  /** Games won; `null` when the match has not been played. */
  score: number | null;
  /** True for the side that advances. */
  winner?: boolean;
}

export interface BracketMatch {
  id: string;
  home: BracketSide;
  away: BracketSide;
}

export interface BracketRound {
  id: string;
  label: string;
  matches: BracketMatch[];
  /** Set on the last column: renders the champion box instead of match cards. */
  champion?: { label: string; name: string };
}

/** Builds the repeated placeholder pairing used by the mock bracket. */
function bracketPair(id: string): BracketMatch {
  return {
    id,
    home: { participantId: "rizky-fadhilah", score: 2, winner: true },
    away: { participantId: "dani-setiawan", score: 0 },
  };
}

export const bracketRounds: BracketRound[] = [
  {
    id: "perempat-final",
    label: "Perempat Final",
    matches: [
      bracketPair("qf-1"),
      bracketPair("qf-2"),
      bracketPair("qf-3"),
      bracketPair("qf-4"),
    ],
  },
  {
    id: "semi-final",
    label: "Semi Final",
    matches: [bracketPair("sf-1"), bracketPair("sf-2")],
  },
  {
    id: "final",
    label: "Final",
    matches: [
      {
        id: "final-1",
        home: { score: null },
        away: { score: null },
      },
    ],
  },
  {
    id: "juara",
    label: "Juara",
    matches: [],
    champion: { label: "Juara", name: "TBD" },
  },
];

export interface MatchTab {
  id: string;
  label: string;
  caption: string;
}

export const matchTabs: MatchTab[] = [
  { id: "livescore", label: "Live Score", caption: "Skor real-time" },
  { id: "jadwal", label: "Jadwal", caption: "Filter & status" },
  { id: "bracket", label: "Bracket", caption: "Bagan knockout" },
  { id: "klasemen", label: "Klasemen", caption: "Tabel grup PBSI" },
];
