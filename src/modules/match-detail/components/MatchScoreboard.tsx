import type { Match } from "@/lib/types";
import { resolveInstLabel } from "@/lib/utils/resolveInstLabel";

function statusLine(match: Match): string {
  if (match.matchType === "TEAM") {
    const finishedChildren = (match.childMatches ?? []).filter(
      (c) => c.status === "FINISHED" || c.status === "RETIRED"
    );
    if (match.status === "FINISHED") return "Match Beregu Selesai";
    return `${finishedChildren.length}/5 Match Selesai`;
  }

  if (match.status === "ONGOING") {
    const sets = match.sets ?? [];
    const activeSet = sets.length > 0 ? sets[sets.length - 1].setNumber : 1;
    return `Sedang berlangsung — Set ${activeSet}`;
  }
  if (match.status === "SCHEDULED") return "Belum dimulai";
  if (match.status === "RETIRED") return "Selesai (Retired)";
  return "Selesai";
}

function SideColumn({
  name,
  subName,
  logoUrl,
  initialText,
  won,
  isLight,
}: {
  name: string;
  subName?: string;
  logoUrl?: string;
  initialText?: string;
  won: boolean;
  isLight: boolean;
}) {
  const winnerNameColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const loserNameColor = isLight ? "text-[rgba(26,22,43,0.5)]" : "text-[rgba(255,255,255,0.5)]";
  const subColor = isLight ? "text-[rgba(26,22,43,0.45)]" : "text-[rgba(255,255,255,0.85)]";
  const logoBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.08]";
  const logoBg = isLight ? "bg-white" : "bg-white/[0.04]";
  const logoFallbackColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const logoShadow = isLight
    ? "shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
    : "shadow-[0px_4px_24px_0px_rgba(0,0,0,0.4)]";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {/* Logo box — image always contained within the box regardless of source size */}
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${logoShadow} ${logoBorder} ${logoBg}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="h-full w-full object-contain p-[3px]"
          />
        ) : (
          <span className={`text-lg font-extrabold tracking-wider ${logoFallbackColor}`}>
            {initialText || "?"}
          </span>
        )}
      </div>
      <div className="min-w-0">
        {/* Name: Bold 14px, winner = full opacity, loser = 50% opacity */}
        <p
          className={`flex flex-wrap items-center justify-center gap-x-1.5 break-words text-[14px] font-bold leading-[20px] transition-colors ${
            won ? winnerNameColor : loserNameColor
          }`}
        >
          {name}
        </p>
        {/* Subtitle: Regular 10px, rgba opacity */}
        {subName && (
          <p className={`mt-0.5 text-[10px] font-normal leading-[15px] ${subColor}`}>
            {subName}
          </p>
        )}
      </div>
    </div>
  );
}


