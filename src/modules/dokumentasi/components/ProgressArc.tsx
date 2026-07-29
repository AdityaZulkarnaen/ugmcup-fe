"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

/**
 * Busur bergerigi di bawah slider galeri. Ini bukan ornamen: strip-strip di
 * sepanjang busur adalah indikator posisi slider. Bagian yang sudah dilewati
 * berubah ungu pekat dan memanjang mengikuti geseran user, sisanya tetap
 * lavender, dan sebuah titik menandai posisi sekarang.
 *
 * Busurnya juga bisa digeser balik: menarik pita di sepanjang kurva menyetir
 * posisi slider lewat `onScrub`.
 */

interface Point {
  x: number;
  y: number;
}

const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 300;

// Kurva bezier kuadratik — ujung kiri, titik kontrol, ujung kanan. Ujungnya
// menempel persis di tepi viewBox supaya busur terlihat keluar layar.
const START: Point = { x: 0, y: 250 };
const CONTROL: Point = { x: VIEW_WIDTH / 2, y: -90 };
const END: Point = { x: VIEW_WIDTH, y: 250 };

const TICK_COUNT = 88;
/** Panjang total strip; dibagi rata di atas & di bawah garis busur. */
const TICK_LENGTH = 14;
const TICK_LENGTH_PASSED = 20;

/** Tebal pita tak terlihat yang menangkap geseran di sepanjang busur. */
const GRAB_BAND = 56;

const COLOR_PASSED = "#8352D9";
const COLOR_AHEAD = "#D9D3FF";

function pointAt(t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * START.x + 2 * u * t * CONTROL.x + t * t * END.x,
    y: u * u * START.y + 2 * u * t * CONTROL.y + t * t * END.y,
  };
}

/**
 * Normal satuan tegak lurus busur. Komponen x tangen selalu positif di kurva
 * ini, jadi rotasi (-ty, tx) selalu menunjuk ke bawah tanpa perlu dicek per
 * titik — strip digambar setengah ke arah ini dan setengah ke arah baliknya.
 */
function normalAt(t: number): Point {
  const tx = 2 * (1 - t) * (CONTROL.x - START.x) + 2 * t * (END.x - CONTROL.x);
  const ty = 2 * (1 - t) * (CONTROL.y - START.y) + 2 * t * (END.y - CONTROL.y);
  const length = Math.hypot(tx, ty);
  return { x: -ty / length, y: tx / length };
}

/** Potongan busur dari awal sampai `to`, dirangkai dari sampel titik. */
function segmentPath(to: number): string {
  const steps = Math.max(2, Math.round(140 * to));
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const { x, y } = pointAt((to * i) / steps);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

const fullPath = `M${START.x} ${START.y} Q${CONTROL.x} ${CONTROL.y} ${END.x} ${END.y}`;

// Posisi & arah strip tidak bergantung pada progress, jadi dihitung sekali.
const ticks = Array.from({ length: TICK_COUNT }, (_, index) => {
  const t = index / (TICK_COUNT - 1);
  const base = pointAt(t);
  const normal = normalAt(t);
  return { t, x: base.x, y: base.y, nx: normal.x, ny: normal.y };
});

interface ProgressArcProps {
  /** Posisi slider, 0 (paling kiri) sampai 1 (paling kanan). */
  progress: number;
  /** Dipanggil terus-menerus selagi busur digeser, dengan posisi barunya. */
  onScrub?: (progress: number) => void;
  /** Geseran selesai — dipakai pemanggil untuk mengembalikan snap slider. */
  onScrubEnd?: () => void;
}

export function ProgressArc({ progress, onScrub, onScrubEnd }: ProgressArcProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scrubbing = useRef(false);

  /**
   * Titik kontrol duduk persis di tengah, yang membuat x(t) = VIEW_WIDTH * t —
   * lurus sempurna. Jadi posisi pointer bisa dipetakan langsung ke progress
   * tanpa perlu mencari t di sepanjang kurva.
   */
  function progressAtPointer(clientX: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const box = svg.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - box.left) / box.width));
  }

  function startScrub(event: ReactPointerEvent<SVGPathElement>) {
    if (!onScrub) return;
    scrubbing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(progressAtPointer(event.clientX));
  }

  function moveScrub(event: ReactPointerEvent<SVGPathElement>) {
    if (!scrubbing.current || !onScrub) return;
    onScrub(progressAtPointer(event.clientX));
  }

  function endScrub(event: ReactPointerEvent<SVGPathElement>) {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onScrubEnd?.();
  }

  const head = pointAt(progress);

  return (
    // Busur dijaga minimal 900px lalu digeser ke tengah: di layar sempit
    // ujung-ujungnya terpotong wadahnya, bukan ikut memipih.
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="progressbar"
      aria-label="Posisi galeri foto"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="relative left-1/2 block h-auto w-full max-w-none min-w-[900px] -translate-x-1/2"
    >
      <path d={fullPath} fill="none" stroke={COLOR_AHEAD} strokeWidth={2} />

      {ticks.map((tick, index) => {
        const passed = tick.t <= progress;
        const half = (passed ? TICK_LENGTH_PASSED : TICK_LENGTH) / 2;
        return (
          <line
            key={index}
            x1={tick.x - tick.nx * half}
            y1={tick.y - tick.ny * half}
            x2={tick.x + tick.nx * half}
            y2={tick.y + tick.ny * half}
            stroke={passed ? COLOR_PASSED : COLOR_AHEAD}
            strokeWidth={passed ? 2.6 : 2}
            strokeLinecap="round"
            className="transition-[stroke] duration-200"
          />
        );
      })}

      {progress > 0 && (
        <path
          d={segmentPath(progress)}
          fill="none"
          stroke={COLOR_PASSED}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}

      <circle cx={head.x} cy={head.y} r={6.5} fill={COLOR_PASSED} />

      {/*
        Area tangkap geseran, digambar terakhir supaya berada di atas semua
        strip. `pointer-events="stroke"` membatasi tangkapannya ke pita di
        sekitar kurva saja — cekungan di bawah busur tetap bebas, jadi tombol
        Drive yang duduk di sana tidak ikut tertelan.
      */}
      {onScrub && (
        <path
          d={fullPath}
          fill="none"
          stroke="transparent"
          strokeWidth={GRAB_BAND}
          strokeLinecap="round"
          pointerEvents="stroke"
          onPointerDown={startScrub}
          onPointerMove={moveScrub}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
          className="cursor-grab touch-none active:cursor-grabbing"
        />
      )}
    </svg>
  );
}
