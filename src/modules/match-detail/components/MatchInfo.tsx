import { tournamentVenue, type MatchDetail } from "@/lib/constants/matches";
import { CourtIcon, StadiumIcon } from "@/components/ui/icons";

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-white/[0.04] px-4 py-3">
      <span className="shrink-0 text-[#6B6B73]">{icon}</span>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A83]">
        {label}:
      </dt>
      <dd className="text-sm font-bold text-white">{children}</dd>
    </div>
  );
}

export function MatchInfo({ match }: { match: MatchDetail }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06]">
      <h2 className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#E3B24D]">
        Informasi Pertandingan
      </h2>

      <dl>
        <InfoRow icon={<StadiumIcon />} label="Stadion">
          {tournamentVenue.name}{" "}
          <span className="font-medium text-[#7A7A83]">
            ({tournamentVenue.org})
          </span>
        </InfoRow>
        <InfoRow icon={<CourtIcon />} label="Lokasi">
          {match.court}
        </InfoRow>
      </dl>
    </section>
  );
}
