import Image from "next/image";

interface EmptyStateProps {
  /** Main title, e.g. "Bagan Bracket Belum Tersedia" */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional status note displayed at the bottom footer bar */
  footerNote?: string;
  /** Optional custom icon element */
  icon?: React.ReactNode;
  isLight?: boolean;
  className?: string;
}

/**
 * Figma-styled Empty State component (node 277-5934).
 * Features a 72x72px glowing icon box with Shuttlecock SVG asset, 28px bold italic heading,
 * 14px regular description, radial background glow, and bottom status bar.
 */
export function EmptyState({
  title,
  description = "Saat ini belum ada data yang dapat ditampilkan untuk kategori ini.",
  footerNote = "Halaman ini akan diperbarui otomatis saat data tersedia",
  icon,
  isLight = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border text-center transition-all ${
        isLight
          ? "border-black/[0.08] bg-white shadow-xs"
          : "border-white/[0.07] bg-white/[0.02]"
      } ${className}`}
    >
      {/* Top Center Radial Purple Glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-48 ${
          isLight
            ? "bg-[radial-gradient(ellipse_at_top,rgba(131,82,217,0.08),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.14),transparent_70%)]"
        }`}
      />

      {/* Main Container */}
      <div className="relative flex flex-col items-center justify-center px-6 py-14 sm:py-20">
        {/* Icon Box (72x72px) with glow */}
        <div className="relative mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.08] shadow-[0_0_32px_rgba(139,92,246,0.15)]">
          {icon || (
            <Image
              src="/images/match/Shuttlecock-Icon-emptystate.svg"
              alt=""
              width={36}
              height={40}
              className="h-10 w-[36px] object-contain"
            />
          )}
        </div>

        {/* Heading Title (28px font size) */}
        <h3
          className={`font-['Montserrat'] font-black italic tracking-[-0.84px] text-[28px] leading-[28px] ${
            isLight ? "text-[#0B0B0F]" : "text-white"
          }`}
        >
          {title}
        </h3>

        {/* Description Subtitle (14px font size, regular weight) */}
        {description && (
          <p
            className={`mt-2.5 max-w-[395px] text-[14px] font-normal leading-[22.75px] ${
              isLight ? "text-[#6B6B73]" : "text-white/40"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {/* Bottom Status Bar */}
      {footerNote && (
        <div
          className={`flex items-center justify-center gap-2 border-t px-4 py-3 text-[10px] sm:text-xs font-medium ${
            isLight
              ? "border-black/[0.05] bg-neutral-50/60 text-black/50"
              : "border-white/[0.05] bg-white/[0.01] text-white/40"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#02F5D4] opacity-70 animate-pulse" />
          <span>{footerNote}</span>
        </div>
      )}
    </div>
  );
}
