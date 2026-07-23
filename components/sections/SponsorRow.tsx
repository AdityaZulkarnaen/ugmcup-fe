import { sponsors } from "@/lib/constants/sponsors";
import { SponsorLogo } from "@/components/ui/SponsorLogo";

export function SponsorRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {sponsors.map((sponsor) => (
        <SponsorLogo key={sponsor.id} sponsor={sponsor} />
      ))}
    </div>
  );
}
