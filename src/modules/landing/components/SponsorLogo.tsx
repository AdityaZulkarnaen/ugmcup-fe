import Image from "next/image";
import type { Sponsor } from "@/lib/constants/sponsors";

interface SponsorLogoProps {
  sponsor: Sponsor;
  /** Flattens the mark to solid black, for rows sitting on a light section. */
  dark?: boolean;
}

export function SponsorLogo({ sponsor, dark }: SponsorLogoProps) {
  return (
    <div className="mx-8 flex h-14 shrink-0 items-center justify-center">
      <Image
        src={sponsor.logo}
        alt={sponsor.name}
        width={160}
        height={40}
        // The set is a mix of white and dark marks; `brightness-0` lands them
        // all on the same black regardless of what they started as.
        className={`h-8 w-auto object-contain sm:h-14 ${dark ? "invert" : ""} ${sponsor.className ?? ""}`}
      />
    </div>
  );
}
