import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { navLinks } from "@/lib/constants/navigation";

/**
 * Same decoration contract as the hero sections: every knob lives in
 * `position`, unprefixed for phones and `sm:` for desktop. The shuttlecock on
 * the right sits high and tilted, as if the rally just left the court.
 */
const decorations = [
  {
    id: "halo-top",
    src: "/images/landing/halo-top.png",
    position: "top-0 -left-40 h-300 w-300 sm:h-360 sm:w-360",
    priority: true,
  },
  {
    id: "halo-bottom",
    src: "/images/landing/halo-bottom.png",
    position:
      "bottom-0 -right-59 translate-y-140 h-300 w-300 sm:-right-100 sm:translate-y-270 sm:h-488 sm:w-488",
  },
  {
    id: "cock-left",
    src: "/images/landing/cock2.png",
    position:
      "-left-16 top-40 h-56 w-56 -rotate-12 sm:-left-24 sm:top-32 sm:h-120 sm:w-120 sm:rotate-0",
  },
  {
    id: "cock-right",
    src: "/images/landing/cock1.png",
    position:
      "-right-20 top-16 h-60 w-60 -rotate-12 sm:-right-32 sm:top-12 sm:h-132 sm:w-132 sm:rotate-0",
  },
];

/**
 * 404 module root, rendered by `app/not-found.tsx` for both `notFound()` calls
 * and any URL the router does not match.
 */
export default function NotFoundPage() {
  return (
    <section className="relative flex max-h-screen flex-col overflow-hidden bg-hero-bg">
      {decorations.map(({ id, src, position, priority }) => (
        <div key={id} className={`pointer-events-none absolute ${position}`}>
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 400px, 1440px"
            className="object-contain"
          />
        </div>
      ))}

      {/* The 404 has no hero to scroll past, so the bar keeps its dark look */}
      <Navbar variant="dark" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-6 pb-16 pt-36 text-center">
        {/* <div
          data-aos="fade-down"
          className="inline-flex items-center justify-center rounded-full bg-white/5 px-6 py-2.5 shadow-[0_18px_11px_rgba(139,92,246,0.05),0_8px_8px_rgba(139,92,246,0.09)] ring-[0.5px] ring-inset ring-white/30"
        >
          <span className="text-sm font-medium tracking-wide text-[#02F5D4]">
            ERROR 404
          </span>
        </div> */}

        <p
          data-aos="blur-in"
          data-aos-delay="80"
          data-aos-duration="900"
          className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-[104px] font-extrabold italic leading-[0.85] text-transparent sm:text-[200px]"
        >
          404
        </p>

        <h1
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-3xl font-extrabold italic leading-[1.05] text-white sm:text-5xl"
        >
          Shuttlecock-nya keluar lapangan!
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="max-w-lg text-sm text-white/70 sm:text-base"
        >
          Halaman yang kamu cari tidak ada di Rallyverse. Mungkin tautannya
          salah, atau halamannya sudah dipindahkan. Yuk, kembali ke lapangan.
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            href="/"
            variant="solid"
            className="px-6 py-3 text-base font-black italic"
          >
            Kembali ke Beranda
            <ArrowIcon className="font-black" />
          </Button>
          <Button
            href="/pertandingan"
            variant="outline"
            className="px-6 py-3 text-base font-black italic"
          >
            Lihat Live Score
            <ArrowIcon className="font-black" />
          </Button>
        </div>

        {/* Every other destination, so a wrong URL is one tap from the right one */}
        <div
          className="mt-2 flex flex-col items-center gap-3 animate-fade-in"
        // style={{ animationDelay: "1.5s" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Atau kunjungi
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-[#02F5D4] hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
