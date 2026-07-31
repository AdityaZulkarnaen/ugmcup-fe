import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export function LiveScoreCta() {
  return (
    <section className="bg-white py-20 text-center text-[#0B0B0F] sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <h2
          data-aos="fade-up"
          data-aos-duration="800"
          className="max-w-8xl text-4xl font-black italic leading-tight sm:text-7xl sm:leading-[70px]"
        >
          Dapatkan akses instan ke seluruh pertandingan!
        </h2>

        {/* Wrapper carries the reveal so the button keeps its own transitions */}
        <div data-aos="zoom-in" data-aos-delay="220" className="mt-14">
          <Button
            href="/pertandingan"
            variant="solid"
            className="px-6 py-3 text-base font-black italic"
          >
            Lihat Pertandingan
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
