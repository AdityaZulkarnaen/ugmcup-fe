"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CloseIcon,
  DownloadIcon,
  PhotoIcon,
  ShareIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
import type { Match } from "@/lib/types";
import {
  buildCardModel,
  cardFontFamily,
  clampTransform,
  DEFAULT_TRANSFORM,
  ensureCardFonts,
  loadShareAssets,
  panBounds,
  renderCard,
  CARD_H,
  CARD_W,
  type PhotoTransform,
  type ShareAssets,
} from "@/modules/match-detail/lib/shareCard";

const MAX_ZOOM = 3;

/**
 * Modal "bagikan": menyusun template story dari data pertandingan, lalu
 * membiarkan user memilih foto sendiri sebagai background utamanya.
 *
 * Semua render terjadi di satu `<canvas>` beresolusi penuh (1080x1920) yang
 * ditampilkan mengecil lewat CSS — jadi yang dilihat di layar persis sama
 * dengan yang diunduh/dibagikan.
 */
export function ShareMatchModal({
  match,
  parentMatch,
  isLight = false,
  onClose,
}: {
  match: Match;
  parentMatch?: Match;
  isLight?: boolean;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUrlRef = useRef<string | null>(null);

  const [assets, setAssets] = useState<ShareAssets | null>(null);
  const [family, setFamily] = useState("Montserrat, sans-serif");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const model = useMemo(() => buildCardModel(match, parentMatch), [match, parentMatch]);
  const isTie = model.kind === "tie";

  // Kunci scroll halaman selama modal terbuka.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Bebaskan object URL foto terakhir saat modal ditutup.
  useEffect(
    () => () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    []
  );

  // Muat logo, maskot, dan webfont sekali di awal.
  useEffect(() => {
    let active = true;
    async function prepare() {
      const resolvedFamily = cardFontFamily();
      const [loaded] = await Promise.all([loadShareAssets(model), ensureCardFonts(resolvedFamily)]);
      if (!active) return;
      setFamily(resolvedFamily);
      setAssets(loaded);
    }
    prepare();
    return () => {
      active = false;
    };
  }, [model]);

  // Gambar ulang setiap kali data, aset, foto, atau posisi foto berubah.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assets) return;
    renderCard(canvas, model, assets, photo, transform, family);
  }, [assets, model, family, photo, transform]);

  const handlePickPhoto = useCallback((file: File) => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;

    const img = new Image();
    img.onload = () => {
      setPhoto(img);
      setTransform(DEFAULT_TRANSFORM);
      setNotice(null);
    };
    img.onerror = () => setNotice("Foto tidak bisa dibaca. Coba file lain (JPG/PNG).");
    img.src = url;
  }, []);

  // ------------------------------------------------------------ geser foto

  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || !photo || drag.pointerId !== e.pointerId) return;

    // Pointer bergerak dalam piksel layar; kanvas berpikir dalam 1080px.
    const ratio = CARD_W / e.currentTarget.getBoundingClientRect().width;
    const dx = (e.clientX - drag.x) * ratio;
    const dy = (e.clientY - drag.y) * ratio;
    dragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };

    setTransform((prev) =>
      clampTransform(photo, { ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy })
    );
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  };

  const onZoomChange = (value: number) => {
    setTransform((prev) => clampTransform(photo, { ...prev, scale: value }));
  };

  const bounds = photo ? panBounds(photo, transform.scale) : { x: 0, y: 0 };
  const canPan = !!photo && (bounds.x > 1 || bounds.y > 1);

  // --------------------------------------------------------- ekspor gambar

  const slug = model.kind === "tie" ? "beregu" : model.data.disciplineCode.toLowerCase();
  const fileName = `ugmcup2026-${slug}-${match.id}.png`;

  const toBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      } catch {
        resolve(null);
      }
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    const blob = await toBlob();
    setBusy(false);
    if (!blob) {
      setNotice("Gagal membuat gambar. Coba muat ulang halaman.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [fileName, toBlob]);

  const handleShare = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    const blob = await toBlob();
    if (!blob) {
      setBusy(false);
      setNotice("Gagal membuat gambar. Coba muat ulang halaman.");
      return;
    }

    const file = new File([blob], fileName, { type: "image/png" });
    const [labelA, labelB] =
      model.kind === "tie"
        ? [model.data.teamA, model.data.teamB]
        : [model.data.sideA.lines[0], model.data.sideB.lines[0]];
    const shareData: ShareData = {
      files: [file],
      title: `UGM CUP 2026 — ${model.data.roundLabel}`,
      text: `${labelA} vs ${labelB} — UGM CUP 2026`,
    };

    // Web Share API level 2 adalah jalan masuk ke Instagram Story dkk.
    // Di desktop biasanya tidak tersedia, jadi jatuh ke unduhan biasa.
    if (typeof navigator.canShare === "function" && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setBusy(false);
        return;
      } catch (err) {
        setBusy(false);
        // User membatalkan share sheet — bukan error yang perlu dilaporkan.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setNotice("Gagal membuka menu bagikan. Gambar bisa diunduh dulu.");
        return;
      }
    }

    setBusy(false);
    setNotice("Perangkat ini belum mendukung bagikan langsung — gambarnya diunduh saja.");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [model, fileName, toBlob]);

  // ------------------------------------------------------------------ ui

  const panelBg = isLight
    ? "bg-white border-[rgba(0,0,0,0.08)]"
    : "bg-[#15121F] border-white/[0.08]";
  const titleColor = isLight ? "text-[#1a162b]" : "text-white";
  const mutedColor = isLight ? "text-[#6B6B73]" : "text-[#8A8A93]";
  const subtleBtn = isLight
    ? "border-[rgba(0,0,0,0.1)] bg-white text-[#1a162b] hover:border-[rgba(0,0,0,0.25)]"
    : "border-white/[0.12] bg-white/[0.04] text-white hover:border-white/30 hover:bg-white/[0.08]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bagikan pertandingan"
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      data-lenis-prevent
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`my-auto w-full max-w-4xl rounded-2xl border shadow-2xl ${panelBg}`}
      >
        <header
          className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${
            isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.06]"
          }`}
        >
          <div>
            <h2 className={`text-base font-bold ${titleColor}`}>Bagikan Pertandingan</h2>
            <p className={`mt-0.5 text-xs ${mutedColor}`}>
              {isTie
                ? "Rekap seluruh partai beregu. Pilih fotomu sebagai background, lalu bagikan ke Instagram Story."
                : "Pilih fotomu sebagai background, lalu bagikan ke Instagram Story."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className={`shrink-0 rounded-full border p-2 transition-colors ${subtleBtn}`}
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-6">
          {/* Pratinjau — rasio 9:16, persis seperti hasil akhirnya */}
          <div className="mx-auto w-full max-w-[260px]">
            <div
              className={`relative overflow-hidden rounded-xl border ${
                isLight ? "border-[rgba(0,0,0,0.1)]" : "border-white/[0.1]"
              }`}
            >
              <canvas
                ref={canvasRef}
                width={CARD_W}
                height={CARD_H}
                className={`block w-full ${canPan ? "cursor-grab active:cursor-grabbing" : ""}`}
                style={{ aspectRatio: "9 / 16", touchAction: canPan ? "none" : "auto" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
              {!assets && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <SpinnerIcon className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
            {photo && (
              <p className={`mt-2 text-center text-[10px] ${mutedColor}`}>
                Geser foto untuk mengatur posisi.
              </p>
            )}
          </div>

          {/* Kontrol */}
          <div className="flex flex-col gap-4">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${mutedColor}`}>
                Foto background
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePickPhoto(file);
                  // Reset supaya memilih file yang sama dua kali tetap memicu onChange.
                  e.target.value = "";
                }}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#02F5D4] px-4 py-2 text-xs font-bold text-[#12102A] transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <PhotoIcon className="h-4 w-4" />
                  {photo ? "Ganti Foto" : "Pilih Foto"}
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={() => {
                      if (photoUrlRef.current) {
                        URL.revokeObjectURL(photoUrlRef.current);
                        photoUrlRef.current = null;
                      }
                      setPhoto(null);
                      setTransform(DEFAULT_TRANSFORM);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${subtleBtn}`}
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <p className={`mt-2 text-[11px] leading-relaxed ${mutedColor}`}>
                Tanpa foto, background memakai warna brand UGM CUP.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="share-zoom"
                  className={`text-[11px] font-bold uppercase tracking-wider ${mutedColor}`}
                >
                  Perbesar
                </label>
                <span className={`text-[11px] tabular-nums ${mutedColor}`}>
                  {transform.scale.toFixed(1)}×
                </span>
              </div>
              <input
                id="share-zoom"
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.05}
                value={transform.scale}
                disabled={!photo}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="mt-2 w-full accent-[#02F5D4] disabled:opacity-40"
              />
            </div>

            <div className={`rounded-xl border p-3 ${isLight ? "border-[rgba(0,0,0,0.07)] bg-[#F9F9FB]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${mutedColor}`}>
                Data pada template
              </p>
              <dl className={`mt-2 space-y-1 text-[11px] ${mutedColor}`}>
                <div className="flex justify-between gap-3">
                  <dt>Babak</dt>
                  <dd className={`font-semibold ${titleColor}`}>{model.data.roundLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Partai</dt>
                  <dd className={`font-semibold ${titleColor}`}>
                    {model.kind === "tie"
                      ? model.data.partais.map((p) => p.code).join(" · ")
                      : model.data.disciplineCode}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Skor</dt>
                  <dd className={`font-semibold ${titleColor}`}>
                    {model.kind === "tie"
                      ? `${model.data.gamesA} – ${model.data.gamesB}`
                      : `${model.data.sideA.games} – ${model.data.sideB.games}`}
                  </dd>
                </div>
              </dl>
              {model.kind === "tie" && (
                <p className={`mt-2 text-[11px] leading-relaxed ${mutedColor}`}>
                  Hanya partai yang sudah dimainkan yang masuk kartu — tinggi barisnya
                  menyesuaikan jumlahnya.
                </p>
              )}
            </div>

            {notice && (
              <p className="rounded-lg bg-[#8B5CF6]/15 px-3 py-2 text-[11px] leading-relaxed text-[#C4B5FD]">
                {notice}
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={busy || !assets}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8B5CF6] px-5 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {busy ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <ShareIcon className="h-4 w-4" />
                )}
                Bagikan
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={busy || !assets}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 ${subtleBtn}`}
              >
                <DownloadIcon className="h-4 w-4" />
                Unduh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
