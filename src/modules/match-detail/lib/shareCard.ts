/**
 * Renderer kartu share (twibbon) untuk detail pertandingan.
 *
 * Semua frame digambar langsung dengan Canvas 2D — tidak ada dependensi
 * screenshot/rasterizer tambahan, sehingga hasilnya identik di semua browser
 * dan bebas dari masalah `foreignObject`. Ukuran kanvas mengikuti rasio 9:16
 * (1080x1920) supaya pas dipakai sebagai Instagram/WhatsApp Story.
 *
 * Bagian tengah frame sengaja dibiarkan kosong: di situlah foto pilihan user
 * ditempatkan sebagai background utama.
 */

import type { Match } from "@/lib/types";
import { getMatchSideDetails } from "@/modules/match-detail/components/MatchScoreboard";

// ============================================================ dimensi & warna

export const CARD_W = 1080;
export const CARD_H = 1920;

const MINT = "#02F5D4";
const VIOLET = "#8352D9";

/** Aset opsional — kalau filenya belum ada, frame tetap tergambar tanpa maskot. */
const LOGO_SRC = "/images/global/logo-black.svg";
const MASCOT_SRC = "/images/share/mascot.png";

// ================================================================ tipe data

export interface ShareSide {
  /** Dua baris nama: ganda = dua atlet, tunggal = nama + asal institusi. */
  lines: [string, string];
  logoUrl?: string;
  /** Huruf pengganti kalau logo institusi gagal dimuat. */
  initial: string;
  /** Skor per set milik sisi ini. */
  scores: number[];
  /** Angka besar paling kanan (set/partai yang dimenangkan). */
  games: number;
  won: boolean;
}

export interface ShareCardData {
  roundLabel: string;
  disciplineCode: string;
  sideA: ShareSide;
  sideB: ShareSide;
}

export interface PhotoTransform {
  /** Kelipatan dari skala "cover"; 1 = pas menutupi kanvas. */
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_TRANSFORM: PhotoTransform = { scale: 1, offsetX: 0, offsetY: 0 };

export interface ShareAssets {
  logo: HTMLImageElement | null;
  mascot: HTMLImageElement | null;
  logoA: HTMLImageElement | null;
  logoB: HTMLImageElement | null;
}

// ========================================================== ekstraksi data

const CODE_BY_TYPE: Record<string, string> = {
  TUNGGAL_PUTRA: "MS",
  TUNGGAL_PUTRI: "WS",
  GANDA_PUTRA: "MD",
  GANDA_PUTRI: "WD",
  GANDA_CAMPURAN: "XD",
  TRIPLE_MIX: "XD",
  BEREGU: "TEAM",
};

/**
 * Slot beregu (`TUNGGAL_1`, `GANDA_2`, …) tidak menyebut gender, jadi dibaca
 * dari atlet yang ditugaskan di slot itu: semua putra = M, semua putri = W,
 * campuran = X. `null` kalau susunan pemainnya belum ada.
 */
function slotGender(match: Match, parentMatch?: Match): "M" | "W" | "X" | null {
  const slot = match.slotType;
  if (!slot) return null;

  // Pola pencocokan yang sama dengan getMatchSideDetails().
  const prefix = slot.replace(/_[12]$/, "");
  const source = parentMatch ?? match;
  const genders = new Set(
    [...(source.teamA?.members ?? []), ...(source.teamB?.members ?? [])]
      .filter((m) => m.assignedSlot === prefix || m.assignedSlot === slot)
      .map((m) => m.athlete?.gender)
      .filter(Boolean)
  );

  if (genders.size === 0) return null;
  if (genders.size > 1) return "X";
  return genders.has("LAKI_LAKI") ? "M" : "W";
}

/** Kode partai untuk sub-match beregu, yang slotnya bernomor (GANDA_1, dst). */
function codeFromSlot(slot: string, gender: "M" | "W" | "X" | null): string | null {
  const index = slot.match(/_(\d)$/)?.[1] ?? "";
  const base = slot.replace(/_(\d)$/, "");

  const direct = CODE_BY_TYPE[base];
  if (direct) return `${direct}${index}`;

  if (base === "TUNGGAL") {
    // Tanpa data gender, pakai kode netral daripada mengklaim yang salah.
    if (!gender || gender === "X") return `T${index || "G"}`;
    return `${gender === "M" ? "MS" : "WS"}${index}`;
  }
  if (base === "GANDA") {
    if (gender === "X") return `XD${index}`;
    if (!gender) return `G${index || "D"}`;
    return `${gender === "M" ? "MD" : "WD"}${index}`;
  }
  return null;
}

function disciplineCode(match: Match, parentMatch?: Match): string {
  if (match.slotType) {
    const fromSlot = codeFromSlot(match.slotType, slotGender(match, parentMatch));
    if (fromSlot) return fromSlot;
  }
  const type = match.discipline?.type ?? parentMatch?.discipline?.type;
  if (type && CODE_BY_TYPE[type]) return CODE_BY_TYPE[type];
  if (match.matchType === "TEAM") return "TEAM";
  return "UC";
}

/** Nama babak versi Inggris, mengikuti gaya template ("ROUND OF 32"). */
function roundLabel(match: Match): string {
  if (match.stage === "GROUP") {
    return match.groupName ? `GROUP ${match.groupName.toUpperCase()}` : "GROUP STAGE";
  }

  const raw = (match.roundName ?? "").trim();
  const lower = raw.toLowerCase();

  const besar = lower.match(/(\d+)\s*besar/) ?? lower.match(/round of\s*(\d+)/);
  if (besar) return `ROUND OF ${besar[1]}`;
  if (lower.includes("perempat") || lower.includes("quarter")) return "QUARTER FINAL";
  if (lower.includes("semi")) return "SEMI FINAL";
  if (lower === "final") return "FINAL";

  return raw ? raw.toUpperCase() : "UGM CUP 2026";
}

function initialOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "?";
}

