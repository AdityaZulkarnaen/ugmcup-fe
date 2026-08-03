import type { Match } from "@/lib/types";
import { CourtIcon, StadiumIcon } from "@/components/ui/icons";

function InfoRow({
  icon,
  label,
  children,
  isLight,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isLight: boolean;
}) {
  const dividerColor = isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.04]";
  const iconColor = isLight ? "text-[rgba(26,22,43,0.35)]" : "text-[#6B6B73]";
  const labelColor = isLight ? "text-[rgba(26,22,43,0.45)]" : "text-[#7A7A83]";
  const valueColor = isLight ? "text-[#1a162b]" : "text-white";

  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t ${dividerColor} px-4 py-3`}>
      <span className={`shrink-0 ${iconColor}`}>{icon}</span>
      <dt className={`text-[11px] font-bold uppercase tracking-wider ${labelColor}`}>
        {label}:
      </dt>
      <dd className={`text-sm font-semibold ${valueColor}`}>{children}</dd>
    </div>
  );
}

export function MatchInfo({ match, isLight = false }: { match: Match; isLight?: boolean }) {
  const cardBorder = isLight ? "border-[rgba(0,0,0,0.08)]" : "border-white/[0.06]";
  const headingBorder = isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.06]";
  const headingBg = isLight ? "bg-[rgba(0,0,0,0.02)]" : "bg-white/[0.03]";
  const headingColor = isLight ? "text-[#6C47D1]" : "text-[#02F5D4]";

  return (
    <section className={`overflow-hidden rounded-xl border ${cardBorder} transition-all duration-300`}>
      <h2 className={`border-b ${headingBorder} ${headingBg} px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${headingColor}`}>
        Informasi Pertandingan
      </h2>

      <dl>
        <InfoRow icon={<StadiumIcon />} label="STADION" isLight={isLight}>
          GOR Nusantara (UGM)
        </InfoRow>
        <InfoRow icon={<CourtIcon />} label="LOKASI" isLight={isLight}>
          {match.courtNumber ? `Lapangan ${match.courtNumber}` : "Lapangan 1"}
        </InfoRow>
      </dl>
    </section>
  );
}
