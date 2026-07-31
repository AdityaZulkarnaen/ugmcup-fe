import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { SponsorRow } from "./SponsorRow";
import { HeroShuttles } from "./HeroShuttles";

/**
 * The still half of the hero decoration — the halos. Every knob lives in
 * `position`: unprefixed classes are the phone placement, `sm:` ones are the
 * desktop placement this section has always had.
 */
const decorations = [
  {
    id: "halo-top",
    src: "/images/landing/halo-top.png",
    position: "top-0 -left-40 h-300 w-300 sm:h-360 sm:w-360",
    fit: "object-contain",
    sizes: "(max-width: 640px) 400px, 1440px",
    priority: true,
  },
  {
    id: "halo-bottom",
    src: "/images/landing/halo-bottom.png",
    position:
      "bottom-0 -right-59 translate-y-140 h-300 w-300 sm:-right-100 sm:translate-y-270 sm:h-488 sm:w-488",
    fit: "object-contain",
    sizes: "(max-width: 640px) 400px, 1952px",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-bg sm:h-screen">
      {decorations.map(({ id, src, position, fit, sizes, priority }) => (
        <div key={id} className={`pointer-events-none absolute ${position}`}>
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            className={fit}
          />
        </div>
      ))}

      <HeroShuttles />

      <Navbar />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 pt-20 pb-12 text-center sm:h-full sm:min-h-0 sm:px-6 sm:pt-24 sm:pb-12">
        {/* Badge / Eyebrow Overlay */}
        <div
          data-aos="fade-down"
          className="
            inline-flex
            items-center
            justify-center
            px-4
            py-1.5
            sm:px-6
            sm:py-2.5
            rounded-full
            bg-white/5
            ring-[0.5px]
            ring-inset
            ring-white/30
            shadow-[0_50px_14px_rgba(139,92,246,0.00),0_32px_13px_rgba(139,92,246,0.01),0_18px_11px_rgba(139,92,246,0.05),0_8px_8px_rgba(139,92,246,0.09),0_2px_4px_rgba(139,92,246,0.05)]
          "
        >
          <span className="text-xs sm:text-xs md:text-xs font-semibold tracking-[0.02em] text-[#02F5D4]">
            UGM CUP 2026
          </span>
        </div>

        {/* Heading + Sponsor Row Block */}
        <div className="mt-5 sm:mt-6 flex w-fit flex-col items-center">
          <h1 className="flex flex-col w-fit items-center tracking-[-0.02em] font-extrabold italic">
            {/* Rallyverse */}
            <span
              data-aos="blur-in"
              data-aos-delay="120"
              data-aos-duration="900"
              className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-[#00F5D4] text-[42px] leading-[38px] sm:text-[96px] sm:leading-[80px]"
            >
              Rallyverse
            </span>

            {/* Desktop Headline */}
            <span
              data-aos="blur-in"
              data-aos-delay="260"
              data-aos-duration="900"
              className="hidden sm:flex text-white text-[96px] leading-[80px] mt-2"
            >
              Power in every motion
            </span>

            {/* Mobile Headline */}
            <span
              data-aos="blur-in"
              data-aos-delay="260"
              data-aos-duration="900"
              className="flex sm:hidden flex-col text-white text-[42px] leading-[38px] mt-1"
            >
              <span>Power in every</span>
              <span>motion</span>
            </span>
          </h1>

          {/* Sponsor Row Marquee */}
          <SponsorRow className="mt-8 sm:mt-14 max-w-6xl" />
        </div>

        {/* Primary CTA Link */}
        <div
          data-aos="fade-up"
          data-aos-delay="560"
          className="mt-8 sm:mt-14 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            href="/pertandingan"
            variant="solid"
            className="px-6 py-3 text-sm sm:px-7 sm:py-3.5 sm:text-base font-black italic"
          >
            Lihat Live Score
            <ArrowIcon className="font-black" />
          </Button>
        </div>
      </div>
    </section>
  );
}
