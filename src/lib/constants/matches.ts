/**
 * Tipe & konstanta kecil untuk halaman Pertandingan.
 *
 * File ini sengaja dijaga tetap ringan: ia ikut terbawa ke bundle klien lewat
 * `lib/schema.ts` (dipakai root layout) dan lewat komponen bracket, jadi apa pun
 * yang ditaruh di sini akan diunduh dan di-parse di setiap halaman. Data contoh
 * untuk uji tampilan tidak lagi tinggal di sini — pakai `lib/api/dummy.ts` yang
 * dimuat terpisah dan hanya saat saklarnya dinyalakan.
 */

/** Jenjang peserta sebuah bagan. */
export type ParticipantTier = "sma" | "universitas";

/** Nama tampil satu sisi; pasangan ganda digabung dengan tanda hubung. */
export function sideName(players: string[]): string {
  return players.join(" - ");
}

/**
 * Alasan sebuah laga berakhir sebelum dimainkan sampai tuntas. Lawan tetap maju;
 * bagan menandai sisi yang tidak bisa menyelesaikan pertandingan.
 */
export type RetirementReason = "cedera" | "wo";

export const retirementLabels: Record<RetirementReason, string> = {
  cedera: "Mundur karena cedera",
  wo: "Walkover — tidak hadir",
};

/** Satu slot peserta di dalam sebuah match pada bagan. */
export interface BracketSide {
  /** Id peserta; dikosongkan selama slot belum ditentukan (tampil "TBD"). */
  participantId?: string;
  name?: string;
  inst?: string;
  avatar?: string;
  isBye?: boolean;
  /** Jumlah set menang; `null` kalau laganya belum dimainkan. */
  score: number | null;
  /** True untuk sisi yang maju. */
  winner?: boolean;
  /** Diisi pada sisi yang kalah kalau laganya berakhir lebih awal. */
  retired?: RetirementReason;
}

export interface BracketMatch {
  id: string;
  home: BracketSide;
  away: BracketSide;
  /**
   * Walkover: satu sisi kosong, jadi sisi lainnya maju tanpa bertanding. Kartunya
   * tetap dirender — menyembunyikannya justru membuat ronde berikutnya terlihat
   * muncul entah dari mana.
   */
  isByeMatch?: boolean;
  /**
   * Pengganjal untuk posisi pohon yang tidak pernah diisi match. Tidak ada apa
   * pun di sini, jadi slotnya hanya menahan tinggi dan tidak menggambar konektor.
   */
  isEmptySlot?: boolean;
}

export interface BracketRound {
  id: string;
  label: string;
  matches: BracketMatch[];
  /** Diisi pada kolom terakhir: merender kotak juara, bukan kartu match. */
  champion?: { label: string; name: string; participantId?: string };
}

/** Bagan gugur untuk satu cabang pada satu jenjang peserta. */
export interface CategoryBracket {
  /** Kunci gabungan, `${disciplineId}-${tier}`. */
  id: string;
  label: string;
  disciplineId: string;
  tier: ParticipantTier;
  /** Peserta dalam urutan slot ronde pertama; panjangnya kelipatan dua. */
  seeds: string[];
  rounds: BracketRound[];
}

/**
 * Kunci setiap slot kolom yang ditempati seorang peserta: id match yang ia
 * mainkan, plus id kolom juara kalau ia memenangi final. Memberikan ini ke bagan
 * akan menyalakan jalurnya dari ronde pertama sampai posisinya sekarang.
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
 * Venue tunggal untuk seluruh turnamen, ditampilkan di halaman detail match dan
 * di section venue halaman landing. `mapsUrl` sengaja memakai pencarian Maps
 * biasa supaya tetap jalan kalau listing-nya berubah; ganti dengan tautan tempat
 * yang persis begitu panitia punya.
 */
export const tournamentVenue = {
  name: "GOR Nusantara",
  org: "UGM",
  mapsUrl: "https://maps.app.goo.gl/Tw9cF2gCzB4LFM2t9",
};

export interface MatchTab {
  id: string;
  label: string;
  caption: string;
}

export const matchTabs: MatchTab[] = [
  { id: "jadwal", label: "Match", caption: "" },
  { id: "draw", label: "Draw", caption: "" },
  { id: "player", label: "Player", caption: "" },
  { id: "klasemen", label: "Klasemen Beregu", caption: "" },
];
