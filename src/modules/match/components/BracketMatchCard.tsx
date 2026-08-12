"use client";

import Image from "next/image";
import {
  retirementLabels,
  type BracketMatch,
  type BracketSide,
  type RetirementReason,
} from "@/lib/constants/matches";

/** Shared hover/select wiring so a card can drive the path highlight. */
export interface HighlightProps {
  /** Participant whose run is currently lit up, if any. */
  activeId?: string;
  /** True when this card sits on the active path. */
  onPath?: boolean;
  /** True when some path is active and this card is not on it. */
  dimmed?: boolean;
  onHover?: (participantId?: string) => void;
  onSelect?: (participantId: string) => void;
  isLight?: boolean;
}

/**
 * Participant badge: the image the admin registered, or a neutral placeholder
 * while no image has been uploaded.
 */
function ParticipantBadge({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={32}
        height={32}
        className="h-4 w-4 shrink-0 rounded-full border border-white/10 object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold leading-none text-[#8A8A93]"
    >
      ?
    </span>
  );
}

/**
 * Marks the side that could not finish — injury or a no-show. The reason itself
 * is a tooltip, so the tag stays short enough for a narrow bracket column.
 */
function RetiredBadge({ reason }: { reason: RetirementReason }) {
  return (
    <span
      title={retirementLabels[reason]}
      className="shrink-0 rounded border border-[#FB2C36]/35 bg-[#FB2C36]/12 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-[#FF8A90]"
    >
      Retired
    </span>
  );
}

/**
 * One competitor line: badge + name + games won. Hovering or focusing the row
 * lights that athlete's path; clicking pins it.
 */
function SideRow({
  side,
  activeId,
  isLight,
  onHover,
  onSelect,
}: { side: BracketSide } & HighlightProps) {
  let name = side.name;
  const avatar = side.avatar;

  // An empty side is either a walkover ("BYE") or a slot still waiting on the
  // round before it ("TBD"). Both are placeholders: no badge, muted italic.
  if (!name && name !== "") {
    name = side.isBye ? "BYE" : "TBD";
  }
  const isPlaceholder = !side.participantId && (name === "TBD" || name === "BYE");

  const isActive = Boolean(
    side.participantId && side.participantId === activeId
  );

  return (
    <button
      type="button"
      disabled={!side.participantId}
      aria-pressed={side.participantId ? isActive : undefined}
      /* Penanda bagi papan bagan untuk membedakan klik pada peserta dari klik
         di area lain, yang artinya "batalkan sorotan". */
      data-bracket-player={side.participantId || undefined}
      onPointerEnter={() => onHover?.(side.participantId)}
      onPointerLeave={() => onHover?.(undefined)}
      onFocus={() => onHover?.(side.participantId)}
      onBlur={() => onHover?.(undefined)}
      onClick={() => side.participantId && onSelect?.(side.participantId)}
      className={`flex w-full items-center gap-2 py-2 pl-3.5 pr-3 text-left transition-colors disabled:cursor-default ${
        isLight
          ? `enabled:hover:bg-[rgba(0,0,0,0.02)] ${isActive ? "bg-[#F3F0FF]" : ""}`
          : `enabled:hover:bg-white/[0.03] ${isActive ? "bg-[#02F5D4]/10" : ""}`
      }`}
    >
      {!isPlaceholder && name !== "" && (
        <ParticipantBadge avatar={avatar} name={name} />
      )}
      <span
        className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${
          isPlaceholder
            ? isLight ? "italic text-[rgba(26,22,43,0.3)]" : "italic text-[#6B6B73]"
            : isActive
              ? isLight ? "text-[#6C47D1]" : "text-[#5CFCE7]"
              : side.winner
                ? isLight ? "text-[#1a162b]" : "text-white"
                : isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#7A7A83]"
        }`}
      >
        {name}
      </span>
      {side.retired && <RetiredBadge reason={side.retired} />}
      {side.score !== null && (
        <span
          className={`shrink-0 text-[13px] font-bold tabular-nums ${
            side.winner
              ? isLight ? "text-[#8b5cf6]" : "text-[#02F5D4]"
              : isLight ? "text-[rgba(26,22,43,0.25)]" : "text-[#5A5A63]"
          }`}
        >
          {side.score}
        </span>
      )}
    </button>
  );
}

export function BracketMatchCard({
  match,
  onPath,
  dimmed,
  isLight,
  ...highlight
}: { match: BracketMatch } & HighlightProps) {
  // Nothing was ever drawn into this tree position. It keeps its height so the
  // rounds stay aligned, but there is no card and no line to anywhere.
  if (match.isEmptySlot) {
    return (
      <article
        aria-hidden
        className="pointer-events-none w-full overflow-hidden rounded-xl border border-transparent opacity-0"
      >
        <div className="divide-y divide-transparent">
          <SideRow side={match.home} onPath={onPath} {...highlight} />
          <SideRow side={match.away} onPath={onPath} {...highlight} />
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative overflow-hidden rounded-xl border transition-all ${
        onPath
          ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/6 shadow-[0_0_12px_-2px_rgba(139,92,246,0.35)]"
          : match.isByeMatch
            ? // A walkover is real but uncontested — dashed, so it reads as
              // "advanced without playing" rather than a fixture.
              isLight
              ? "border-dashed border-[rgba(0,0,0,0.12)] bg-[rgba(0,0,0,0.015)]"
              : "border-dashed border-white/12 bg-white/[0.015]"
            : isLight
              ? "border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.15)]"
              : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
      } ${dimmed ? "opacity-35" : ""}`}
    >
      <div className={`divide-y ${isLight ? "divide-[rgba(0,0,0,0.05)]" : "divide-white/[0.04]"}`}>
        <SideRow side={match.home} onPath={onPath} isLight={isLight} {...highlight} />
        <SideRow side={match.away} onPath={onPath} isLight={isLight} {...highlight} />
      </div>
    </article>
  );
}

export function BracketChampionCard({
  label,
  name,
  onPath,
  dimmed,
  isLight,
}: {
  label: string;
  name: string;
} & HighlightProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-center transition-all ${
        isLight
          ? onPath
            ? "border-[#02F5D4] bg-linear-to-b from-[#F3F0FF] to-[#EDE8FF] shadow-[0_0_12px_-2px_rgba(2,245,212,0.35)]"
            : "border-[#D9D3FF] bg-linear-to-b from-[#FBFAFF] to-[#F3F0FF]"
          : onPath
            ? "border-[#02F5D4] bg-linear-to-b from-[#2A1F52] to-[#181233] shadow-[0_0_12px_-2px_rgba(2,245,212,0.45)]"
            : "border-[#8B5CF6]/45 bg-linear-to-b from-[#2A1F52] to-[#181233]"
      } ${dimmed ? "opacity-35" : ""}`}
    >
      <p className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-[#6C47D1]" : "text-[#5CFCE7]"}`}>
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-semibold italic ${isLight ? "text-[#1a162b]" : "text-[#D9D3FF]"}`}>
        {name}
      </p>
    </div>
  );
}
