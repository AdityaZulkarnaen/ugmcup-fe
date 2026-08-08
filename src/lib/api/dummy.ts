/**
 * ============================================================================
 *  DATA DUMMY UNTUK UJI TAMPILAN
 * ============================================================================
 *
 *  Selama data asli dari API masih kosong, file ini menyuplai data palsu ke
 *  `getPublicMatches()` supaya halaman Pertandingan bisa dicek tampilannya.
 *  Dashboard admin TIDAK terpengaruh — di sana tetap memakai data asli.
 *
 *  ⬇️  UNTUK KEMBALI KE DATA ASLI: komentari SATU baris `matches:` pada objek
 *      `DUMMY_DATA` di bagian paling bawah file ini. Tidak ada file lain yang
 *      perlu disentuh.
 * ============================================================================
 */

import type {
  Athlete,
  Institution,
  Match,
  MatchSet,
  MatchStatus,
  Participant,
  ParticipantAthlete,
  Team,
} from "@/lib/types";
import { DISCIPLINES } from "@/lib/constants";

// ---------------------------------------------------------------- helpers ---

const CREATED_AT = "2026-07-01T00:00:00+07:00";

function institution(
  id: string,
  name: string,
  type: Institution["type"] = "UNIVERSITAS"
): Institution {
  return { id, name, type, createdAt: CREATED_AT };
}

const INSTITUTIONS = {
  ugm: institution("inst-ugm", "Universitas Gadjah Mada"),
  ui: institution("inst-ui", "Universitas Indonesia"),
  itb: institution("inst-itb", "Institut Teknologi Bandung"),
  its: institution("inst-its", "Institut Teknologi Sepuluh Nopember"),
  unair: institution("inst-unair", "Universitas Airlangga"),
  undip: institution("inst-undip", "Universitas Diponegoro"),
  ipb: institution("inst-ipb", "Institut Pertanian Bogor"),
  unpad: institution("inst-unpad", "Universitas Padjadjaran"),
  sma3: institution("inst-sman3yk", "SMA Negeri 3 Yogyakarta", "SMA"),
  sma8: institution("inst-sman8yk", "SMA Negeri 8 Yogyakarta", "SMA"),
  smadeb: institution("inst-smadebritto", "SMA Kolese De Britto", "SMA"),
  sma1sol: institution("inst-sman1solo", "SMA Negeri 1 Surakarta", "SMA"),
};

let athleteSeq = 0;

function athlete(
  inst: Institution,
  name: string,
  gender: Athlete["gender"],
  isSeeded = false
): Athlete {
  athleteSeq += 1;
  return {
    id: `ath-${athleteSeq}`,
    institutionId: inst.id,
    name,
    gender,
    isSeeded,
    createdAt: CREATED_AT,
    institution: inst,
  };
}

let participantSeq = 0;

/** Bentuk satu peserta (tunggal = 1 atlet, ganda = 2 atlet). */
function participant(
  disciplineId: string,
  inst: Institution,
  athletes: Athlete[],
  seedNumber?: number
): Participant {
  participantSeq += 1;
  const id = `part-${participantSeq}`;
  const members: ParticipantAthlete[] = athletes.map((a, i) => ({
    id: `${id}-a${i + 1}`,
    participantId: id,
    athleteId: a.id,
    athlete: a,
  }));
  return {
    id,
    disciplineId,
    institutionId: inst.id,
    seedNumber,
    institution: inst,
    athletes: members,
  };
}

let teamSeq = 0;

/**
 * Susunan partai satu tie beregu: 3 tunggal + 2 ganda. Urutannya ikut dipakai
 * sebagai urutan kartu partai di halaman detail, dan nama slotnya harus sama
 * dengan yang dikenali `formatSlotLabel()`.
 */
const BEREGU_SLOTS: Array<{
  slot: string;
  size: number;
  gender: Athlete["gender"];
}> = [
  { slot: "TUNGGAL_1", size: 1, gender: "LAKI_LAKI" },
  { slot: "GANDA_1", size: 2, gender: "LAKI_LAKI" },
  { slot: "TUNGGAL_2", size: 1, gender: "PEREMPUAN" },
  { slot: "GANDA_2", size: 2, gender: "PEREMPUAN" },
  { slot: "TUNGGAL_3", size: 1, gender: "LAKI_LAKI" },
];

/**
 * Bentuk satu tim. `squad` diisi nama atlet berurutan sesuai `BEREGU_SLOTS` —
 * dari situlah nama pemain tiap partai beregu dibaca di halaman detail.
 */
