import MatchDetailPage from "@/modules/match-detail";

export default async function StatistikPertandingan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MatchDetailPage id={id} />;
}
