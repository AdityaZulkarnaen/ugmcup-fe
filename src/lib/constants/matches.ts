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
  /** Discipline key, matches a `disciplines` id. */
  categoryId: string;
  /** Age group / division, e.g. "U-21" or "Open". */
  level: string;
  /** ISO day the match is played on, e.g. "2026-08-10". */
  date: string;
  /** Start time, e.g. "11:30". */
  time: string;
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
    categoryId: "tunggal-putra",
    level: "U-21",
    date: "2026-08-10",
    time: "11:30",
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
    categoryId: "ganda-putri",
    level: "Open",
    date: "2026-08-10",
    time: "12:15",
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
    categoryId: "ganda-campuran",
    level: "U-19",
    date: "2026-08-10",
    time: "13:00",
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
  /** ISO day the match is played on, e.g. "2026-08-09"; drives the day filter. */
  date: string;
  /** Category filter key, matches a `disciplines` id. */
  categoryId: string;
  /** Start time, e.g. "08:00". */
  time: string;
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

/**
 * Single source of truth for the disciplines. The schedule filter, the bracket
 * categories and every match record key off these ids, so an admin-supplied
 * match only has to carry the id.
 */
export const disciplines: ScheduleFilter[] = [
  { id: "tunggal-putra", label: "Tunggal Putra" },
  { id: "tunggal-putri", label: "Tunggal Putri" },
  { id: "ganda-putra", label: "Ganda Putra" },
  { id: "ganda-putri", label: "Ganda Putri" },
  { id: "ganda-campuran", label: "Ganda Campuran" },
];

export function disciplineLabel(id: string): string {
  return disciplines.find((item) => item.id === id)?.label ?? id;
}

