import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#02F5D4] shadow-[0_8px_8px_0_rgba(139,92,246,0.09)]">
      {children}
    </span>
  );
}
