import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { SponsorRow } from "./SponsorRow";

/**
 * The decorative layer of the hero — halos and shuttlecocks, all absolutely
 * positioned. Every knob lives in `position`: unprefixed classes are the phone
 * placement, `sm:` ones are the desktop placement this section has always had.
 * Nudging a piece is a one-line edit here and moves nothing else.
 */
const decorations = [
  {
    id: "halo-top",
    src: "/images/hero/halo-top.png",
    position: "top-0 -left-40 h-300 w-300 sm:h-360 sm:w-360",
    fit: "object-contain",
    sizes: "(max-width: 640px) 400px, 1440px",
    priority: true,
  },
  {
    id: "halo-bottom",
    src: "/images/hero/halo-bottom.png",
    position:
      "bottom-0 -right-59 translate-y-140 h-300 w-300 sm:-right-100 sm:translate-y-270 sm:h-488 sm:w-488",
    fit: "object-contain",
    sizes: "(max-width: 640px) 400px, 1952px",
  },
  {
    id: "cock-left",
    src: "/images/hero/cock2.png",
    position: "-left-20 top-42 h-70 w-70 sm:-left-28 sm:top-36 sm:h-132 sm:w-132",
    fit: "object-contain",
    sizes: "(max-width: 640px) 160px, 528px",
  },
  {
    id: "cock-right",
    src: "/images/hero/cock1.png",
    position: "-right-28 -rotate-12 sm:rotate-0 top-12 h-80 w-80 sm:-right-36 sm:top-10 sm:h-144 sm:w-144",
    fit: "object-contain",
    sizes: "(max-width: 640px) 144px, 576px",
  },
  {
    id: "cock-bottom",
    src: "/images/hero/cock3.png",
    position:
      "bottom-0 translate-y-10 -right-20 h-65 w-65 sm:-bottom-52 sm:right-32 sm:h-120 sm:w-120 -rotate-12 sm:rotate-0",
    fit: "object-contain",
    sizes: "(max-width: 640px) 64px, 480px",
  },
];

export function Hero() {
  return (
    // `min-h-screen` on phones: the section grows rather than clipping the CTAs
    // when the browser chrome eats into the viewport.
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

      <Navbar />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-6 px-6 pb-16 pt-24 text-center sm:h-full sm:min-h-0">
        <div className="flex items-center justify-center bg-transparent">
        {/* Komponen Badge Utama */}
        <div
          className="
            inline-flex
            items-center
            justify-center
            px-6
            py-2.5
            rounded-full
            bg-white/5
            ring-[0.5px]
            ring-inset
            ring-white/30
            shadow-[0_50px_14px_rgba(139,92,246,0.00),0_32px_13px_rgba(139,92,246,0.01),0_18px_11px_rgba(139,92,246,0.05),0_8px_8px_rgba(139,92,246,0.09),0_2px_4px_rgba(139,92,246,0.05)]
          "
        >
          <span className="text-[#02F5D4] font-medium tracking-wide text-sm md:text-base">
            UGM CUP 2026
          </span>
        </div>
      </div>

        {/* Title + sponsor marquee share the same width */}
        <div className="flex w-fit flex-col items-center">
          <h1 className="flex flex-col w-fit">
            <span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-[42px] font-extrabold italic text-[#00F5D4] sm:text-[96px]">
              Rallyverse
            </span>
            <span className="hidden sm:flex -mt-1 text-4xl font-extrabold italic text-white sm:-mt-4 sm:text-[96px]">
              Power in every motion
            </span>
            <span className="flex sm:hidden leading-[0.9] -mt-4 text-[42px] font-extrabold italic text-white sm:-mt-4 sm:text-[96px]">
              Power in every <br></br> motion
            </span>
          </h1>

          <SponsorRow className="mt-2 sm:mt-6 max-w-6xl" />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            href="/pertandingan"
            variant="solid"
            className="px-6 py-3 text-base font-black italic"
          >
            Lihat Live Score
            <ArrowIcon className="font-black" />
          </Button>
          <Button
            href="#"
            variant="outline"
            className="px-6 py-3 text-base font-black italic"
          >
            Dokumentasi
            <ArrowIcon className="font-black" />
          </Button>
        </div>
      </div>
    </section>
  );
}
