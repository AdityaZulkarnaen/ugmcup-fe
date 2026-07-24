import Image from "next/image";
import type { Sponsor } from "@/lib/constants/sponsors";

interface SponsorLogoProps {
  sponsor: Sponsor;
}

export function SponsorLogo({ sponsor }: SponsorLogoProps) {
  return (
    <div className="mx-6 flex h-14 shrink-0 items-center justify-center">
      <Image
        src={sponsor.logo}
        alt={sponsor.name}
        width={160}
        height={40}
        className="h-8 w-auto object-contain sm:h-14"
      />
    </div>
  );
}
