import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GallerySlider } from "./components/GallerySlider";

export function DokumentasiPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B0B0F]">
      <Navbar forceInverted />

      <section className="mx-auto flex w-[87.5%] max-w-7xl flex-col items-center pt-28 text-center sm:pt-32 lg:pt-36">
        <p className="text-sm font-medium text-[#6B6B73] sm:text-base">
          Galeri dokumentasi UGM CUP 2026
        </p>

        <h1 className="mt-4 text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] font-black tracking-[-0.06em] text-[#0B0B0F] italic sm:mt-5">
          <span className="text-[#8352D9]">Setiap</span> gerak
          <br />
          punya <span className="text-[#8352D9]">cerita!</span>
        </h1>
      </section>

      <GallerySlider />

      <div className="mt-16 sm:mt-20">
        <Footer />
      </div>
    </main>
  );
}