function getInitials(participant: import("@/lib/types").Participant | undefined, athletesStr?: string): string {
  if (participant?.athletes && participant.athletes.length >= 2) {
    const a0 = participant.athletes[0]?.athlete?.name;
    const a1 = participant.athletes[1]?.athlete?.name;
    if (a0 && a1) {
      return (a0.trim().charAt(0) + a1.trim().charAt(0)).toUpperCase();
    }
  }
  if (athletesStr) {
    const parts = athletesStr.split(" - ").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  return "?";
}

export function getMatchSideDetails(match: Match, parentMatch?: Match) {
  const effectiveParent = parentMatch || match;
  const slotPrefix = match.slotType?.replace(/_[12]$/, "") || "";
  const disciplineId = match.discipline?.id || effectiveParent.discipline?.id || match.disciplineId;

  // Whether this is SMA doubles (sma-gp, sma-gpi, sma-gc)
  const isSMADoubles = !!disciplineId?.startsWith("sma-g");

  // Whether this is a beregu sub-match (TEAM parent) — in that case show only institution, not athlete names
  const isBereguSubmatch = !!parentMatch && parentMatch.matchType === "TEAM";

  // Side A athletes (skipped for beregu sub-matches)
  let athletesA: string | undefined;
  if (!isBereguSubmatch) {
    athletesA = match.participantA?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
    if (!athletesA && effectiveParent.teamA?.members) {
      const membersA = effectiveParent.teamA.members.filter(
        (m: any) => m.assignedSlot === slotPrefix || m.assignedSlot === match.slotType
      );
      if (membersA.length > 0) {
        athletesA = membersA.map((m: any) => m.athlete?.name).filter(Boolean).join(" - ");
      }
    }
    if (!athletesA && effectiveParent.participantA?.athletes) {
      athletesA = effectiveParent.participantA.athletes.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
    }
  }

  // Side A institution — multi-school support for SMA doubles
  const rawInstA =
    match.teamA?.institution?.name ||
    effectiveParent.teamA?.institution?.name;
  const instA =
    resolveInstLabel(match.participantA, undefined, disciplineId) ||
    resolveInstLabel(effectiveParent.participantA, rawInstA, disciplineId) ||
    rawInstA;

  const rawLogoA =
    match.participantA?.institution?.logoUrl ||
    match.teamA?.institution?.logoUrl ||
    effectiveParent.participantA?.institution?.logoUrl ||
    effectiveParent.teamA?.institution?.logoUrl;

  const logoA = isSMADoubles ? undefined : rawLogoA;
  const initialA = getInitials(match.participantA || effectiveParent.participantA, athletesA);

  const nameA = athletesA || instA || "UGM";
  const subA = athletesA ? instA : (match.discipline?.name || effectiveParent.discipline?.name);

  // Side B athletes (skipped for beregu sub-matches)
  let athletesB: string | undefined;
  if (!isBereguSubmatch) {
    athletesB = match.participantB?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
    if (!athletesB && effectiveParent.teamB?.members) {
      const membersB = effectiveParent.teamB.members.filter(
        (m: any) => m.assignedSlot === slotPrefix || m.assignedSlot === match.slotType
      );
      if (membersB.length > 0) {
        athletesB = membersB.map((m: any) => m.athlete?.name).filter(Boolean).join(" - ");
      }
    }
    if (!athletesB && effectiveParent.participantB?.athletes) {
      athletesB = effectiveParent.participantB.athletes.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
    }
  }

  // Side B institution — multi-school support for SMA doubles
  const rawInstB =
    match.teamB?.institution?.name ||
    effectiveParent.teamB?.institution?.name;
  const instB =
    resolveInstLabel(match.participantB, undefined, disciplineId) ||
    resolveInstLabel(effectiveParent.participantB, rawInstB, disciplineId) ||
    rawInstB;

  const rawLogoB =
    match.participantB?.institution?.logoUrl ||
    match.teamB?.institution?.logoUrl ||
    effectiveParent.participantB?.institution?.logoUrl ||
    effectiveParent.teamB?.institution?.logoUrl;

  const logoB = isSMADoubles ? undefined : rawLogoB;
  const initialB = getInitials(match.participantB || effectiveParent.participantB, athletesB);

  const nameB = athletesB || instB || "UI";
  const subB = athletesB ? instB : (match.discipline?.name || effectiveParent.discipline?.name);

  return {
    nameA,
    subA,
    logoA,
    initialA,
    nameB,
    subB,
    logoB,
    initialB,
  };
}

export function MatchScoreboard({
  match,
  parentMatch,
  isLight = false,
}: {
  match: Match;
  parentMatch?: Match;
  isLight?: boolean;
}) {
  const isTeamMatch = match.matchType === "TEAM" && !parentMatch;

  let displayScoreA = 0;
  let displayScoreB = 0;
  let setsWonA = 0;
  let setsWonB = 0;

  const sets = match.sets ?? [];
  setsWonA = sets.filter((s) => s.scoreA > s.scoreB).length;
  setsWonB = sets.filter((s) => s.scoreB > s.scoreA).length;

  const { nameA, subA, logoA, initialA, nameB, subB, logoB, initialB } = getMatchSideDetails(match, parentMatch);

  const wonA =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantAId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamAId);

  const wonB =
    (!!match.winnerParticipantId && match.winnerParticipantId === match.participantBId) ||
    (!!match.winnerTeamId && match.winnerTeamId === match.teamBId);

  if ((match.status === "FINISHED" || match.status === "RETIRED") && setsWonA === 0 && setsWonB === 0) {
    if (wonA) setsWonA = 2;
    if (wonB) setsWonB = 2;
  }

  if (isTeamMatch) {
    const finishedChildren = (match.childMatches ?? []).filter(
      (c) => c.status === "FINISHED" || c.status === "RETIRED"
    );
    displayScoreA = finishedChildren.filter((c) => {
      if (c.winnerTeamId) return c.winnerTeamId === match.teamAId;
      if (c.winnerParticipantId) return c.winnerParticipantId === c.participantAId;
      const sets = c.sets ?? [];
      const wA = sets.filter((s) => s.scoreA > s.scoreB).length;
      const wB = sets.filter((s) => s.scoreB > s.scoreA).length;
      return wA > wB || (c.status === "FINISHED" && wA >= wB && wA > 0);
    }).length;

    displayScoreB = finishedChildren.filter((c) => {
      if (c.winnerTeamId) return c.winnerTeamId === match.teamBId;
      if (c.winnerParticipantId) return c.winnerParticipantId === c.participantBId;
      const sets = c.sets ?? [];
      const wA = sets.filter((s) => s.scoreA > s.scoreB).length;
      const wB = sets.filter((s) => s.scoreB > s.scoreA).length;
      return wB > wA || (c.status === "FINISHED" && wB >= wA && wB > 0);
    }).length;
  } else {
    displayScoreA = setsWonA;
    displayScoreB = setsWonB;
  }

  const level = displayScoreA === displayScoreB;

  let dateStr = "Jadwal Belum Ditentukan";
  if (match.scheduledTime) {
    try {
      const d = new Date(match.scheduledTime);
      dateStr = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/(\d{2})\.(\d{2})$/, "$1:$2");
    } catch {
      dateStr = "Jadwal Belum Ditentukan";
    }
  }

  // Light/dark tokens
  const cardBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]";
  const cardBg = isLight ? "bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)]" : "bg-white/[0.03]";

  // Date: SemiBold 12px, rgba(255,255,255,0.85) per Figma
  const dateColor = isLight ? "text-[#1a162b]" : "text-[rgba(255,255,255,0.85)]";

  // Accent (status line) color — matches RETIRED badge yellow, FINISHED teal, etc.
  const accentColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";

  // Separator: very dim per Figma (rgba(255,255,255,0.15) dark, rgba(0,0,0,0.15) light)
  const separatorColor = isLight ? "text-[rgba(26,22,43,0.15)]" : "text-[rgba(255,255,255,0.15)]";

  // Score: Black/900 weight, winner = accent, loser = 50% opacity white/dark
  const winnerScoreColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";
  const loserScoreColor = isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[rgba(255,255,255,0.5)]";
  const neutralScoreColor = isLight ? "text-[#1a162b]" : "text-white";

  const scoreColorA = level
    ? neutralScoreColor
    : displayScoreA > displayScoreB
      ? winnerScoreColor
      : loserScoreColor;

  const scoreColorB = level
    ? neutralScoreColor
    : displayScoreB > displayScoreA
      ? winnerScoreColor
      : loserScoreColor;

  return (
    <section className={`rounded-2xl border ${cardBorder} ${cardBg} px-4 py-6 sm:px-6 sm:py-7 transition-all duration-300`}>
      {/* Date: SemiBold 12px per Figma */}
      <p className={`text-center text-[12px] font-semibold leading-[16px] ${dateColor}`}>{dateStr}</p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-8">
        <SideColumn
          name={nameA}
          subName={subA}
          logoUrl={logoA}
          initialText={initialA}
          won={wonA}
          isLight={isLight}
        />

        <div className="flex flex-col items-center pt-3">
          {/* Score: Black weight 48px per Figma, winner teal/violet, loser 50% opacity */}
          <p className="flex items-baseline gap-1.5 sm:gap-2">
            <span className={`text-4xl font-black tabular-nums leading-none sm:text-5xl ${scoreColorA}`}>
              {displayScoreA}
            </span>
            {/* Separator: rgba(255,255,255,0.15) per Figma */}
            <span className={`text-2xl font-black leading-none sm:text-3xl ${separatorColor}`}>
              :
            </span>
            <span className={`text-4xl font-black tabular-nums leading-none sm:text-5xl ${scoreColorB}`}>
              {displayScoreB}
            </span>
          </p>
          {/* Status line: SemiBold 9px uppercase per Figma — hidden on mobile, shown on sm+ */}
          <p className={`mt-2 hidden text-center text-[9px] font-semibold uppercase tracking-[0.225px] sm:block ${accentColor}`}>
            {statusLine(match)}
          </p>
        </div>

        <SideColumn
          name={nameB}
          subName={subB}
          logoUrl={logoB}
          initialText={initialB}
          won={wonB}
          isLight={isLight}
        />
      </div>

      {/* Status line on mobile */}
      <p className={`mt-5 text-center text-[9px] font-semibold uppercase tracking-[0.225px] sm:hidden ${accentColor}`}>
        {statusLine(match)}
      </p>
    </section>
  );
}