/** Hitung berapa partai yang dimenangkan sebuah tim pada match beregu. */
function tieScore(match: Match, side: "A" | "B"): number {
  const teamId = side === "A" ? match.teamAId : match.teamBId;
  return (match.childMatches ?? [])
    .filter((c) => c.status === "FINISHED" || c.status === "RETIRED")
    .filter((c) => {
      if (c.winnerTeamId) return c.winnerTeamId === teamId;
      if (c.winnerParticipantId) {
        return c.winnerParticipantId === (side === "A" ? c.participantAId : c.participantBId);
      }
      const sets = c.sets ?? [];
      const wA = sets.filter((s) => s.scoreA > s.scoreB).length;
      const wB = sets.filter((s) => s.scoreB > s.scoreA).length;
      return side === "A" ? wA > wB : wB > wA;
    }).length;
}

/**
 * Rangkum satu pertandingan menjadi data yang siap digambar.
 *
 * `parentMatch` diisi kalau `match` adalah salah satu partai di dalam match
 * beregu — dipakai untuk melengkapi nama atlet/institusi yang tidak ikut
 * ter-embed di sub-match.
 */
export function buildShareCardData(match: Match, parentMatch?: Match): ShareCardData {
  const { nameA, subA, logoA, nameB, subB, logoB } = getMatchSideDetails(match, parentMatch);

  const isTie = match.matchType === "TEAM" && !parentMatch;
  const sets = [...(match.sets ?? [])].sort((a, b) => a.setNumber - b.setNumber);

  const wonA =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantAId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamAId);
  const wonB =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantBId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamBId);

  let gamesA = sets.filter((s) => s.scoreA > s.scoreB).length;
  let gamesB = sets.filter((s) => s.scoreB > s.scoreA).length;

  if (isTie) {
    gamesA = tieScore(match, "A");
    gamesB = tieScore(match, "B");
  } else if ((match.status === "FINISHED" || match.status === "RETIRED") && gamesA === 0 && gamesB === 0) {
    // Hasil final yang di-input tanpa rincian set.
    if (wonA) gamesA = 2;
    if (wonB) gamesB = 2;
  }

  const toLines = (name: string, sub?: string): [string, string] => {
    const parts = name.split(" - ").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return [parts[0], parts.slice(1).join(" / ")];
    return [parts[0] ?? name, sub ?? ""];
  };

  return {
    roundLabel: roundLabel(parentMatch ?? match),
    disciplineCode: disciplineCode(match, parentMatch),
    sideA: {
      lines: toLines(nameA, subA),
      logoUrl: logoA,
      initial: initialOf(nameA),
      scores: isTie ? [] : sets.map((s) => s.scoreA),
      games: gamesA,
      won: wonA || (!wonB && gamesA > gamesB),
    },
    sideB: {
      lines: toLines(nameB, subB),
      logoUrl: logoB,
      initial: initialOf(nameB),
      scores: isTie ? [] : sets.map((s) => s.scoreB),
      games: gamesB,
      won: wonB || (!wonA && gamesB > gamesA),
    },
  };
}

