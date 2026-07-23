import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { SponsorRow } from "@/components/sections/SponsorRow";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-bg">
      {/* Background glow layers */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-105">
        <Image
          src="/images/hero/halo-top.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 -right-64 -bottom-120 h-180"
      >
        <Image
          src="/images/hero/halo-bottom.png"
          alt=""
          fill
          className="object-cover blur-2xl"
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-6xl flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <Badge>UGM CUP 2026</Badge>

        <h1 className="flex flex-col ">
          <span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-5xl font-extrabold italic text-[#00F5D4] sm:text-[96px]">
            Rallyverse
          </span>
          <span className="text-3xl -mt-4 font-extrabold text-white sm:text-[96px] italic">
            Power in every motion
          </span>
        </h1>

        <SponsorRow />

        <Button href="#" variant="solid" className="mt-2">
          Lihat Live Score
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}
