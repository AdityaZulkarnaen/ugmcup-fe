import Image from "next/image";
import {
  getParticipant,
  type BracketMatch,
  type BracketSide,
} from "@/lib/constants/matches";

/**
 * Participant badge: the image the admin registered, or the gold shuttlecock
 * mark while no image has been uploaded.
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

/** One competitor line: badge + name + games won. */
function SideRow({ side }: { side: BracketSide }) {
  const participant = side.participantId
    ? getParticipant(side.participantId)
    : undefined;

  return (
    <div className="flex items-center gap-2 py-2 pl-3.5 pr-3">
      {participant && (
        <ParticipantBadge
          avatar={participant.avatar}
          name={participant.players.join(" / ")}
        />
      )}
      <span
        className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${
          !participant
            ? "italic text-[#6B6B73]"
            : side.winner
              ? "text-white"
              : "text-[#7A7A83]"
        }`}
      >
        {participant ? participant.players.join(" / ") : "TBD"}
      </span>
      {side.score !== null && (
        <span
          className={`shrink-0 text-[13px] font-bold tabular-nums ${
            side.winner ? "text-[#02F5D4]" : "text-[#5A5A63]"
          }`}
        >
          {side.score}
        </span>
      )}
    </div>
  );
}

export function BracketMatchCard({ match }: { match: BracketMatch }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/15">
      <div className="divide-y divide-white/[0.04]">
        <SideRow side={match.home} />
        <SideRow side={match.away} />
      </div>
    </article>
  );
}

export function BracketChampionCard({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <div className="rounded-lg border border-[#C79A3B]/45 bg-linear-to-b from-[#4A3A1E] to-[#2B2114] px-4 py-3 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#F0C97A]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold italic text-[#B9A87F]">
        {name}
      </p>
    </div>
  );
}
