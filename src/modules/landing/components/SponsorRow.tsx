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
    // Pindahkan AOS hanya di wrapper luar
    <div
      data-aos="fade-up"
      data-aos-delay="260"
      data-aos-duration="1200"
      className={`marquee-mask overflow-hidden ${className ?? ""}`}
    >
      {/* Hapus data-aos dari div marquee ini */}
      <div
        className={`flex items-center ${fast ? "animate-marquee-fast sm:animate-marquee" : "animate-marquee"}`}
      >
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