export const scheduleCategories: ScheduleFilter[] = [
  { id: "all", label: "Semua" },
  ...disciplines,
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-08-09" -> "Min, 9 Agu". Read as UTC so the label never shifts. */
export function formatMatchDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${dayNames[weekday]}, ${day} ${monthNames[month - 1]}`;
}

export const scheduleMatches: ScheduleMatch[] = [
  {
    id: "sched-7",
    date: "2026-08-09",
    categoryId: "tunggal-putra",
    time: "11:30",
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
    date: "2026-08-09",
    categoryId: "ganda-putra",
    time: "15:45",
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
  {
    id: "sched-1",
    date: "2026-08-10",
    categoryId: "tunggal-putra",
    time: "11:30",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah"], team: "FT UGM" },
    away: { players: ["Arya Pratama"], team: "FEB UGM" },
    status: "live",
  },
  {
    id: "sched-2",
    date: "2026-08-10",
    categoryId: "ganda-putri",
    time: "12:15",
    level: "Open",
    court: "Lapangan 2",
    home: { players: ["Sinta Rahayu", "Devi Kurnia"], team: "FT UGM" },
    away: { players: ["Layla Azhar", "Putri Wulandari"], team: "FEB UGM" },
    status: "live",
  },
  {
    id: "sched-3",
    date: "2026-08-11",
    categoryId: "ganda-putra",
    time: "08:00",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-4",
    date: "2026-08-11",
    categoryId: "tunggal-putra",
    time: "10:15",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah"], team: "FT UGM" },
    away: { players: ["Bagas Nugroho"], team: "FMIPA UGM" },
    status: "upcoming",
  },
  {
    id: "sched-5",
    date: "2026-08-12",
    categoryId: "ganda-putra",
    time: "09:00",
    level: "U-21",
    court: "Lapangan 1",
    home: { players: ["Dani Setiawan", "Hendra Kusuma"], team: "FT UGM" },
    away: { players: ["Adi Nugraha", "Bayu Saputra"], team: "FISIPOL UGM" },
    status: "upcoming",
  },
  {
    id: "sched-6",
    date: "2026-08-13",
    categoryId: "ganda-putra",
    time: "13:00",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Eko Purnomo", "Firman Hidayat"], team: "FK-KMK UGM" },
    away: { players: ["Yogi Pratama", "Wahyu Nugroho"], team: "FEB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-9",
    date: "2026-08-14",
    categoryId: "tunggal-putri",
    time: "09:30",
    level: "Open",
    court: "Lapangan 2",
    home: { players: ["Sinta Rahayu"], team: "FT UGM" },
    away: { players: ["Rani Oktaviani"], team: "FIB UGM" },
    status: "upcoming",
  },
  {
    id: "sched-10",
    date: "2026-08-15",
    categoryId: "ganda-campuran",
    time: "16:00",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah", "Sinta Rahayu"], team: "FT UGM" },
    away: { players: ["Dani Setiawan", "Devi Kurnia"], team: "FEB UGM" },
    status: "upcoming",
  },
];

/**
 * Day filters built from the matches themselves, so a match the admin adds on a
 * new day shows up in the filter without this list being touched.
 */
export const scheduleDays: ScheduleFilter[] = [
  { id: "all", label: "Semua" },
  ...Array.from(new Set(scheduleMatches.map((match) => match.date)))
    .sort()
    .map((date) => ({ id: date, label: formatMatchDay(date) })),
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

/** Compact registry entry helper: `athlete(id, team, ...players)`. */
function athlete(id: string, team: string, ...players: string[]): Participant {
  return { id, players, team };
}

export const participants: Participant[] = [
  // Tunggal Putra
  athlete("rizky-fadhilah", "FT UGM", "Rizky Fadhilah"),
  {
    ...athlete("dani-setiawan", "FEB UGM", "Dani Setiawan"),
    // Demo of an admin-supplied badge; drop this line to fall back to the mark.
    avatar: "/images/global/Logo icon.svg",
  },
  athlete("arya-pratama", "FISIPOL UGM", "Arya Pratama"),
  athlete("bagas-nugroho", "FMIPA UGM", "Bagas Nugroho"),
  athlete("candra-wijaya", "FK-KMK UGM", "Candra Wijaya"),
  athlete("fajar-ramadhan", "FIB UGM", "Fajar Ramadhan"),
  athlete("galih-saputra", "FH UGM", "Galih Saputra"),
  athlete("hendra-kusuma", "Fapet UGM", "Hendra Kusuma"),

  // Tunggal Putri
  athlete("sinta-rahayu", "FT UGM", "Sinta Rahayu"),
  athlete("devi-kurnia", "FEB UGM", "Devi Kurnia"),
  athlete("layla-azhar", "FISIPOL UGM", "Layla Azhar"),
  athlete("putri-wulandari", "FMIPA UGM", "Putri Wulandari"),
  athlete("anisa-maharani", "FK-KMK UGM", "Anisa Maharani"),
  athlete("rani-oktaviani", "FIB UGM", "Rani Oktaviani"),
  athlete("tiara-safitri", "FH UGM", "Tiara Safitri"),
  athlete("maya-lestari", "Farmasi UGM", "Maya Lestari"),

  // Ganda Putra
  athlete("gpa-dani-hendra", "FT UGM", "Dani Setiawan", "Hendra Kusuma"),
  athlete("gpa-yogi-wahyu", "FEB UGM", "Yogi Pratama", "Wahyu Nugroho"),
  athlete("gpa-adi-bayu", "FISIPOL UGM", "Adi Nugraha", "Bayu Saputra"),
  athlete("gpa-cakra-dimas", "FMIPA UGM", "Cakra Aditya", "Dimas Prakoso"),
  athlete("gpa-eko-firman", "FK-KMK UGM", "Eko Purnomo", "Firman Hidayat"),
  athlete("gpa-gilang-haris", "FIB UGM", "Gilang Ramadhan", "Haris Setiadi"),
  athlete("gpa-ilham-joko", "FH UGM", "Ilham Maulana", "Joko Susanto"),
  athlete("gpa-krisna-lutfi", "Fapet UGM", "Krisna Adi", "Lutfi Hakim"),

  // Ganda Putri
  athlete("gpi-sinta-devi", "FT UGM", "Sinta Rahayu", "Devi Kurnia"),
  athlete("gpi-layla-putri", "FEB UGM", "Layla Azhar", "Putri Wulandari"),
  athlete("gpi-anisa-rani", "FISIPOL UGM", "Anisa Maharani", "Rani Oktaviani"),
  athlete("gpi-tiara-maya", "FMIPA UGM", "Tiara Safitri", "Maya Lestari"),
  athlete("gpi-bella-citra", "FK-KMK UGM", "Bella Anggraini", "Citra Dewi"),
  athlete("gpi-dinda-elsa", "FIB UGM", "Dinda Paramita", "Elsa Wijayanti"),
  athlete("gpi-fira-gita", "FH UGM", "Fira Ananda", "Gita Permata"),
  athlete("gpi-hana-indah", "Farmasi UGM", "Hana Salsabila", "Indah Puspita"),

  // Ganda Campuran
  athlete("gc-rizky-sinta", "FT UGM", "Rizky Fadhilah", "Sinta Rahayu"),
  athlete("gc-dani-devi", "FEB UGM", "Dani Setiawan", "Devi Kurnia"),
  athlete("gc-arya-layla", "FISIPOL UGM", "Arya Pratama", "Layla Azhar"),
  athlete("gc-bagas-putri", "FMIPA UGM", "Bagas Nugroho", "Putri Wulandari"),
  athlete("gc-candra-anisa", "FK-KMK UGM", "Candra Wijaya", "Anisa Maharani"),
  athlete("gc-fajar-rani", "FIB UGM", "Fajar Ramadhan", "Rani Oktaviani"),
  athlete("gc-galih-tiara", "FH UGM", "Galih Saputra", "Tiara Safitri"),
  athlete("gc-hendra-maya", "Fapet UGM", "Hendra Kusuma", "Maya Lestari"),
];

export function getParticipant(id: string): Participant | undefined {
  return participants.find((participant) => participant.id === id);
}

/** Display name for a side; doubles pairs are joined with a dash. */
export function sideName(players: string[]): string {
  return players.join(" - ");
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
  champion?: { label: string; name: string; participantId?: string };
}

/** A knockout bracket for one discipline, e.g. Tunggal Putra. */
export interface CategoryBracket {
  id: string;
  label: string;
  /** Entrants in first-round slot order; length must be a power of two. */
  seeds: string[];
  rounds: BracketRound[];
}

/**
 * Outcome of one match: winning side, then games won by winner and loser.
 * `null` means the match has not been played, so the next slot stays TBD.
 */
type MatchOutcome = [winner: 0 | 1, winnerScore: number, loserScore: number];

/** Round names counting back from the final; index 0 is the last round. */
const roundLabels = ["Final", "Semi Final", "Perempat Final", "16 Besar"];

/**
 * Expands seeds plus per-round outcomes into bracket rounds, so a winner always
 * lands in the right slot of the next round and the champion box follows from
 * the final. Unplayed matches leave the slots ahead of them empty (TBD).
 */
function buildRounds(
  categoryId: string,
  seeds: string[],
  outcomes: (MatchOutcome | null)[][],
): BracketRound[] {
  const rounds: BracketRound[] = [];
  let slots: (string | undefined)[] = seeds;
  const totalRounds = Math.log2(seeds.length);

  for (let r = 0; r < totalRounds; r++) {
    const matches: BracketMatch[] = [];
    const winners: (string | undefined)[] = [];

    for (let i = 0; i < slots.length / 2; i++) {
      const homeId = slots[2 * i];
      const awayId = slots[2 * i + 1];
      const outcome = outcomes[r]?.[i] ?? null;
      const homeWon = outcome?.[0] === 0;

      matches.push({
        id: `${categoryId}-r${r + 1}-m${i + 1}`,
        home: {
          participantId: homeId,
          score: outcome ? (homeWon ? outcome[1] : outcome[2]) : null,
          winner: homeWon || undefined,
        },
        away: {
          participantId: awayId,
          score: outcome ? (homeWon ? outcome[2] : outcome[1]) : null,
          winner: outcome && !homeWon ? true : undefined,
        },
      });
      winners.push(outcome ? (homeWon ? homeId : awayId) : undefined);
    }

    rounds.push({
      id: `${categoryId}-r${r + 1}`,
      label: roundLabels[totalRounds - 1 - r] ?? `Babak ${r + 1}`,
      matches,
    });
    slots = winners;
  }

  const championId = slots[0];
  const champion = championId ? getParticipant(championId) : undefined;
  rounds.push({
    id: `${categoryId}-juara`,
    label: "Juara",
    matches: [],
    champion: {
      label: "Juara",
      name: champion ? sideName(champion.players) : "TBD",
      participantId: championId,
    },
  });

  return rounds;
}

interface BracketInput {
  id: string;
  label: string;
  seeds: string[];
  outcomes: (MatchOutcome | null)[][];
}

/**
 * Mock brackets, deliberately at different stages: some categories are decided,
 * others still have matches to play.
 */
const bracketInputs: BracketInput[] = [
  {
    id: "tunggal-putra",
    label: "Tunggal Putra",
    seeds: [
      "rizky-fadhilah",
      "dani-setiawan",
      "arya-pratama",
      "bagas-nugroho",
      "candra-wijaya",
      "fajar-ramadhan",
      "galih-saputra",
      "hendra-kusuma",
    ],
    outcomes: [
      [
        [0, 2, 0],
        [1, 2, 1],
        [0, 2, 1],
        [1, 2, 0],
      ],
      [[0, 2, 1], null],
      [null],
    ],
  },
  {
    id: "tunggal-putri",
    label: "Tunggal Putri",
    seeds: [
      "sinta-rahayu",
      "devi-kurnia",
      "layla-azhar",
      "putri-wulandari",
      "anisa-maharani",
      "rani-oktaviani",
      "tiara-safitri",
      "maya-lestari",
    ],
    outcomes: [
      [
        [0, 2, 1],
        [0, 2, 0],
        [1, 2, 1],
        [0, 2, 1],
      ],
      [
        [1, 2, 0],
        [0, 2, 1],
      ],
      [[1, 2, 1]],
    ],
  },
  {
    id: "ganda-putra",
    label: "Ganda Putra",
    seeds: [
      "gpa-dani-hendra",
      "gpa-yogi-wahyu",
      "gpa-adi-bayu",
      "gpa-cakra-dimas",
      "gpa-eko-firman",
      "gpa-gilang-haris",
      "gpa-ilham-joko",
      "gpa-krisna-lutfi",
    ],
    outcomes: [
      [
        [0, 2, 1],
        [1, 2, 0],
        [0, 2, 1],
        [0, 2, 1],
      ],
      [null, null],
      [null],
    ],
  },
  {
    id: "ganda-putri",
    label: "Ganda Putri",
    seeds: [
      "gpi-sinta-devi",
      "gpi-layla-putri",
      "gpi-anisa-rani",
      "gpi-tiara-maya",
      "gpi-bella-citra",
      "gpi-dinda-elsa",
      "gpi-fira-gita",
      "gpi-hana-indah",
    ],
    outcomes: [
      [[0, 2, 0], [1, 2, 1], null, null],
      [null, null],
      [null],
    ],
  },
  {
    id: "ganda-campuran",
    label: "Ganda Campuran",
    seeds: [
      "gc-rizky-sinta",
      "gc-dani-devi",
      "gc-arya-layla",
      "gc-bagas-putri",
      "gc-candra-anisa",
      "gc-fajar-rani",
      "gc-galih-tiara",
      "gc-hendra-maya",
    ],
    outcomes: [
      [
        [1, 2, 1],
        [0, 2, 1],
        [0, 2, 0],
        [1, 2, 1],
      ],
      [
        [0, 2, 1],
        [1, 2, 0],
      ],
      [[0, 2, 0]],
    ],
  },
];

export const categoryBrackets: CategoryBracket[] = bracketInputs.map(
  ({ id, label, seeds, outcomes }) => ({
    id,
    label,
    seeds,
    rounds: buildRounds(id, seeds, outcomes),
  }),
);

/** One searchable entrant, tagged with the bracket they compete in. */
export interface BracketAthlete {
  participant: Participant;
  categoryId: string;
  categoryLabel: string;
}

export const bracketAthletes: BracketAthlete[] = categoryBrackets.flatMap(
  (bracket) =>
    bracket.seeds.flatMap((id) => {
      const participant = getParticipant(id);
      return participant
        ? [{ participant, categoryId: bracket.id, categoryLabel: bracket.label }]
        : [];
    }),
);

/**
 * Keys of every column slot a participant occupies: the ids of the matches they
 * play, plus the champion column id when they win the final. Feeding this to the
 * bracket lights up their run from the first round to where they stand now.
 */
export function bracketPathFor(
  bracket: CategoryBracket,
  participantId?: string,
): Set<string> {
  const path = new Set<string>();
  if (!participantId) return path;

  for (const round of bracket.rounds) {
    for (const match of round.matches) {
      if (
        match.home.participantId === participantId ||
        match.away.participantId === participantId
      ) {
        path.add(match.id);
      }
    }
    if (round.champion?.participantId === participantId) path.add(round.id);
  }

  return path;
}

/**
 * Best-effort link from a match side to its bracket entry, matched on names.
 * Returns undefined when that side never entered the knockout stage.
 */
export function findBracketAthlete(
  categoryId: string,
  players: string[],
): BracketAthlete | undefined {
  const key = sideName(players);
  return bracketAthletes.find(
    (athlete) =>
      athlete.categoryId === categoryId &&
      sideName(athlete.participant.players) === key,
  );
}

/** Name/team search across every bracket; empty query returns nothing. */
export function searchBracketAthletes(
  query: string,
  limit = 6,
): BracketAthlete[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return bracketAthletes
    .filter(({ participant, categoryLabel }) =>
      [...participant.players, participant.team, categoryLabel].some((field) =>
        field.toLowerCase().includes(needle),
      ),
    )
    .slice(0, limit);
}

/** Single venue for the whole tournament, shown on the match detail page. */
export const tournamentVenue = { name: "GOR Nusantara", org: "UGM" };

/** One set of a match; the set in progress is not counted in the totals yet. */
export interface MatchDetailSet extends MatchGame {
  inProgress?: boolean;
}

/**
 * A live or scheduled match flattened into everything the statistics page
 * shows, so the page does not care which list the match came from.
 */
export interface MatchDetail {
  id: string;
  /** Display stamp, e.g. "10.08.2026 11:30". */
  startsAt: string;
  category: string;
  /** Bracket key, matches a `categoryBrackets` id. */
  categoryId: string;
  level: string;
  court: string;
  home: MatchSide;
  away: MatchSide;
  sets: MatchDetailSet[];
  status: ScheduleStatus;
  winner?: "home" | "away";
  /** Set in progress, e.g. "Set 2"; live matches only. */
  setLabel?: string;
}

/** "2026-08-10" + "11:30" -> "10.08.2026 11:30". */
export function formatMatchDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year} ${time}`;
}

