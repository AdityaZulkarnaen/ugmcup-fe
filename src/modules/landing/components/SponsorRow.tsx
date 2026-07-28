import { sponsors } from "@/lib/constants/sponsors";
import { SponsorLogo } from "./SponsorLogo";

interface SponsorRowProps {
  className?: string;
  /** Renders every logo in black, for a row on a light background. */
  dark?: boolean;
  fast?: boolean;
}

export function SponsorRow({ className, dark, fast }: SponsorRowProps) {
  // Rendered twice so the track can loop seamlessly at translateX(-50%).
  const loop = [...sponsors, ...sponsors];

  return (
    <div className={`marquee-mask overflow-hidden ${className ?? ""}`}>
      <div className={`flex items-center ${fast ? "animate-marquee-fast sm:animate-marquee" : "animate-marquee"}`}>
        {loop.map((sponsor, index) => (
          <SponsorLogo
            key={`${sponsor.id}-${index}`}
            sponsor={sponsor}
            dark={dark}
          />
        ))}
      </div>
    </div>
  );
}
