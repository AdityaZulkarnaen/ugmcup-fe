"use client";

import { SunIcon, MoonIcon } from "@/components/ui/icons";

interface FloatingThemeToggleProps {
  isLight: boolean;
  onToggle: () => void;
}

/**
 * Floating circular Sun/Moon toggle — fixed at bottom-right of the viewport.
 * Uses `fixed` positioning so it hovers above all page content without
 * pushing the layout or covering match cards on scroll.
 */
export function FloatingThemeToggle({ isLight, onToggle }: FloatingThemeToggleProps) {
  return (
    <button
      type="button"
      aria-label={isLight ? "Beralih ke mode gelap" : "Beralih ke mode terang"}
      onClick={onToggle}
      className={`
        fixed bottom-6 right-6 z-50
        flex h-12 w-12 items-center justify-center
        rounded-full border
        shadow-lg transition-all duration-300
        hover:scale-110 active:scale-95
        ${
          isLight
            ? "border-[rgba(0,0,0,0.1)] bg-white text-[#6C47D1] shadow-[0_4px_16px_rgba(139,92,246,0.18)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.28)]"
            : "border-white/[0.12] bg-[#1A162B] text-[#5CFCE7] shadow-[0_4px_16px_rgba(2,245,212,0.15)] hover:shadow-[0_6px_20px_rgba(2,245,212,0.25)]"
        }
      `}
    >
      {isLight ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