function team(disciplineId: string, inst: Institution, squad?: string[]): Team {
  teamSeq += 1;
  const id = `team-${teamSeq}`;

  let cursor = 0;
  const members = squad?.length
    ? BEREGU_SLOTS.flatMap(({ slot, size, gender }) => {
        const names = squad.slice(cursor, cursor + size);
        cursor += size;
        return names.map((name, i) => {
          const player = athlete(inst, name, gender);
          return {
            id: `${id}-${slot.toLowerCase()}-${i + 1}`,
            teamId: id,
            athleteId: player.id,
            assignedSlot: slot,
            athlete: player,
          };
        });
      })
    : undefined;

  return {
    id,
    disciplineId,
    institutionId: inst.id,
    institution: inst,
    members,
  };
}

function discipline(disciplineId: string) {
  const found = DISCIPLINES.find((d) => d.id === disciplineId);
  return {
    id: disciplineId,
    categoryId: found?.level ?? "univ",
    name: found?.name ?? disciplineId,
    type: found?.type ?? "TUNGGAL_PUTRA",
    isTeamEvent: found?.isTeamEvent ?? false,
  };
}

let matchSeq = 0;

interface MatchDraft {
  disciplineId: string;
  roundName: string;
  stage?: Match["stage"];
  groupName?: string;
  court: number;
  /** Waktu lokal WIB, mis. "2026-08-15T08:00". */
  time: string;
  status: MatchStatus;
  a: Participant | Team;
  b: Participant | Team;
  /** Skor tiap gim, mis. [[21, 15], [21, 18]]. */
  scores?: Array<[number, number]>;
  /** "a" atau "b" — dikosongkan kalau belum ada pemenang. */
  winner?: "a" | "b";
  /**
   * Rincian partai untuk match beregu. Kalau dikosongkan, jumlahnya mengikuti
   * `BEREGU_SLOTS` dengan status SCHEDULED — halaman detail beregu memang
   * seluruhnya digerakkan oleh daftar ini.
   */
  parties?: PartyDraft[];
}

/** Satu partai di dalam match beregu; slotnya diambil dari `BEREGU_SLOTS`. */
interface PartyDraft {
  status: MatchStatus;
  scores?: Array<[number, number]>;
  winner?: "a" | "b";
}

function isTeam(side: Participant | Team): side is Team {
  return "members" in side || side.id.startsWith("team-");
}

function buildSets(matchId: string, scores?: Array<[number, number]>): MatchSet[] {
  return (scores ?? []).map((score, i) => ({
    id: `${matchId}-set${i + 1}`,
    matchId,
    setNumber: i + 1,
    scoreA: score[0],
    scoreB: score[1],
    isFinished: true,
  }));
}

/** Susun lima partai anak dari sebuah match beregu. */
function buildParties(parentId: string, draft: MatchDraft, teamA: Team, teamB: Team): Match[] {
  return BEREGU_SLOTS.map(({ slot }, i) => {
    const party = draft.parties?.[i] ?? { status: "SCHEDULED" as MatchStatus };
    const id = `${parentId}-p${i + 1}`;
    const winnerTeam =
      party.winner === "a" ? teamA.id : party.winner === "b" ? teamB.id : undefined;

    return {
      id,
      disciplineId: draft.disciplineId,
      parentMatchId: parentId,
      slotType: slot,
      matchType: "INDIVIDUAL" as const,
      stage: draft.stage ?? "KNOCKOUT",
      roundName: draft.roundName,
      groupName: draft.groupName,
      teamAId: teamA.id,
      teamBId: teamB.id,
      courtNumber: draft.court,
      scheduledTime: `${draft.time}:00+07:00`,
      status: party.status,
      winnerTeamId: winnerTeam,
      version: 1,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
      sets: buildSets(id, party.scores),
      teamA,
      teamB,
      discipline: discipline(draft.disciplineId),
    };
  });
}

