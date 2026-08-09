import type { Participant } from "@/lib/types";

/**
 * Determine the institution label for one side of a match.
 *
 * - For SMA doubles (disciplineId starts with "sma-g"):
 *   Each athlete carries their own school. When the two athletes come from
 *   different institutions, show both joined with " / ".
 * - Otherwise: use participant.institution.name as-is.
 *
 * @param participant  The resolved Participant object from the API.
 * @param fallback     A pre-computed fallback string (e.g. team institution name).
 * @param disciplineId The discipline ID (e.g. "sma-gp", "sma-gpi", "sma-gc").
 */
export function resolveInstLabel(
  participant: Participant | undefined,
  fallback: string | undefined,
  disciplineId: string | undefined
): string | undefined {
  const isSMADoubles =
    disciplineId?.startsWith("sma-g");

  if (isSMADoubles && participant?.athletes && participant.athletes.length >= 2) {
    const inst0 = participant.athletes[0]?.athlete?.institution?.name;
    const inst1 = participant.athletes[1]?.athlete?.institution?.name;
    if (inst0 && inst1 && inst0 !== inst1) return `${inst0} / ${inst1}`;
    return inst0 || inst1 || participant.institution?.name || fallback;
  }
  return participant?.institution?.name || fallback;
}
