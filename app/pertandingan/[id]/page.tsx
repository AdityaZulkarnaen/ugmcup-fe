import type { Metadata } from "next";
import MatchDetailPage from "@/modules/match-detail";
import { getPublicMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { SITE_NAME } from "@/lib/seo";

/** The institution behind a side, matching how the detail header names them. */
function sideName(match: Match, side: "A" | "B"): string | undefined {
  const team = side === "A" ? match.teamA : match.teamB;
  const participant = side === "A" ? match.participantA : match.participantB;
  return team?.institution?.name ?? participant?.institution?.name;
}

/**
 * Titles the shared link.
 *
 * These pages are `noindex` on purpose — the body is filled in on the client
 * from the live-score API, so a crawler only ever sees an empty shell and would
 * rightly treat it as a thin page. What still matters is the preview card in
 * WhatsApp or Discord when someone passes a live match around, and that only
 * needs the tags, which is why the match is fetched here regardless.
 *
 * The fetch is wrapped: a match that has been deleted, or an API that is down,
 * must degrade to a generic title rather than fail the page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const base: Metadata = {
    title: "Detail Pertandingan",
    description: `Skor, jalannya poin, dan susunan pemain sebuah pertandingan ${SITE_NAME}.`,
    alternates: { canonical: `/pertandingan/${id}` },
    // `follow` stays on so the crawler still walks back out to the indexable
    // pages this one links to.
    robots: { index: false, follow: true },
  };

  try {
    const match = await getPublicMatch(id);
    if (!match) return base;

    const home = sideName(match, "A");
    const away = sideName(match, "B");

    if (!home || !away) return base;

    const title = `${home} vs ${away}`;
    const round = [match.discipline?.name, match.roundName]
      .filter(Boolean)
      .join(" — ");
    const description = `${title}${round ? ` · ${round}` : ""} · ${SITE_NAME}. Lihat skor per set dan riwayat poin pertandingan ini.`;

    return {
      ...base,
      title,
      description,
      openGraph: {
        url: `/pertandingan/${id}`,
        title: `${title} | ${SITE_NAME}`,
        description,
      },
    };
  } catch {
    return base;
  }
}

export default async function StatistikPertandingan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MatchDetailPage id={id} />;
}
