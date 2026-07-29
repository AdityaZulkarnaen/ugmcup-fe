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
  /** Entrant level of this draw. */
  tier: ParticipantTier;
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
  /** Entrant level of this draw. */
  tier: ParticipantTier;
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

/** Entrant level; the tournament runs a school draw beside the campus one. */
export type ParticipantTier = "sma" | "universitas";

export const participantTiers: { id: ParticipantTier; label: string }[] = [
  { id: "sma", label: "SMA/K" },
  { id: "universitas", label: "Universitas" },
];

export function tierLabel(id: string): string {
  return participantTiers.find((item) => item.id === id)?.label ?? id;
}

/** Tier filter options, with the "all" entry the panels open on. */
export const tierFilters: ScheduleFilter[] = [
  { id: "all", label: "Semua Jenjang" },
  ...participantTiers,
];

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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
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
    tier: "universitas",
    time: "16:00",
    level: "Open",
    court: "Lapangan 1",
    home: { players: ["Rizky Fadhilah", "Sinta Rahayu"], team: "FT UGM" },
    away: { players: ["Dani Setiawan", "Devi Kurnia"], team: "FEB UGM" },
    status: "upcoming",
  },
  // School draw
  {
    id: "sched-11",
    date: "2026-08-10",
    categoryId: "tunggal-putra",
    tier: "sma",
    time: "08:30",
    level: "U-19",
    court: "Lapangan 3",
    home: { players: ["Bima Anggara"], team: "SMAN 1 Yogyakarta" },
    away: { players: ["Rafa Pradipta"], team: "SMAN 3 Yogyakarta" },
    status: "done",
    winner: "home",
    games: [
      { home: 21, away: 17 },
      { home: 21, away: 19 },
    ],
  },
  {
    id: "sched-12",
    date: "2026-08-12",
    categoryId: "ganda-putra",
    tier: "sma",
    time: "10:00",
    level: "U-19",
    court: "Lapangan 3",
    home: { players: ["Bima Anggara", "Nanda Prasetyo"], team: "SMAN 1 Yogyakarta" },
    away: { players: ["Rafa Pradipta", "Yusuf Alfarizi"], team: "SMK 2 Depok" },
    status: "upcoming",
  },
  {
    id: "sched-13",
    date: "2026-08-14",
    categoryId: "tunggal-putri",
    tier: "sma",
    time: "13:30",
    level: "U-19",
    court: "Lapangan 2",
    home: { players: ["Nabila Ayu"], team: "SMAN 8 Yogyakarta" },
    away: { players: ["Kirana Puspita"], team: "SMA De Britto" },
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
  athlete("naufal-hakim", "Psikologi UGM", "Naufal Hakim"),
  athlete("oka-mahendra", "FTP UGM", "Oka Mahendra"),
  athlete("panji-wicaksono", "Biologi UGM", "Panji Wicaksono"),
  athlete("qomar-aditya", "Geografi UGM", "Qomar Aditya"),
  athlete("rendra-mahesa", "Kehutanan UGM", "Rendra Mahesa"),
  athlete("satria-wibowo", "Pertanian UGM", "Satria Wibowo"),
  athlete("teguh-prasetya", "Vokasi UGM", "Teguh Prasetya"),
  athlete("umar-faruq", "FKG UGM", "Umar Faruq"),
  athlete("vino-ardiansyah", "Filsafat UGM", "Vino Ardiansyah"),
  athlete("wisnu-baskara", "FT UGM", "Wisnu Baskara"),
  athlete("yoga-alfarizi", "FEB UGM", "Yoga Alfarizi"),
  athlete("zidan-maulana", "FISIPOL UGM", "Zidan Maulana"),
  athlete("aldo-kurniawan", "FMIPA UGM", "Aldo Kurniawan"),
  athlete("bayu-anggara", "FK-KMK UGM", "Bayu Anggara"),
  athlete("cakra-pratomo", "FIB UGM", "Cakra Pratomo"),
  athlete("damar-sanjaya", "FH UGM", "Damar Sanjaya"),
  athlete("erlangga-putra", "Fapet UGM", "Erlangga Putra"),
  athlete("farhan-ridho", "Farmasi UGM", "Farhan Ridho"),
  athlete("gani-pradana", "Psikologi UGM", "Gani Pradana"),
  athlete("hafiz-ramadhan", "FTP UGM", "Hafiz Ramadhan"),
  athlete("irfan-nugroho", "Biologi UGM", "Irfan Nugroho"),
  athlete("julian-syahputra", "Geografi UGM", "Julian Syahputra"),
  athlete("kevin-halim", "Kehutanan UGM", "Kevin Halim"),
  athlete("lukman-hakim", "Pertanian UGM", "Lukman Hakim"),

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

/**
 * Why a match ended before it was played out. The opponent advances either way;
 * the bracket marks the side that could not finish.
 */
export type RetirementReason = "cedera" | "wo";

export const retirementLabels: Record<RetirementReason, string> = {
  cedera: "Mundur karena cedera",
  wo: "Walkover — tidak hadir",
};

/** One competitor slot inside a bracket match. */
export interface BracketSide {
  /** Registry id; omitted while the slot is still undecided (shows "TBD"). */
  participantId?: string;
  name?: string;
  inst?: string;
  avatar?: string;
  isBye?: boolean;
  /** Games won; `null` when the match has not been played. */
  score: number | null;
  /** True for the side that advances. */
  winner?: boolean;
  /** Set on the losing side when the match ended early. */
  retired?: RetirementReason;
}

export interface BracketMatch {
  id: string;
  home: BracketSide;
  away: BracketSide;
  isByeMatch?: boolean;
}

export interface BracketRound {
  id: string;
  label: string;
  matches: BracketMatch[];
  /** Set on the last column: renders the champion box instead of match cards. */
  champion?: { label: string; name: string; participantId?: string };
}

/** A knockout bracket for one discipline at one entrant level. */
export interface CategoryBracket {
  /** Composite key, `${disciplineId}-${tier}`. */
  id: string;
  label: string;
  disciplineId: string;
  tier: ParticipantTier;
  /** Entrants in first-round slot order; length must be a power of two. */
  seeds: string[];
  rounds: BracketRound[];
}

/**
 * Outcome of one match: winning side, then games won by winner and loser, and
 * optionally why the loser could not finish.
 * `null` means the match has not been played, so the next slot stays TBD.
 */
type MatchOutcome = [
  winner: 0 | 1,
  winnerScore: number,
  loserScore: number,
  retired?: RetirementReason,
];

/** Round names counting back from the final; index 0 is the last round. */
const roundLabels = [
  "Final",
  "Semi Final",
  "Perempat Final",
  "16 Besar",
  "32 Besar",
  "64 Besar",
  "128 Besar",
];

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
      /** Only ever set on the side that lost the match. */
      const retired = outcome?.[3];

      matches.push({
        id: `${categoryId}-r${r + 1}-m${i + 1}`,
        home: {
          participantId: homeId,
          score: outcome ? (homeWon ? outcome[1] : outcome[2]) : null,
          winner: homeWon || undefined,
          retired: homeWon ? undefined : retired,
        },
        away: {
          participantId: awayId,
          score: outcome ? (homeWon ? outcome[2] : outcome[1]) : null,
          winner: outcome && !homeWon ? true : undefined,
          retired: homeWon ? retired : undefined,
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
  disciplineId: string;
  tier: ParticipantTier;
  seeds: string[];
  outcomes: (MatchOutcome | null)[][];
}

/**
 * Mock brackets, deliberately at different stages: some categories are decided,
 * others still have matches to play.
 */
const bracketInputs: BracketInput[] = [
  {
    disciplineId: "tunggal-putra",
    tier: "universitas",
    // 32 entrants, so the draw runs 32 Besar -> Final over five rounds.
    seeds: [
      "rizky-fadhilah",
      "dani-setiawan",
      "arya-pratama",
      "bagas-nugroho",
      "candra-wijaya",
      "fajar-ramadhan",
      "galih-saputra",
      "hendra-kusuma",
      "naufal-hakim",
      "oka-mahendra",
      "panji-wicaksono",
      "qomar-aditya",
      "rendra-mahesa",
      "satria-wibowo",
      "teguh-prasetya",
      "umar-faruq",
      "vino-ardiansyah",
      "wisnu-baskara",
      "yoga-alfarizi",
      "zidan-maulana",
      "aldo-kurniawan",
      "bayu-anggara",
      "cakra-pratomo",
      "damar-sanjaya",
      "erlangga-putra",
      "farhan-ridho",
      "gani-pradana",
      "hafiz-ramadhan",
      "irfan-nugroho",
      "julian-syahputra",
      "kevin-halim",
      "lukman-hakim",
    ],
    outcomes: [
      // 32 Besar
      [
        [0, 2, 0],
        [1, 2, 1],
        [0, 2, 1],
        [1, 2, 0],
        [0, 2, 1],
        [0, 2, 0],
        [1, 2, 1],
        [0, 2, 1],
        [1, 2, 0],
        [0, 2, 1],
        [0, 2, 0],
        [1, 2, 1],
        [0, 2, 1],
        [1, 2, 0],
        [0, 2, 1],
        // Lawan mundur di tengah laga.
        [0, 2, 0, "cedera"],
      ],
      // 16 Besar
      [
        [0, 2, 1],
        [1, 2, 0],
        [0, 2, 0],
        [0, 2, 1],
        [1, 2, 1],
        [0, 2, 1],
        [0, 2, 0],
        [1, 2, 1],
      ],
      // Perempat Final
      [
        [0, 2, 1],
        // Lawan tidak hadir.
        [1, 2, 0, "wo"],
        [0, 2, 1],
        [0, 2, 0],
      ],
      // Semi Final — second match still to play.
      [[0, 2, 1], null],
      [null],
    ],
  },
  {
    disciplineId: "tunggal-putri",
    tier: "universitas",
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
    disciplineId: "ganda-putra",
    tier: "universitas",
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
    disciplineId: "ganda-putri",
    tier: "universitas",
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
      [[0, 2, 0], [1, 2, 1, "wo"], null, null],
      [null, null],
      [null],
    ],
  },
  {
    disciplineId: "ganda-campuran",
    tier: "universitas",
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

const schoolNames = [
  "SMAN 1 Yogyakarta",
  "SMAN 3 Yogyakarta",
  "SMAN 8 Yogyakarta",
  "SMA De Britto",
  "SMK 2 Depok",
  "SMAN 1 Sleman",
  "SMAN 2 Bantul",
  "SMA Stella Duce",
];
const schoolFirstNames = [
  "Bima",
  "Rafa",
  "Nanda",
  "Yusuf",
  "Aldi",
  "Reza",
  "Farel",
  "Zaki",
];
const schoolLastNames = [
  "Anggara",
  "Pradipta",
  "Prasetyo",
  "Alfarizi",
  "Mahendra",
  "Kurniawan",
  "Baskara",
  "Ramadhan",
];

/**
 * Placeholder entrants for the 64-player school draw. Generated rather than
 * listed one by one — the admin registry replaces this wholesale.
 */
const schoolSeeds: Participant[] = Array.from({ length: 64 }, (_, i) =>
  athlete(
    `sma-tp-${i + 1}`,
    schoolNames[i % schoolNames.length],
    `${schoolFirstNames[i % 8]} ${schoolLastNames[Math.floor(i / 8)]}`,
  ),
);
participants.push(...schoolSeeds);

/**
 * Deterministic placeholder results for a full draw: the higher seed advances
 * except on every third match, which is an upset.
 */
function generatedOutcomes(firstRoundMatches: number): (MatchOutcome | null)[][] {
  const outcomes: (MatchOutcome | null)[][] = [];
  for (let count = firstRoundMatches; count >= 1; count = count / 2) {
    outcomes.push(
      Array.from({ length: count }, (_, i): MatchOutcome => {
        const upset = (i + count) % 3 === 0;
        return [upset ? 1 : 0, 2, i % 2 === 0 ? 1 : 0];
      }),
    );
  }
  return outcomes;
}

// School draw: a 64-player singles bracket (6 rounds) beside a small doubles one.
bracketInputs.push(
  {
    disciplineId: "tunggal-putra",
    tier: "sma",
    seeds: schoolSeeds.map((entrant) => entrant.id),
    outcomes: generatedOutcomes(32),
  },
  {
    disciplineId: "ganda-putra",
    tier: "sma",
    seeds: schoolSeeds.slice(0, 8).map((entrant) => entrant.id),
    outcomes: generatedOutcomes(4),
  },
);

export const categoryBrackets: CategoryBracket[] = bracketInputs.map(
  ({ disciplineId, tier, seeds, outcomes }) => {
    const id = `${disciplineId}-${tier}`;
    return {
      id,
      label: disciplineLabel(disciplineId),
      disciplineId,
      tier,
      seeds,
      rounds: buildRounds(id, seeds, outcomes),
    };
  },
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
        ? [
            {
              participant,
              categoryId: bracket.id,
              categoryLabel: `${bracket.label} · ${tierLabel(bracket.tier)}`,
            },
          ]
        : [];
    }),
);

/** The bracket a match belongs to: its discipline within its entrant level. */
export function findBracketForMatch(
  categoryId: string,
  tier: ParticipantTier,
): CategoryBracket | undefined {
  return categoryBrackets.find(
    (bracket) => bracket.disciplineId === categoryId && bracket.tier === tier,
  );
}

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
  bracketId: string,
  players: string[],
): BracketAthlete | undefined {
  const key = sideName(players);
  return bracketAthletes.find(
    (athlete) =>
      athlete.categoryId === bracketId &&
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

/**
 * Single venue for the whole tournament, shown on the match detail page and in
 * the landing page venue section. `mapsUrl` is a plain Maps search so it keeps
 * working if the listing changes; swap it for the exact place link when the
 * committee has one.
 */
export const tournamentVenue = {
  name: "GOR Nusantara",
  org: "UGM",
  mapsUrl: "https://maps.app.goo.gl/Tw9cF2gCzB4LFM2t9",
};

export type MatchSideKey = "home" | "away";

/**
 * One score update recorded from the admin dashboard. Live scoring only needs
 * the side that won the rally — everything else (running score, who serves
 * next) is derived, so the operator taps one button per rally.
 */
export interface RallyEntry {
  scorer: MatchSideKey;
  /** Points added; defaults to 1. More when the operator catches up at once. */
  gained?: number;
}

/** Point-by-point record of one set. */
export interface SetHistory {
  /** Side that served the very first rally of the set. */
  firstServer: MatchSideKey;
  entries: RallyEntry[];
}

/**
 * Who is ahead after a rally and by how much. `chased` marks the rallies where
 * the trailing side scored, so the lead shrank instead of growing.
 */
export interface RallyLead {
  side: MatchSideKey;
  margin: number;
  chased: boolean;
}

/** A history row ready to render: derived score and serve holder included. */
export interface RallyRow {
  scorer: MatchSideKey;
  gained: number;
  /** Side that served this rally — the winner of the previous one. */
  server: MatchSideKey;
  /** Running score after this entry. */
  home: number;
  away: number;
  /** Point lead after this rally; `null` while the score is level. */
  lead: RallyLead | null;
}

/**
 * Expands recorded rallies into rows. Serve follows the badminton rally-scoring
 * rule: whoever won the last rally serves the next one.
 */
export function buildRallyRows(history: SetHistory): RallyRow[] {
  let home = 0;
  let away = 0;

  return history.entries.map((entry, index) => {
    const gained = entry.gained ?? 1;
    if (entry.scorer === "home") home += gained;
    else away += gained;

    const margin = Math.abs(home - away);
    const leader: MatchSideKey = home > away ? "home" : "away";

    return {
      scorer: entry.scorer,
      gained,
      server:
        index === 0 ? history.firstServer : history.entries[index - 1].scorer,
      home,
      away,
      lead:
        margin === 0
          ? null
          : { side: leader, margin, chased: leader !== entry.scorer },
    };
  });
}

/** Compact authoring helper: "HAHH" -> one entry per rally winner. */
function rallies(sequence: string, firstServer: MatchSideKey): SetHistory {
  return {
    firstServer,
    entries: [...sequence].map((mark) => ({
      scorer: mark === "H" ? "home" : "away",
    })),
  };
}

/**
 * Point-by-point histories, keyed by match id. Kept apart from the match record
 * because live scoring is its own stream — the admin dashboard appends to this
 * while the match record itself barely changes.
 */
export const matchHistories: Record<string, SetHistory[]> = {
  "sched-7": [
    rallies("HAHAHHAHAHHAHAHAHHAHAHHAHAHAHHAHAHHA", "home"),
    rallies("AHAHAHAHAHAHAAHAHAHAHAHAHAAHAHAHAHAHAHA", "home"),
    rallies("HAHHAHHAHHAHAHHAHHAHHAHAHHAHHAHHA", "away"),
  ],
  "match-1": [
    rallies("HAHAHAHAHAHHAHAHAHAHAHAHHAHAHAHAHAHAHHA", "home"),
    rallies("HAHAHAHHAHAHAHAHHAHAHAHHA", "home"),
  ],
};

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
  /** Discipline key, matches a `disciplines` id. */
  categoryId: string;
  tier: ParticipantTier;
  level: string;
  court: string;
  home: MatchSide;
  away: MatchSide;
  sets: MatchDetailSet[];
  status: ScheduleStatus;
  winner?: MatchSideKey;
  /** Set in progress, e.g. "Set 2"; live matches only. */
  setLabel?: string;
  /** Point-by-point record per set; empty when nothing was logged. */
  history: SetHistory[];
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
      tier: live.tier,
      level: live.level,
      court: live.court,
      home: live.home,
      away: live.away,
      sets: [...live.games, { ...live.live, inProgress: true }],
      status: "live",
      setLabel: live.setLabel,
      history: matchHistories[live.id] ?? [],
    };
  }

  const scheduled = scheduleMatches.find((match) => match.id === id);
  if (!scheduled) return undefined;

  return {
    id: scheduled.id,
    startsAt: formatMatchDateTime(scheduled.date, scheduled.time),
    category: disciplineLabel(scheduled.categoryId),
    categoryId: scheduled.categoryId,
    tier: scheduled.tier,
    level: scheduled.level,
    court: scheduled.court,
    home: scheduled.home,
    away: scheduled.away,
    sets: scheduled.games ?? [],
    status: scheduled.status,
    winner: scheduled.winner,
    history: matchHistories[scheduled.id] ?? [],
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
  { id: "livescore", label: "Live Score", caption: "" },
  { id: "jadwal", label: "Jadwal", caption: "" },
  { id: "bracket", label: "Bracket", caption: "" },
  { id: "klasemen", label: "Klasemen Beregu", caption: "" },
];
