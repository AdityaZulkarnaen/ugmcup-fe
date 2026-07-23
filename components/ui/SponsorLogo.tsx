import type { Sponsor } from "@/lib/constants/sponsors";

interface SponsorLogoProps {
  sponsor: Sponsor;
}

export function SponsorLogo({ sponsor }: SponsorLogoProps) {
  return (
    <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[9px] font-medium text-white/40 sm:h-10 sm:w-20">
      {sponsor.name}
    </div>
  );
}
