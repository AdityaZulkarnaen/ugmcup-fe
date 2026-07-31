import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { tournamentVenue } from "@/lib/constants/matches";

/**
 * Where the tournament is played. The arena sits flush against the bottom of
 * the section — it is drawn 1440px wide and keeps a floor width on narrow
 * screens, so the stands run off both edges instead of shrinking to a sliver.
 */
export function Venue() {
  return (
    <section className="overflow-hidden bg-[#ffffff] pt-24 text-center text-[#0B0B0F] sm:pt-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <p
          data-aos="fade-down"
          className="text-sm font-medium tracking-wide sm:text-base"
        >
          Venue pertandingan
        </p>

        <h2
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="mt-3 text-4xl font-black italic leading-[1.1] sm:text-6xl lg:text-7xl"
        >
          {tournamentVenue.name} {tournamentVenue.org}
        </h2>

        {/* Wrapper carries the reveal so the button keeps its own transitions */}
        <div data-aos="zoom-in" data-aos-delay="260" className="mt-8">
          <Button
            href={tournamentVenue.mapsUrl}
            variant="solid"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-base font-black italic"
          >
            Buka Google Maps
            <ArrowIcon className="font-black" />
          </Button>
        </div>
      </div>

      <div
        data-aos="fade-up"
        data-aos-delay="0"
        data-aos-duration="900"
        className="mt-12 flex justify-center sm:mt-20"
      >
        <Image
          src="/images/landing/venue.svg"
          alt=""
          width={1440}
          height={600}
          className="h-[aut min-w-[420px] sm:w-full sm:min-w-[820px] max-w-none"
        />
      </div>
    </section>
  );
}
