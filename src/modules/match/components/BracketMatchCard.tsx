"use client";

import Image from "next/image";
import {
  getParticipant,
  retirementLabels,
  sideName,
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
  onHover,
  onSelect,
}: { side: BracketSide } & HighlightProps) {
  let name = side.name;
  let inst = side.inst;
  let avatar = side.avatar;
  let participant = undefined;

  if (!name && side.participantId) {
    participant = getParticipant(side.participantId);
    if (participant) {
      name = sideName(participant.players);
      avatar = participant.avatar;
      inst = participant.team;
    }
  }

  if (!name && name !== "") {
    name = side.isBye ? "" : "TBD";
  }

  const isActive = Boolean(
    side.participantId && side.participantId === activeId
  );

  return (
    <button
      type="button"
      disabled={!side.participantId}
      aria-pressed={side.participantId ? isActive : undefined}
      onPointerEnter={() => onHover?.(side.participantId)}
      onPointerLeave={() => onHover?.(undefined)}
      onFocus={() => onHover?.(side.participantId)}
      onBlur={() => onHover?.(undefined)}
      onClick={() => side.participantId && onSelect?.(side.participantId)}
      className={`flex w-full items-center gap-2 py-2 pl-3.5 pr-3 text-left transition-colors enabled:hover:bg-white/[0.03] disabled:cursor-default ${
        isActive ? "bg-[#EF9F27]/10" : ""
      }`}
    >
      {(side.participantId || (name !== "TBD" && name !== "")) && (
        <ParticipantBadge avatar={avatar} name={name} />
      )}
      <div className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13px] font-semibold ${
            (!side.participantId && name === "TBD")
              ? "italic text-[#6B6B73]"
              : isActive
                ? "text-[#FAC775]"
                : side.winner
                  ? "text-white"
                  : "text-[#7A7A83]"
          }`}
        >
          {name}
        </span>

      </div>
      {side.retired && <RetiredBadge reason={side.retired} />}
      {side.score !== null && (
        <span
          className={`shrink-0 text-[13px] font-bold tabular-nums ${
            side.winner ? "text-[#02F5D4]" : "text-[#5A5A63]"
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
  ...highlight
}: { match: BracketMatch } & HighlightProps) {
  if (match.isByeMatch) {
    return (
      <article className="w-full relative overflow-hidden rounded-xl opacity-0 pointer-events-none border border-transparent">
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
          ? "border-[#EF9F27]/60 bg-[#EF9F27]/[0.06] shadow-[0_0_12px_-2px_rgba(239,159,39,0.35)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
      } ${dimmed ? "opacity-35" : ""}`}
    >
      <div className="divide-y divide-white/[0.04]">
        <SideRow side={match.home} onPath={onPath} {...highlight} />
        <SideRow side={match.away} onPath={onPath} {...highlight} />
      </div>
    </article>
  );
}

export function BracketChampionCard({
  label,
  name,
  onPath,
  dimmed,
}: {
  label: string;
  name: string;
} & HighlightProps) {
  return (
    <div
      className={`rounded-lg border bg-linear-to-b from-[#4A3A1E] to-[#2B2114] px-4 py-3 text-center transition-all ${
        onPath
          ? "border-[#EF9F27] shadow-[0_0_12px_-2px_rgba(239,159,39,0.45)]"
          : "border-[#C79A3B]/45"
      } ${dimmed ? "opacity-35" : ""}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#F0C97A]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold italic text-[#B9A87F]">
        {name}
      </p>
    </div>
  );
}
