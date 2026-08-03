import type { ReactNode } from "react";

interface CategoryPillProps {
  children: ReactNode;
  isLight?: boolean;
  className?: string;
}

/**
 * CategoryPill component based on Figma node-id 407:8774.
 *
 * Typography: Montserrat SemiBold, 10px, leading 14px, tracking 0.25px, uppercase, whitespace-nowrap.
 * Dark Mode: bg-[rgba(2,245,212,0.1)] border-[rgba(2,245,212,0.25)] text-[#02F5D4]
 * Light Mode: bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.25)] text-[#8B5CF6]
 */
export function CategoryPill({
  children,
  isLight = false,
  className = "",
}: CategoryPillProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-solid px-[8.8px] py-[2.8px] text-[10px] font-medium capitalize tracking-[0.25px] leading-[14px] whitespace-nowrap transition-colors ${isLight
        ? "border-[#8b5cf6] bg-[#8b5cf6] text-white"
        : "border-[rgba(2,245,212,0.25)] bg-[rgba(2,245,212,0.1)] text-[#02F5D4]"
        } ${className}`}
    >
      {children}
    </div>
  );
}
