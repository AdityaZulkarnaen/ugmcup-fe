"use client";

import { SunIcon, MoonIcon } from "@/components/ui/icons";

interface ThemeToggleProps {
  isLight: boolean;
  onToggle: () => void;
}

/**
 * Sun/Moon toggle pill — sits in the page header to switch between
 * the Figma Light Mode and the default Dark Mode for the match page.
 */
export function ThemeToggle({ isLight, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      aria-label={isLight ? "Beralih ke mode gelap" : "Beralih ke mode terang"}
      onClick={onToggle}
      className={`
        flex items-center gap-2 rounded-full border px-4 py-2
        text-xs font-semibold transition-all duration-300
        ${
          isLight
            ? "border-[rgba(0,0,0,0.1)] bg-white text-[#1a162b] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] hover:bg-[#f5f5f5]"
            : "border-white/[0.08] bg-white/[0.04] text-[#8A8A93] hover:border-white/20 hover:text-white"
        }
      `}
    >
      {isLight ? (
        <>
          <MoonIcon className="h-3.5 w-3.5" />
          Mode Gelap
        </>
      ) : (
        <>
          <SunIcon className="h-3.5 w-3.5" />
          Mode Terang
        </>
      )}
    </button>
  );
}
