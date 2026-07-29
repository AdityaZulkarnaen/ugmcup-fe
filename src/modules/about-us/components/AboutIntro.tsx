import { SponsorRow } from "@/modules/landing/components/SponsorRow";

export function AboutIntro() {
  return (
    <section className="bg-white py-20 text-center text-[#0B0B0F] sm:py-28">
      <div className="mx-auto flex w-[87.5%] max-w-4xl flex-col items-center">
        <h2
          data-aos="fade-up"
          data-aos-duration="900"
          className="text-3xl font-black italic leading-[1.15] sm:text-5xl lg:text-6xl"
        >
          Kami <span className="text-[#7C5CFF]">menghadirkan</span> panggung
          kejuaraan <span className="text-[#7C5CFF]">nasional</span> tempat para
          juara muda bertarung demi kehormatan almamater. Kami percaya{" "}
          <span className="text-[#7C5CFF]">kemenangan</span> sejati lahir dari
          setiap gerak yang tak kenal menyerah…
        </h2>

        <p
          data-aos="fade-up"
          data-aos-delay="180"
          className="mt-10 max-w-lg text-xs leading-relaxed text-[#3A3A42] sm:text-sm"
        >
          UGM CUP bukan sekadar turnamen biasa, melainkan wadah regenerasi atlet
          bulutangkis terbesar bagi tingkat Perguruan Tinggi dan
          SMA/SMK/Sederajat di tanah air. Kami mengintegrasikan persaingan yang
          sengit dengan nilai-nilai solidaritas antar institusi pendidikan.
          Melalui arena ini, kami berkomitmen mencetak standar baru ajang
          olahraga mahasiswa yang inspiratif, kompetitif, dan tak terlupakan
          bagi setiap tim yang bertanding.
        </p>

        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="mt-6 max-w-lg text-xs font-bold text-[#0B0B0F] sm:text-sm"
        >
          Visi kami jelas: Menyatukan Indonesia Lewat Kejayaan Bulutangkis.
        </p>
      </div>

      {/* Full-bleed, unlike the landing hero where it is capped to the title */}
      <SponsorRow dark fast className="mt-16 sm:mt-20" />
    </section>
  );
}
