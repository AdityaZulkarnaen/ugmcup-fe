import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export function LiveScoreCta() {
  return (
    <section className="bg-white py-20 text-center text-[#0B0B0F] sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <h2 className="max-w-8xl text-4xl font-black italic leading-[1.1] sm:text-7xl">
          Dapatkan akses instan ke seluruh pertandingan!
        </h2>

        <Button
          href="#"
          variant="solid"
          className="mt-10 px-6 py-3 text-base font-black italic"
        >
          Lihat Live Score
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}
