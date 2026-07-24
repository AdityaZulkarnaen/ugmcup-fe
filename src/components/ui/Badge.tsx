import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border-[1.5px] border-white bg-[radial-gradient(circle_at_50%_0%,#5CFCE7_0%,#02F5D4_70%)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#12102A]">
      {children}
    </span>
  );
}