function buildMatch(draft: MatchDraft): Match {
  matchSeq += 1;
  const id = `match-${matchSeq}`;
  const teamMatch = isTeam(draft.a);

  const sets: MatchSet[] = buildSets(id, draft.scores);

  const winnerSide = draft.winner === "a" ? draft.a : draft.winner === "b" ? draft.b : undefined;

  return {
    id,
    disciplineId: draft.disciplineId,
    matchType: teamMatch ? "TEAM" : "INDIVIDUAL",
    stage: draft.stage ?? "KNOCKOUT",
    roundName: draft.roundName,
    groupName: draft.groupName,
    participantAId: teamMatch ? undefined : draft.a.id,
    participantBId: teamMatch ? undefined : draft.b.id,
    teamAId: teamMatch ? draft.a.id : undefined,
    teamBId: teamMatch ? draft.b.id : undefined,
    courtNumber: draft.court,
    scheduledTime: `${draft.time}:00+07:00`,
    status: draft.status,
    winnerParticipantId: teamMatch ? undefined : winnerSide?.id,
    winnerTeamId: teamMatch ? winnerSide?.id : undefined,
    version: 1,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    sets,
    participantA: teamMatch ? undefined : (draft.a as Participant),
    participantB: teamMatch ? undefined : (draft.b as Participant),
    teamA: teamMatch ? (draft.a as Team) : undefined,
    teamB: teamMatch ? (draft.b as Team) : undefined,
    discipline: discipline(draft.disciplineId),
    childMatches: teamMatch
      ? buildParties(id, draft, draft.a as Team, draft.b as Team)
      : undefined,
  };
}

// ------------------------------------------------------------- pesertanya ---

const A = INSTITUTIONS;

// Tunggal Putra Universitas
const tpUgm = participant("univ-tp", A.ugm, [athlete(A.ugm, "Bagas Prakoso", "LAKI_LAKI", true)], 1);
const tpUi = participant("univ-tp", A.ui, [athlete(A.ui, "Reza Hidayat", "LAKI_LAKI")]);
const tpItb = participant("univ-tp", A.itb, [athlete(A.itb, "Fajar Nugroho", "LAKI_LAKI")]);
const tpIts = participant("univ-tp", A.its, [athlete(A.its, "Yoga Pratama", "LAKI_LAKI")]);

// Tunggal Putri Universitas
const tpiUgm = participant("univ-tpi", A.ugm, [athlete(A.ugm, "Alya Rahmawati", "PEREMPUAN", true)], 1);
const tpiUnair = participant("univ-tpi", A.unair, [athlete(A.unair, "Nadia Salsabila", "PEREMPUAN")]);
const tpiUndip = participant("univ-tpi", A.undip, [athlete(A.undip, "Kirana Maheswari", "PEREMPUAN")]);
const tpiUnpad = participant("univ-tpi", A.unpad, [athlete(A.unpad, "Salma Aulia", "PEREMPUAN")]);

// Ganda Putra Universitas
const gpUgm = participant("univ-gp", A.ugm, [
  athlete(A.ugm, "Dimas Anggara", "LAKI_LAKI"),
  athlete(A.ugm, "Rifky Maulana", "LAKI_LAKI"),
]);
const gpIpb = participant("univ-gp", A.ipb, [
  athlete(A.ipb, "Arif Setiawan", "LAKI_LAKI"),
  athlete(A.ipb, "Bayu Kurniawan", "LAKI_LAKI"),
]);
const gpUndip = participant("univ-gp", A.undip, [
  athlete(A.undip, "Galih Saputra", "LAKI_LAKI"),
  athlete(A.undip, "Hendra Wijaya", "LAKI_LAKI"),
]);
const gpUi = participant("univ-gp", A.ui, [
  athlete(A.ui, "Naufal Ramadhan", "LAKI_LAKI"),
  athlete(A.ui, "Farhan Aditya", "LAKI_LAKI"),
]);

// Ganda Campuran Universitas
const gcUgm = participant("univ-gc", A.ugm, [
  athlete(A.ugm, "Satria Pinandita", "LAKI_LAKI", true),
  athlete(A.ugm, "Alisha Artha", "PEREMPUAN", true),
], 1);
const gcUnair = participant("univ-gc", A.unair, [
  athlete(A.unair, "Leo Kenzie Putra", "LAKI_LAKI"),
  athlete(A.unair, "Khanza Zulfani", "PEREMPUAN"),
]);
const gcItb = participant("univ-gc", A.itb, [
  athlete(A.itb, "Farzan Ahza Aqila", "LAKI_LAKI"),
  athlete(A.itb, "Tarisa Kirana", "PEREMPUAN"),
]);
const gcIts = participant("univ-gc", A.its, [
  athlete(A.its, "Xavier Razqa", "LAKI_LAKI"),
  athlete(A.its, "Zhaafira Khoerunnisa", "PEREMPUAN"),
]);

// Ganda Putri Universitas
const gpiUgm = participant("univ-gpi", A.ugm, [
  athlete(A.ugm, "Tiara Shaqeela", "PEREMPUAN"),
  athlete(A.ugm, "Zaskya Febrina", "PEREMPUAN"),
]);
const gpiUnpad = participant("univ-gpi", A.unpad, [
  athlete(A.unpad, "Malika Nur Aqilah", "PEREMPUAN"),
  athlete(A.unpad, "Yemima Febryanti", "PEREMPUAN"),
]);

