import type { CSSProperties, ReactNode } from "react";
import { SpinnerIcon } from "@/components/ui/icons";

interface SkeletonProps {
  /** Size, radius and spacing — the shape of the thing being waited on. */
  className?: string;
  /** Offsets the sheen so a stack of rows ripples instead of flashing as one. */
  delay?: number;
  isLight?: boolean;
}

/**
 * One placeholder block. Purely decorative — `aria-hidden`, with the spoken
 * announcement left to the `<LoadingNote>` that heads the panel.
 *
 * The sweep animation lives in `globals.css` under `.skeleton`.
 */
export function Skeleton({ className = "", delay = 0, isLight = false }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={{ "--skeleton-delay": `${delay}ms` } as CSSProperties}
      className={`skeleton block ${
        isLight ? "skeleton-light bg-[rgba(0,0,0,0.06)]" : "bg-white/[0.06]"
      } ${className}`}
    />
  );
}

/**
 * The line that says, in words, that something is loading. Skeletons alone are
 * ambiguous — an empty result looks much the same — so every loading panel
 * carries one of these, and it is what screen readers announce.
 */
export function LoadingNote({
  children,
  isLight = false,
  className = "",
}: {
  children: ReactNode;
  isLight?: boolean;
  className?: string;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 text-xs font-semibold ${
        isLight ? "text-[#6C47D1]" : "text-[#5CFCE7]"
      } ${className}`}
    >
      <SpinnerIcon className="animate-spin" />
      {children}
    </p>
  );
}

/**
 * Wrapper for a panel that is loading: marks the region busy for assistive tech
 * and puts the note above the placeholder rows.
 */
export function SkeletonPanel({
  label,
  children,
  isLight = false,
  className = "",
}: {
  /** Spoken and shown, e.g. "Memuat live score…". */
  label: string;
  children: ReactNode;
  isLight?: boolean;
  className?: string;
}) {
  return (
    <div aria-busy="true" className={`flex flex-col gap-3 ${className}`}>
      <LoadingNote isLight={isLight}>{label}</LoadingNote>
      {children}
    </div>
  );
}