/** Sets won, ignoring the one still being played. */
export function setsWon(sets: MatchDetailSet[], side: "home" | "away"): number {
  return sets.filter(
    (set) =>
      !set.inProgress &&
      (side === "home" ? set.home > set.away : set.away > set.home),
  ).length;
}

/** Resolves a live or scheduled match id into its statistics-page shape. */
export function getMatchDetail(id: string): MatchDetail | undefined {
  const live = liveMatches.find((match) => match.id === id);
  if (live) {
    return {
      id: live.id,
      startsAt: formatMatchDateTime(live.date, live.time),
      category: disciplineLabel(live.categoryId),
      categoryId: live.categoryId,
      level: live.level,
      court: live.court,
      home: live.home,
      away: live.away,
      sets: [...live.games, { ...live.live, inProgress: true }],
      status: "live",
      setLabel: live.setLabel,
    };
  }

  const scheduled = scheduleMatches.find((match) => match.id === id);
  if (!scheduled) return undefined;

  return {
    id: scheduled.id,
    startsAt: formatMatchDateTime(scheduled.date, scheduled.time),
    category: disciplineLabel(scheduled.categoryId),
    categoryId: scheduled.categoryId,
    level: scheduled.level,
    court: scheduled.court,
    home: scheduled.home,
    away: scheduled.away,
    sets: scheduled.games ?? [],
    status: scheduled.status,
    winner: scheduled.winner,
  };
}

/** Every match id that has a statistics page, for static prerendering. */
export function matchDetailIds(): string[] {
  return [
    ...liveMatches.map((match) => match.id),
    ...scheduleMatches.map((match) => match.id),
  ];
}

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
