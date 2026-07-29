import Image from "next/image";
import { aboutPillars } from "@/lib/constants/about";

export function BehindPillars() {
  return (
    <section className="bg-[#F5F5F5] py-20 text-[#0B0B0F] sm:py-28">
      <div className="mx-auto w-[87.5%]">
        <h2
          data-aos="fade-up"
          className="text-center text-3xl font-black italic sm:text-4xl lg:text-5xl"
        >
          Di Balik UGM CUP
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-3">
          {aboutPillars.map((pillar, index) => (
            <div
              key={pillar.id}
              data-aos="zoom-in-up"
              data-aos-delay={`${index * 140}`}
            >
              <div className="flex aspect-7/6 items-center justify-center rounded-2xl bg-[#8B5CF6] p-10">
                <Image
                  src={pillar.logo}
                  alt=""
                  width={480}
                  height={480}
                  // `brightness-0 invert` flattens a coloured mark to solid
                  // white so it reads the same as the white-only assets.
                  className={`h-42 w-auto max-w-full object-contain sm:h-56 ${
                    pillar.forceWhite ? "brightness-0 invert" : ""
                  }`}
                />
              </div>

              <p className="mt-4 text-sm font-black italic sm:text-base">
                {pillar.title}
              </p>
              <p className="mt-1 text-xs text-[#6B6B73] sm:text-sm">
                {pillar.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
