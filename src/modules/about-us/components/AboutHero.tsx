import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Glow layer, same idea as the landing hero: every knob lives in `position`,
 * unprefixed for phones and `sm:` for desktop, so nudging one piece is a
 * one-line edit here.
 */
const decorations = [
  {
      id: "halo-top",
      src: "/images/landing/halo-top fix.webp",
      position: "top-0 -left-40 h-300 w-300 sm:h-360 sm:w-360",
      fit: "object-contain",
      sizes: "(max-width: 640px) 400px, 1440px",
      priority: true,
    },
    {
      id: "halo-bottom",
      src: "/images/landing/halo-bottom fix.webp",
      position:
        "bottom-0 -right-59 translate-y-140 h-300 w-300 sm:-right-100 sm:translate-y-270 sm:h-488 sm:w-488",
      fit: "object-contain",
      sizes: "(max-width: 640px) 400px, 1952px",
    },
];

export function AboutHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-bg sm:h-screen">
      {decorations.map(({ id, src, position, priority }) => (
        <div key={id} className={`pointer-events-none absolute ${position}`}>
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 800px, 1440px"
            className="object-contain"
          />
        </div>
      ))}

      <Navbar />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-24 text-center sm:h-full sm:min-h-0">
        <h1
          data-aos="blur-in"
          data-aos-delay="120"
          data-aos-duration="900"
          className="text-5xl font-black italic leading-[0.95] text-white sm:text-7xl md:text-8xl lg:text-[165.6px] lg:leading-[127px] lg:tracking-[-5.4px]"
        >
          Welcome to
          <br />
          Rallyverse!
        </h1>
      </div>
    </section>
  );
}
