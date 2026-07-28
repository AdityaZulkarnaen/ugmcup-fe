import Image from "next/image";
import {
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
} from "@/components/ui/icons";

const navigasi = [
  { label: "Beranda", href: "#" },
  { label: "Pertandingan", href: "#" },
  { label: "Dokumentasi", href: "#" },
  { label: "tentang kami", href: "#" },
];

const kontak = [
  { label: "WhatsApp", value: "+62 822-5946-2290" },
  { label: "Lokasi", value: "GOR Nusantara UGM" },
  {
    label: "Sekretariat umum",
    value:
      "UKM Bulutangkis UGM, Bulaksumur, Jl. Pancasila No. 1, Caturtunggal, Depok, Sleman, DIY 55281",
  },
];

const jadwal = [
  { label: "Fase Grup", value: "1-10 Agustus 2026" },
  { label: "Fase Gugur", value: "11-18 Agustus 2026" },
  { label: "Semifinal & Final", value: "19-20 Agustus 2026" },
];

/** Order of the icon buttons; the mobile text list runs the other way round. */
const socials = [
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
  { label: "TikTok", href: "#", Icon: TiktokIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

const columnHeading = "text-sm font-black italic text-white";

// The scrolling headline is rendered twice so the track loops seamlessly.
const marqueeItems = Array.from({ length: 16 });

export function Footer() {
  return (
    <footer>
      {/* Purple scrolling headline band */}
      <div className="overflow-hidden bg-[#8B5CF6] pt-8 pb-2 sm:pt-12">
        <div
          className="animate-marquee flex w-max items-center"
          style={{ animationDuration: "120s" }}
        >
          {marqueeItems.map((_, index) => (
            <span
              key={index}
              className="px-4 text-7xl font-black italic uppercase leading-none text-white sm:px-6 sm:text-[9rem] lg:text-[12rem]"
            >
              UGM CUP 2026 -
            </span>
          ))}
        </div>
      </div>

      {/* Footer body */}
      <div className="bg-[#8B5CF6] text-white">
        <div className="mx-auto w-[87.5%] pt-12 pb-4 sm:pt-16">
          {/*
            Mobile stacks the link groups two by two and drops the brand block
            underneath; from md up the brand takes the wide first column and the
            groups line up beside it. `order-*` drives both arrangements from one
            markup order, so nothing is rendered twice.
          */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[5fr_1fr_1fr_1fr] md:gap-12">
            {/* Brand */}
            <div className="order-5 col-span-2 flex flex-col items-center gap-8 border-t border-white/20 pt-10 md:order-0 md:col-span-1 md:items-start md:gap-6 md:border-0 md:pt-0">
              <p className="order-1 w-full text-left text-sm leading-relaxed md:order-2">
                UGM CUP adalah turnamen bulutangkis nasional yang mempertemukan
                tim terbaik Universitas dan SMA/Sederajat se-Indonesia. Ajang ini
                menjadi panggung kompetisi, pembinaan atlet muda, sekaligus
                sarana mempererat persaudaraan antar institusi pendidikan melalui
                olahraga.
              </p>

              <div className="order-2 flex items-center gap-4 sm:gap-5 md:order-1">
                {/* UGM university seal — ganti dengan aset asli bila tersedia */}
                <Image
                  src="/images/global/ugm.svg"
                  alt="UGM CUP"
                  width={120}
                  height={30}
                  className="h-12 w-auto sm:h-14 md:h-18"
                />

                <Image
                  src="/images/global/logo.webp"
                  alt="UGM CUP"
                  width={1200}
                  height={300}
                  className="h-12 w-auto sm:h-14 md:h-18"
                />
              </div>

              <div className="order-3 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition-colors hover:border-white/60 hover:text-white md:h-16 md:w-16"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigasi */}
            <div className="order-1">
              <h4 className={columnHeading}>Navigasi</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {navigasi.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* kontak */}
            <div className="order-2">
              <h4 className={columnHeading}>kontak</h4>
              <div className="mt-4 space-y-4 text-sm">
                {kontak.map((item) => (
                  <div key={item.label}>
                    <p className="font-bold text-white">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Jadwal Acara */}
            <div className="order-3">
              <h4 className={columnHeading}>Jadwal Acara</h4>
              <div className="mt-4 space-y-4 text-sm">
                {jadwal.map((item) => (
                  <div key={item.label}>
                    <p className="font-bold text-white">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sosial Media — mobile fills the fourth cell with named links; on
                desktop the icon buttons in the brand column carry this instead */}
            <div className="order-4 md:hidden">
              <h4 className={columnHeading}>Sosial Media</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {[...socials].reverse().map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t-[0.5px] border-white/20 pt-4 text-center text-xs text-white sm:mt-14">
            © 2026 UGM CUP. All rights reserved. Diselenggarakan oleh UKM Bulu
            Tangkis, Universitas Gadjah Mada.
          </div>
        </div>
      </div>
    </footer>
  );
}
