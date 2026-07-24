import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { SponsorRow } from "./SponsorRow";

export function Hero() {
  return (
    <section className="relative overflow-hidden h-screen bg-hero-bg">
      {/* Halo top — adjust size/position here */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-360 w-360">
        <Image
          src="/images/hero/halo-top.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Halo bottom — adjust size/position here */}
      <div className="pointer-events-none absolute bottom-0 translate-y-270 -right-100 h-488 w-488">
        <Image
          src="/images/hero/halo-bottom.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Decorative shuttlecocks */}
      <div className="pointer-events-none absolute -left-28 top-36 h-32 w-32 sm:h-132 sm:w-132">
        <Image src="/images/hero/cock2.png" alt="" fill className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -right-36 -top-4 h-32 w-32 sm:h-144 sm:w-144">
        <Image src="/images/hero/cock1.png" alt="" fill className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -bottom-52 right-8 h-32 w-32 sm:h-120 sm:w-120">
        <Image src="/images/hero/cock3.png" alt="" fill className="object-contain" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
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
            <span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-5xl font-extrabold italic text-[#00F5D4] sm:text-[96px]">
              Rallyverse
            </span>
            <span className="-mt-4 text-3xl font-extrabold italic text-white sm:text-[96px]">
              Power in every motion
            </span>
          </h1>

          <SponsorRow className="mt-6 max-w-6xl" />
        </div>

        <Button href="#" variant="solid" className="mt-2 px-6 py-3 text-base font-black italic">
          Lihat Live Score
          <ArrowIcon className="font-black" />
        </Button>
      </div>
    </section>
  );
}