// =========================================================== util gambar

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

/**
 * Muat gambar dan **jangan pernah** melempar error — sumber yang gagal cukup
 * menghasilkan `null` supaya frame tetap bisa digambar.
 *
 * Logo institusi berasal dari domain lain, jadi selalu diminta dengan
 * `crossOrigin="anonymous"`. Kalau server-nya tidak mengizinkan, gambarnya
 * dilewati — lebih baik kehilangan logo daripada kanvasnya ter-taint dan
 * `toBlob()` gagal saat user menekan tombol bagikan.
 */
export function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement | null> {
  const key = `${crossOrigin ? "cors:" : ""}${src}`;
  const cached = imageCache.get(key);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  imageCache.set(key, promise);
  return promise;
}

export async function loadShareAssets(data: ShareCardData): Promise<ShareAssets> {
  const isRemote = (url?: string) => !!url && /^https?:\/\//i.test(url);

  const [logo, mascot, logoA, logoB] = await Promise.all([
    loadImage(LOGO_SRC),
    loadImage(MASCOT_SRC),
    data.sideA.logoUrl ? loadImage(data.sideA.logoUrl, isRemote(data.sideA.logoUrl)) : Promise.resolve(null),
    data.sideB.logoUrl ? loadImage(data.sideB.logoUrl, isRemote(data.sideB.logoUrl)) : Promise.resolve(null),
  ]);

  return { logo, mascot, logoA, logoB };
}

/** Nama family Montserrat yang dipakai next/font, supaya cocok dengan situs. */
export function cardFontFamily(): string {
  if (typeof window === "undefined") return "Montserrat, sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-montserrat")
    .trim();
  return value ? `${value}, Montserrat, sans-serif` : "Montserrat, sans-serif";
}

/**
 * Canvas tidak menunggu webfont selesai dimuat — tanpa ini, render pertama
 * memakai font fallback dan hasilnya berbeda dari preview kedua.
 */
