import { sponsors } from "@/lib/constants/sponsors";
import { SponsorLogo } from "./SponsorLogo";

interface SponsorRowProps {
  className?: string;
}

export function SponsorRow({ className }: SponsorRowProps) {
  // Rendered twice so the track can loop seamlessly at translateX(-50%).
  const loop = [...sponsors, ...sponsors];

  return (
    <div className={`marquee-mask overflow-hidden ${className ?? ""}`}>
      <div className="animate-marquee flex items-center"
        style={{ animationDuration: "2s0s" }}>
        {loop.map((sponsor, index) => (
          <SponsorLogo key={`${sponsor.id}-${index}`} sponsor={sponsor} />
        ))}
      </div>
    </div>
  );
}
