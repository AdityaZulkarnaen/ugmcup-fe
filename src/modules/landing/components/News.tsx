import { Button } from "@/components/ui/Button";
import { news } from "@/lib/constants/news";
import { NewsCard } from "./NewsCard";

export function News() {
  return (
    <section className="bg-[#F2F2F2] py-20 text-center text-[#0B0B0F] sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <p className="text-sm font-medium tracking-wide text-[#6B6B73] sm:text-base">
          Kabar Terkini Seputar UGM CUP
        </p>

        <h2 className="mt-3 text-4xl font-black italic sm:text-6xl">
          Berita &amp; Informasi
        </h2>

        <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        <Button
          href="#"
          variant="solid"
          className="mt-12 px-6 py-3 text-base font-black italic"
        >
          Baca Berita Lainnya
        </Button>
      </div>
    </section>
  );
}
