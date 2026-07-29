import type { Match } from "@/lib/types";


function statusLine(match: Match): string {
  if (match.matchType === "TEAM") {
    const finishedChildren = (match.childMatches ?? []).filter(
      (c) => c.status === "FINISHED" || c.status === "RETIRED"
    );
    if (match.status === "FINISHED") return "Match Beregu Selesai";
    return `${finishedChildren.length}/5 Partai Selesai`;
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
  won,
}: {
  name: string;
  subName?: string;
  logoUrl?: string;
  won: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <span className="text-xl font-bold text-gray-400">?</span>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`flex flex-wrap items-center justify-center gap-x-1.5 wrap-break-word text-sm font-bold sm:text-[15px] ${
            won ? "text-[#34E5A6]" : "text-white"
          }`}
        >
          {name}
        </p>
        {subName && <p className="mt-0.5 text-xs text-[#8A8A93] sm:text-[13px]">{subName}</p>}
      </div>
    </div>
  );
}

export function getMatchSideDetails(match: Match, parentMatch?: Match) {
  const effectiveParent = parentMatch || match;
  const slotPrefix = match.slotType?.replace(/_[12]$/, "") || "";

  // Side A athletes
  let athletesA = match.participantA?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
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

  // Side A institution
  const instA =
    match.participantA?.institution?.name ||
    match.teamA?.institution?.name ||
    effectiveParent.participantA?.institution?.name ||
    effectiveParent.teamA?.institution?.name;

  const logoA =
    match.participantA?.institution?.logoUrl ||
    match.teamA?.institution?.logoUrl ||
    effectiveParent.participantA?.institution?.logoUrl ||
    effectiveParent.teamA?.institution?.logoUrl;

  const nameA = athletesA || instA || "UGM";
  const subA = athletesA ? instA : (match.discipline?.name || effectiveParent.discipline?.name);

  // Side B athletes
  let athletesB = match.participantB?.athletes?.map((a) => a.athlete?.name).filter(Boolean).join(" - ");
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

  // Side B institution
  const instB =
    match.participantB?.institution?.name ||
    match.teamB?.institution?.name ||
    effectiveParent.participantB?.institution?.name ||
    effectiveParent.teamB?.institution?.name;

  const logoB =
    match.participantB?.institution?.logoUrl ||
    match.teamB?.institution?.logoUrl ||
    effectiveParent.participantB?.institution?.logoUrl ||
    effectiveParent.teamB?.institution?.logoUrl;

  const nameB = athletesB || instB || "UI";
  const subB = athletesB ? instB : (match.discipline?.name || effectiveParent.discipline?.name);

  return {
    nameA,
    subA,
    logoA,
    nameB,
    subB,
    logoB,
  };
}

export function MatchScoreboard({ match, parentMatch }: { match: Match; parentMatch?: Match }) {
  const isTeamMatch = match.matchType === "TEAM" && !parentMatch;

  let displayScoreA = 0;
  let displayScoreB = 0;
  let setsWonA = 0;
  let setsWonB = 0;

  const sets = match.sets ?? [];
  setsWonA = sets.filter((s) => s.scoreA > s.scoreB).length;
  setsWonB = sets.filter((s) => s.scoreB > s.scoreA).length;

  const { nameA, subA, logoA, nameB, subB, logoB } = getMatchSideDetails(match, parentMatch);

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
    displayScoreA = finishedChildren.filter(
      (c) => c.winnerTeamId && c.winnerTeamId === match.teamAId
    ).length;
    displayScoreB = finishedChildren.filter(
      (c) => c.winnerTeamId && c.winnerTeamId === match.teamBId
    ).length;
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

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 sm:px-6 sm:py-7">
      <p className="text-center text-[13px] font-bold text-white">{dateStr}</p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-8">
        <SideColumn
          name={nameA}
          subName={subA}
          logoUrl={logoA}
          won={wonA}
        />

        <div className="flex flex-col items-center pt-3">
          <p className="flex items-baseline gap-2 sm:gap-2.5">
            <span
              className={`text-3xl font-black tabular-nums sm:text-4xl ${!level && displayScoreA > displayScoreB ? "text-[#34E5A6]" : "text-white"
                }`}
            >
              {displayScoreA}
            </span>
            <span className="text-xl font-black text-[#5A5A63] sm:text-2xl">
              :
            </span>
            <span
              className={`text-3xl font-black tabular-nums sm:text-4xl ${!level && displayScoreB > displayScoreA ? "text-[#34E5A6]" : "text-white"
                }`}
            >
              {displayScoreB}
            </span>
          </p>

          <p className="mt-2 hidden text-center text-[11px] font-bold uppercase tracking-wide text-[#E3B24D] sm:block">
            {statusLine(match)}
          </p>
        </div>

        <SideColumn
          name={nameB}
          subName={subB}
          logoUrl={logoB}
          won={wonB}
        />
      </div>

      <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-wide text-[#E3B24D] sm:hidden">
        {statusLine(match)}
      </p>
    </section>
  );
}
