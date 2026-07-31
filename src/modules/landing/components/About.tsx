import { Button } from "@/components/ui/Button";

export function About() {
  return (
    // A phone screen is not tall enough to hold this comfortably, so the full
    // viewport height only kicks in from sm up.
    <section className="flex items-center justify-center bg-white py-20 text-center text-[#0B0B0F] sm:py-28">
      <div
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800" 
          className="mx-auto flex w-[87.5%] flex-col items-center justify-center mt-[2%]">
        <p
          className="text-[18.5px] font-black italic leading-[18.5px] tracking-[-0.5919px] text-black md:text-[25.315px] md:leading-[25.315px] md:tracking-[-0.81px]"
        >
          Sekilas tentang UGM CUP
        </p>

        <h2
          className="mt-[32px] text-[34.56px] font-black italic leading-[33.6px] tracking-[-1.08px] text-black md:text-[72px] md:leading-[70px] md:tracking-[-2.25px]"
        >
          Kami <span className="text-[#8b5cf6]">UGM CUP</span> hadir sebagai
          panggung untuk tim{" "}
          <span className="text-[#8b5cf6]">bulutangkis terbaik</span> dari
          Universitas <br className="hidden sm:block" />dan SMA/Sederajat <br className="hidden sm:block" />se-
          <span className="text-[#8b5cf6]">Indonesia!</span>
        </h2>

        {/* The reveal rides on a wrapper, not the button: `[data-aos]` owns the
            transition and would swallow the button's own hover animation. */}
        <div data-aos="fade-up" data-aos-delay="100" className="mt-[40px] md:mt-[48px]">
          <Button
            href="#"
            variant="solid"
            className="px-[32px] py-[14px] text-[14px] font-black italic leading-[20px] md:px-[40px] md:py-[20px]"
          >
            Baca Selengkapnya
          </Button>
        </div>

        <p
          data-aos="fade-up"
          data-aos-delay="250"
          className="mt-[80px] w-full max-w-[520px] text-[16px] font-normal leading-[28px] tracking-normal text-black"
        >
          Buktikan bakatmu di lapangan. Kami menciptakan kemenangan yang tak
          terlupakan.
        </p>
      </div>
    </section>
  );
}

