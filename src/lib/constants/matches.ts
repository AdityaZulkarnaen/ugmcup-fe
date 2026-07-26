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