export async function ensureCardFonts(family: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const specs = [
    "italic 900 78px",
    "italic 800 34px",
    "italic 700 23px",
    "normal 900 42px",
    "normal 800 86px",
    "normal 700 28px",
    "normal 400 44px",
  ];
  await Promise.all(
    specs.map((spec) => document.fonts.load(`${spec} ${family}`).catch(() => null))
  );
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Gambar `img` agar muat seluruhnya di dalam kotak, tanpa mengubah rasio. */
function drawContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  align: "center" | "bottom" = "center"
) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2;
  const dy = align === "bottom" ? y + h - dh : y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (!text) return "";
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}…`;
}

/** Skala minimum agar foto menutupi seluruh kanvas. */
export function coverScale(img: HTMLImageElement): number {
  return Math.max(CARD_W / img.naturalWidth, CARD_H / img.naturalHeight);
}

/** Batas geser foto supaya tidak pernah menyisakan area kosong. */
export function panBounds(img: HTMLImageElement, scale: number) {
  const s = coverScale(img) * scale;
  return {
    x: Math.max(0, (img.naturalWidth * s - CARD_W) / 2),
    y: Math.max(0, (img.naturalHeight * s - CARD_H) / 2),
  };
}

export function clampTransform(img: HTMLImageElement | null, transform: PhotoTransform): PhotoTransform {
  if (!img) return transform;
  const bounds = panBounds(img, transform.scale);
  return {
    scale: transform.scale,
    offsetX: Math.max(-bounds.x, Math.min(bounds.x, transform.offsetX)),
    offsetY: Math.max(-bounds.y, Math.min(bounds.y, transform.offsetY)),
  };
}

// ============================================================ layout frame

const HEADER_H = 150;
const CONTENT_L = 95;

/** Papan skor: kiri/kanan, tinggi baris, dan jarak antar baris. */
const ROW_L = 62;
const ROW_R = 1022;
const ROW_H = 58;
const ROW_TOP_A = 1525;
const ROW_TOP_B = ROW_TOP_A + ROW_H + 9;
const ACCENT_BAR_Y = ROW_TOP_B + ROW_H + 7;
const ACCENT_BAR_H = 10;

/** Pita putih paling bawah tempat akun sosial — bukan hitam seperti body. */
const FOOTER_Y = 1769;
const FOOTER_INK = "#14162B";
const FOOTER_INK_SOFT = "#4A4A55";

function font(family: string, style: "normal" | "italic", weight: number, size: number): string {
  return `${style} ${weight} ${size}px ${family}`;
}

function drawBackdrop(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, transform: PhotoTransform) {
  // Dasar bermerek supaya hasil ekspor tidak pernah transparan/hitam polos.
  const base = ctx.createLinearGradient(0, 0, 0, CARD_H);
  base.addColorStop(0, "#1A162B");
  base.addColorStop(0.55, "#14183B");
  base.addColorStop(1, "#000033");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  if (!photo) return;

  const s = coverScale(photo) * transform.scale;
  const w = photo.naturalWidth * s;
  const h = photo.naturalHeight * s;
  ctx.drawImage(photo, (CARD_W - w) / 2 + transform.offsetX, (CARD_H - h) / 2 + transform.offsetY, w, h);
}

function drawHeader(ctx: CanvasRenderingContext2D, assets: ShareAssets) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, CARD_W, HEADER_H);

  // Bidang mint miring di kanan.
  ctx.beginPath();
  ctx.moveTo(735, 0);
  ctx.lineTo(CARD_W, 0);
  ctx.lineTo(CARD_W, HEADER_H);
  ctx.lineTo(630, HEADER_H);
  ctx.closePath();
  ctx.fillStyle = MINT;
  ctx.fill();

  if (assets.mascot) {
    drawContained(ctx, assets.mascot, 845, -8, 230, HEADER_H + 10, "bottom");
  }

  if (assets.logo) {
    // Sumbernya sudah varian hitam, jadi digambar apa adanya — di-tint malah
    // meratakan gradasi di ikon kok jadi siluet polos. Lebar mengikuti rasio
    // asli SVG (223x68) supaya tidak gepeng.
    ctx.drawImage(assets.logo, 40, 32, 269, 82);
  }
}

function drawScrim(ctx: CanvasRenderingContext2D) {
  // Foto memudar jadi hitam pekat tepat sebelum papan skor mulai. Ramp-nya
  // sengaja landai di awal supaya foto masih tembus di belakang wordmark.
  const fade = ctx.createLinearGradient(0, 1150, 0, 1560);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.45, "rgba(0,0,0,0.45)");
  fade.addColorStop(0.75, "rgba(0,0,0,0.88)");
  fade.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 1150, CARD_W, 410);

  // Blok hitam berhenti di pita putih, bukan di dasar kartu.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 1540, CARD_W, FOOTER_Y - 1540);
}

function drawTitles(ctx: CanvasRenderingContext2D, family: string, data: ShareCardData) {
  // Wordmark "UGMCUP 2026" — "CUP" ungu, sisanya putih.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = font(family, "italic", 900, 74);

  let x = 92;
  const baseline = 1413;
  const segments: Array<[string, string]> = [
    ["UGM", "#FFFFFF"],
    ["CUP", VIOLET],
    [" 2026", "#FFFFFF"],
  ];
  for (const [text, color] of segments) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, baseline);
    x += ctx.measureText(text).width;
  }

  // Nama babak. `letterSpacing` masih baru di Canvas 2D — kalau browsernya
  // belum punya, penugasan ini tidak berefek apa-apa dan teks tetap tergambar.
  // Selalu diset SESUDAH `font`, karena setter font mereset spacing.
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  ctx.font = font(family, "normal", 400, 56);
  spaced.letterSpacing = "2px";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(data.roundLabel, CONTENT_L, 1487);
  spaced.letterSpacing = "0px";

  // Kode partai di kanan, sedikit lebih tinggi dari nama babak.
  ctx.textAlign = "right";
  ctx.font = font(family, "normal", 800, 79);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(data.disciplineCode, ROW_R, 1477);
  ctx.textAlign = "left";
}

function drawSideRow(
  ctx: CanvasRenderingContext2D,
  family: string,
  side: ShareSide,
  opponentScores: number[],
  logo: HTMLImageElement | null,
  top: number,
  cellW: number,
  cellCount: number
) {
  const scoreX = ROW_R - cellCount * cellW;
  const centerY = top + ROW_H / 2;

  // Panel nama — abu di kiri, meleleh jadi hitam sebelum sampai ke sel skor.
  // Baris pemenang sedikit lebih terang daripada baris lawannya.
  const panel = ctx.createLinearGradient(ROW_L, 0, scoreX, 0);
  panel.addColorStop(0, side.won ? "#3A3A3A" : "#1A1A1A");
  panel.addColorStop(0.62, side.won ? "#262626" : "#101010");
  panel.addColorStop(1, side.won ? "#050505" : "#020202");
  ctx.fillStyle = panel;
  ctx.fillRect(ROW_L, top, scoreX - ROW_L, ROW_H);

  // Lencana logo institusi.
  const badgeR = 20;
  const badgeX = ROW_L + 29;
  ctx.save();
  ctx.beginPath();
  ctx.arc(badgeX, centerY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.clip();
  if (logo) {
    drawContained(ctx, logo, badgeX - 17, centerY - 17, 34, 34);
  } else {
    ctx.fillStyle = VIOLET;
    ctx.font = font(family, "normal", 800, 22);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(side.initial, badgeX, centerY + 1);
  }
  ctx.restore();

  // Dua baris nama.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = font(family, "italic", 700, 20);
  const nameX = ROW_L + 83;
  const nameMax = scoreX - nameX - 18;
  ctx.fillStyle = side.won ? "#FFFFFF" : "rgba(255,255,255,0.78)";
  ctx.fillText(truncate(ctx, side.lines[0], nameMax), nameX, top + 24);
  if (side.lines[1]) {
    ctx.fillText(truncate(ctx, side.lines[1], nameMax), nameX, top + 48);
  }

  // Sel skor: satu per set, lalu sel terakhir untuk total game.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < cellCount; i++) {
    const isTotal = i === cellCount - 1;
    const x = scoreX + i * cellW;

    ctx.fillStyle = isTotal
      ? side.won
        ? "#2B2B2B"
        : "#151515"
      : side.won
        ? "#202020"
        : "#0E0E0E";
    // Sisakan 3px sebagai pemisah antar sel.
    ctx.fillRect(x, top, cellW - 3, ROW_H);

    const value = isTotal ? side.games : side.scores[i];
    if (value === undefined) continue;

    if (isTotal) {
      ctx.fillStyle = MINT;
      ctx.font = font(family, "normal", 900, 40);
    } else {
      // Set yang dimenangkan tampil putih penuh, yang kalah diredupkan.
      const wonSet = side.scores[i] > (opponentScores[i] ?? -1);
      ctx.fillStyle = wonSet ? "#FFFFFF" : "rgba(255,255,255,0.5)";
      ctx.font = font(family, "normal", 900, 37);
    }
    ctx.fillText(String(value), x + (cellW - 3) / 2, centerY + 2);
  }
}

function drawScoreboard(ctx: CanvasRenderingContext2D, family: string, data: ShareCardData, assets: ShareAssets) {
  const setCount = Math.max(data.sideA.scores.length, data.sideB.scores.length);
  const cellCount = setCount + 1;
  const cellW = Math.min(100, Math.floor(455 / cellCount));

  drawSideRow(ctx, family, data.sideA, data.sideB.scores, assets.logoA, ROW_TOP_A, cellW, cellCount);
  drawSideRow(ctx, family, data.sideB, data.sideA.scores, assets.logoB, ROW_TOP_B, cellW, cellCount);

  // Garis aksen mint di bawah papan skor.
  const bar = ctx.createLinearGradient(ROW_L, 0, ROW_R, 0);
  bar.addColorStop(0, MINT);
  bar.addColorStop(1, "#34E5A6");
  ctx.fillStyle = bar;
  ctx.fillRect(ROW_L, ACCENT_BAR_Y, ROW_R - ROW_L, ACCENT_BAR_H);
}

/** Path TikTok & Instagram diambil dari `components/ui/icons.tsx`. */
const TIKTOK_PATH =
  "M11.4033 2.585C10.7769 1.86957 10.4316 0.950949 10.4317 0H7.59917V11.3667C7.57777 11.9819 7.31823 12.5648 6.87528 12.9924C6.43234 13.4199 5.84063 13.6587 5.225 13.6583C3.92333 13.6583 2.84167 12.595 2.84167 11.275C2.84167 9.69833 4.36333 8.51583 5.93083 9.00167V6.105C2.76833 5.68333 0 8.14 0 11.275C0 14.3275 2.53 16.5 5.21583 16.5C8.09417 16.5 10.4317 14.1625 10.4317 11.275V5.50917C11.5802 6.33403 12.9593 6.77659 14.3733 6.77417V3.94167C14.3733 3.94167 12.65 4.02417 11.4033 2.585Z";

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, draw: () => void) {
  const fill = ctx.createLinearGradient(x, y, x + size, y + size);
  fill.addColorStop(0, "#9B6BEE");
  fill.addColorStop(1, "#6C47D1");
  roundRectPath(ctx, x, y, size, size, size * 0.28);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.save();
  draw();
  ctx.restore();
}

function drawFooter(ctx: CanvasRenderingContext2D, family: string) {
  // Pita putih penuh selebar kartu — di sinilah tulisan berubah jadi gelap.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, FOOTER_Y, CARD_W, CARD_H - FOOTER_Y);

  const badgeSize = 42;
  const rowCenter = 1840;
  const badgeY = rowCenter - badgeSize / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = font(family, "italic", 700, 25);

  // TikTok
  drawBadge(ctx, 36, badgeY, badgeSize, () => {
    const scale = 22 / 17;
    ctx.translate(36 + badgeSize / 2 - (15 * scale) / 2, badgeY + badgeSize / 2 - (17 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill(new Path2D(TIKTOK_PATH));
  });

  ctx.fillStyle = FOOTER_INK;
  ctx.fillText("ugmcup2026", 92, rowCenter);
  const igBadgeX = 92 + ctx.measureText("ugmcup2026").width + 22;

  // Instagram
  drawBadge(ctx, igBadgeX, badgeY, badgeSize, () => {
    const scale = 24 / 24;
    ctx.translate(igBadgeX + badgeSize / 2 - 12 * scale, badgeY + badgeSize / 2 - 12 * scale);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    roundRectPath(ctx, 3, 3, 18, 18, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 12, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(17.5, 6.5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  });

  ctx.fillStyle = FOOTER_INK;
  ctx.fillText("ugm_cup", igBadgeX + badgeSize + 12, rowCenter);

  // Ajakan di kanan.
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = font(family, "normal", 400, 28);
  ctx.fillStyle = FOOTER_INK_SOFT;
  ctx.fillText("Check now at →", 1043, 1836);
  ctx.font = font(family, "italic", 800, 30);
  ctx.fillStyle = FOOTER_INK;
  ctx.fillText("www.ugmcup2026.com", 1043, 1874);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/**
 * Gambar seluruh kartu ke `canvas`. Canvas selalu di-resize ke 1080x1920 agar
 * hasil unduhan punya resolusi penuh, berapa pun ukuran tampilannya di layar.
 */
export function renderShareCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  assets: ShareAssets,
  photo: HTMLImageElement | null,
  transform: PhotoTransform,
  family: string
): void {
  if (canvas.width !== CARD_W) canvas.width = CARD_W;
  if (canvas.height !== CARD_H) canvas.height = CARD_H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CARD_W, CARD_H);
  drawBackdrop(ctx, photo, transform);
  drawHeader(ctx, assets);
  drawScrim(ctx);
  drawTitles(ctx, family, data);
  drawScoreboard(ctx, family, data, assets);
  drawFooter(ctx, family);
}