// SMA
const tpSma3 = participant("sma-tp", A.sma3, [athlete(A.sma3, "Rangga Dwi Cahya", "LAKI_LAKI", true)], 1);
const tpSma8 = participant("sma-tp", A.sma8, [athlete(A.sma8, "Bintang Adyatma", "LAKI_LAKI")]);
const tpiSma1sol = participant("sma-tpi", A.sma1sol, [athlete(A.sma1sol, "Anindya Puspita", "PEREMPUAN")]);
const tpiSma3 = participant("sma-tpi", A.sma3, [athlete(A.sma3, "Cantika Ayu Lestari", "PEREMPUAN")]);
const gpSmadeb = participant("sma-gp", A.smadeb, [
  athlete(A.smadeb, "Ivan Christian", "LAKI_LAKI"),
  athlete(A.smadeb, "Damar Prasetyo", "LAKI_LAKI"),
]);
const gpSma8 = participant("sma-gp", A.sma8, [
  athlete(A.sma8, "Rizky Akbar", "LAKI_LAKI"),
  athlete(A.sma8, "Alfi Yaumi", "LAKI_LAKI"),
]);

// Beregu Sudirman — nama disetor berurutan mengikuti BEREGU_SLOTS:
// Tunggal 1, Ganda 1 (2 orang), Tunggal 2, Ganda 2 (2 orang), Tunggal 3.
const beregUgm = team("univ-beregu", A.ugm, [
  "Bimo Arya Wicaksono",
  "Danang Prasetya", "Ilham Nurhakim",
  "Larasati Prameswari",
  "Ayudia Kusuma", "Nabila Hapsari",
  "Rakha Adiwangsa",
]);
const beregUi = team("univ-beregu", A.ui, [
  "Gilang Ramadhan",
  "Tegar Saputra", "Wisnu Baskara",
  "Mutiara Anggraini",
  "Callista Wibowo", "Shafira Handayani",
  "Panji Wicaksana",
]);
const beregItb = team("univ-beregu", A.itb, [
  "Aditya Nurwahid",
  "Bramantyo Aji", "Cakra Nugraha",
  "Diandra Safitri",
  "Elvira Puspaningrum", "Freya Amaranggana",
  "Gading Mahesa",
]);
const beregUnair = team("univ-beregu", A.unair, [
  "Hafiz Ardiansyah",
  "Ibnu Fadhilah", "Janu Respati",
  "Kayla Nariswari",
  "Luthfia Ramadhani", "Maheswari Ayu",
  "Nanda Prayoga",
]);

// --------------------------------------------------------------- jadwalnya ---

const DAY_1 = "2026-08-15";
const DAY_2 = "2026-08-16";

