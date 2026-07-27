import MatchDetailPage from "@/modules/match-detail";
import { matchDetailIds } from "@/lib/constants/matches";

/** Prerenders a statistics page for every live and scheduled match. */
export function generateStaticParams() {
  return matchDetailIds().map((id) => ({ id }));
}

export default async function StatistikPertandingan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MatchDetailPage id={id} />;
}
