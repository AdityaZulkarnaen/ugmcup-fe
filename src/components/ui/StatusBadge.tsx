import type { MatchStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: MatchStatus;
  isLight?: boolean;
  className?: string;
}

/**
 * StatusBadge component matching Figma nodes 517:8054 (Retired), 517:8059 (Walk Over), Live, Mendatang, Selesai.
 *
 * Dark Mode:
 * - LIVE: border-[#FB2C36]/30 bg-[#FB2C36]/15 text-[#FF6467] + live pulsing dot
 * - MENDATANG: border-[#7C6BFF]/35 bg-[#7C6BFF]/15 text-[#B4A9FF]
 * - SELESAI: border-white/10 bg-white/[0.05] text-white/40
 * - RETIRED: border-white/10 bg-white/[0.05] text-white/40
 * - WALK OVER: border-white/10 bg-white/[0.05] text-white/40
 *
 * Light Mode:
 * - LIVE: border-[#FB2C36]/30 bg-[#FB2C36]/08 text-[#FB2C36] + live pulsing dot
 * - MENDATANG: border-[#8b5cf6]/30 bg-[#8b5cf6]/08 text-[#8b5cf6]
 * - SELESAI: border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[rgba(26,22,43,0.4)]
 * - RETIRED: border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[rgba(26,22,43,0.4)]
 * - WALK OVER: border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] text-[rgba(26,22,43,0.4)]
 */
const statusBadgeDark: Record<MatchStatus, { label: string; className: string }> = {
  ONGOING: {
    label: "LIVE",
    className: "border-[#FB2C36]/30 bg-[#FB2C36]/15 text-[#FF6467]",
  },
  SCHEDULED: {
    label: "MENDATANG",
    className: "border-[#8b5cf6]/35 bg-[#8b5cf6]/15 text-[#8B5CF6]",
  },
  FINISHED: {
    label: "SELESAI",
    className: "border-[#22C55E] bg-[#22C55E]/10 text-[#86EFAC]",
  },
  RETIRED: {
    label: "RETIRED",
    className: "border-[#EF9F27]/50 bg-[#EF9F27]/10 text-[#FAC775]",
  },
  WALK_OVER: {
    label: "WALK OVER",
    className: "border-[#FB2C36]/30 bg-[#FB2C36]/10 text-[#FF6467]",
  },
};

const statusBadgeLight: Record<MatchStatus, { label: string; className: string }> = {
  ONGOING: {
    label: "LIVE",
    className: "border-[#FB2C36]/30 bg-[#FB2C36]/10 text-[#FB2C36]",
  },
  SCHEDULED: {
    label: "MENDATANG",
    className: "border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]",
  },
  FINISHED: {
    label: "SELESAI",
    className: "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]",
  },
  RETIRED: {
    label: "RETIRED",
    className: "border-[#FF9900]/50 bg-[#FF9900]/10 text-[#FF9900]",
  },
  WALK_OVER: {
    label: "WALK OVER",
    className: "border-[#FB2C36]/30 bg-[#FB2C36]/10 text-[#FB2C36]",
  },
};

export function StatusBadge({
  status,
  isLight = false,
  className = "",
}: StatusBadgeProps) {
  const badgeMap = isLight ? statusBadgeLight : statusBadgeDark;
  const badge = badgeMap[status] || badgeMap.SCHEDULED;
  const isLive = status === "ONGOING";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25px] leading-[14px] ${badge.className} ${className}`}
    >
      {isLive && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FB2C36] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FB2C36]" />
        </span>
      )}
      {badge.label}
    </span>
  );
}