export const dummyMatches: Match[] = [
  // ===== Hari 1 · 08:00 =====
  buildMatch({
    disciplineId: "univ-gc", roundName: "Perempat Final", court: 1,
    time: `${DAY_1}T08:00`, status: "FINISHED",
    a: gcUgm, b: gcUnair, scores: [[28, 26], [21, 13]], winner: "a",
  }),
  buildMatch({
    disciplineId: "univ-gc", roundName: "Perempat Final", court: 2,
    time: `${DAY_1}T08:00`, status: "FINISHED",
    a: gcItb, b: gcIts, scores: [[18, 21], [21, 23]], winner: "b",
  }),
  buildMatch({
    disciplineId: "univ-tp", roundName: "Perempat Final", court: 3,
    time: `${DAY_1}T08:00`, status: "FINISHED",
    a: tpUgm, b: tpUi, scores: [[21, 14], [15, 21], [21, 17]], winner: "a",
  }),
  buildMatch({
    disciplineId: "univ-tpi", roundName: "Perempat Final", court: 4,
    time: `${DAY_1}T08:00`, status: "RETIRED",
    a: tpiUgm, b: tpiUnair, scores: [[21, 19], [11, 4]], winner: "a",
  }),

  // ===== Hari 1 · 08:40 =====
  buildMatch({
    disciplineId: "univ-gp", roundName: "Perempat Final", court: 1,
    time: `${DAY_1}T08:40`, status: "FINISHED",
    a: gpUgm, b: gpIpb, scores: [[16, 21], [11, 21]], winner: "b",
  }),
  buildMatch({
    disciplineId: "univ-gp", roundName: "Perempat Final", court: 2,
    time: `${DAY_1}T08:40`, status: "FINISHED",
    a: gpUndip, b: gpUi, scores: [[21, 19], [21, 16]], winner: "a",
  }),
  buildMatch({
    disciplineId: "univ-gpi", roundName: "Perempat Final", court: 3,
    time: `${DAY_1}T08:40`, status: "FINISHED",
    a: gpiUgm, b: gpiUnpad, scores: [[21, 15], [21, 16]], winner: "a",
  }),

  // ===== Hari 1 · 09:20 — sedang berlangsung =====
  buildMatch({
    disciplineId: "univ-tp", roundName: "Perempat Final", court: 1,
    time: `${DAY_1}T09:20`, status: "ONGOING",
    a: tpItb, b: tpIts, scores: [[21, 18], [14, 16]],
  }),
  buildMatch({
    disciplineId: "univ-tpi", roundName: "Perempat Final", court: 2,
    time: `${DAY_1}T09:20`, status: "ONGOING",
    a: tpiUndip, b: tpiUnpad, scores: [[19, 21], [8, 5]],
  }),
  buildMatch({
    disciplineId: "sma-tp", roundName: "Semifinal", court: 3,
    time: `${DAY_1}T09:20`, status: "SCHEDULED",
    a: tpSma3, b: tpSma8,
  }),

  // ===== Hari 1 · 10:00 =====
  buildMatch({
    disciplineId: "sma-tpi", roundName: "Semifinal", court: 1,
    time: `${DAY_1}T10:00`, status: "SCHEDULED",
    a: tpiSma1sol, b: tpiSma3,
  }),
  buildMatch({
    disciplineId: "sma-gp", roundName: "Semifinal", court: 2,
    time: `${DAY_1}T10:00`, status: "SCHEDULED",
    a: gpSmadeb, b: gpSma8,
  }),
  buildMatch({
    disciplineId: "univ-beregu", roundName: "Penyisihan Grup", stage: "GROUP",
    groupName: "A", court: 3,
    time: `${DAY_1}T10:00`, status: "ONGOING",
    a: beregUgm, b: beregUi,
    // Tiga partai kelar, partai keempat sedang jalan — supaya halaman detail
    // beregu bisa dicek pada semua status sekaligus.
    parties: [
      { status: "FINISHED", scores: [[21, 17], [21, 14]], winner: "a" },
      { status: "FINISHED", scores: [[19, 21], [21, 23]], winner: "b" },
      { status: "FINISHED", scores: [[21, 12], [18, 21], [21, 19]], winner: "a" },
      { status: "ONGOING", scores: [[21, 18], [15, 13]] },
      { status: "SCHEDULED" },
    ],
  }),

  // ===== Hari 2 · 09:00 =====
  buildMatch({
    disciplineId: "univ-gc", roundName: "Semifinal", court: 1,
    time: `${DAY_2}T09:00`, status: "SCHEDULED",
    a: gcUgm, b: gcIts,
  }),
  buildMatch({
    disciplineId: "univ-gp", roundName: "Semifinal", court: 2,
    time: `${DAY_2}T09:00`, status: "SCHEDULED",
    a: gpIpb, b: gpUndip,
  }),
  buildMatch({
    disciplineId: "univ-beregu", roundName: "Penyisihan Grup", stage: "GROUP",
    groupName: "B", court: 3,
    time: `${DAY_2}T09:00`, status: "SCHEDULED",
    a: beregItb, b: beregUnair,
  }),

  // ===== Hari 2 · 13:00 — final =====
  buildMatch({
    disciplineId: "univ-tp", roundName: "Final", court: 1,
    time: `${DAY_2}T13:00`, status: "SCHEDULED",
    a: tpUgm, b: tpItb,
  }),
  buildMatch({
    disciplineId: "univ-tpi", roundName: "Final", court: 1,
    time: `${DAY_2}T13:00`, status: "SCHEDULED",
    a: tpiUgm, b: tpiUndip,
  }),
];

/**
 * Cari satu match berdasarkan id, termasuk partai-partai di dalam match beregu
 * — halaman detail bisa dibuka langsung lewat id partainya.
 */
export function findDummyMatch(matches: Match[], id: string): Match | null {
  for (const match of matches) {
    if (match.id === id) return match;
    const child = (match.childMatches ?? []).find((c) => c.id === id);
    if (child) return child;
  }
  return null;
}

// ============================================================================
//  SAKLAR DUMMY — komentari baris `matches:` di bawah untuk memakai data asli.
// ============================================================================

export const DUMMY_DATA: { matches?: Match[] } = {
  // matches: dummyMatches, // ← KOMENTARI BARIS INI untuk kembali ke data asli API
};
