import { Button } from "@/components/ui/Button";

export function About() {
  return (
    // A phone screen is not tall enough to hold this comfortably, so the full
    // viewport height only kicks in from sm up.
    <section className="flex items-center justify-center bg-white py-20 text-center text-[#0B0B0F] sm:h-screen sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center justify-center mt-[2%]">
        <p className="text-base font-black italic tracking-wide text-black sm:text-xl">
          Sekilas tentang UGM CUP
        </p>

        <h2 className="mt-6 text-4xl font-black italic leading-[1.1] sm:text-6xl lg:text-7xl">
          Kami <span className="text-[#7C5CFF]">UGM CUP</span> hadir sebagai
          panggung untuk tim{" "}
          <span className="text-[#7C5CFF]">bulutangkis terbaik</span> dari
          Universitas <br className="hidden sm:block" />dan SMA/Sederajat <br className="hidden sm:block" />se-
          <span className="text-[#7C5CFF]">Indonesia!</span>
        </h2>

        <Button
          href="#"
          variant="solid"
          className="mt-10 px-6 py-3 text-base font-black italic"
        >
          Baca Selengkapnya
        </Button>

        <p className="mt-6 max-w-xl text-base text-black sm:text-lg">
          Buktikan bakatmu di lapangan. Kami menciptakan kemenangan yang tak
          terlupakan.
        </p>
      </div>
    </section>
  );
}
