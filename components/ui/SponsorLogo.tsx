import type { Sponsor } from "@/lib/constants/sponsors";

interface SponsorLogoProps {
  sponsor: Sponsor;
}

export function SponsorLogo({ sponsor }: SponsorLogoProps) {
  return (
    <div className="mx-6 flex h-10 shrink-0 items-center justify-center text-lg font-bold tracking-wide text-white/50">
      {sponsor.name}
    </div>
  );
}
