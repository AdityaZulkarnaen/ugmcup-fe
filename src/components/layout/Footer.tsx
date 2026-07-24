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
  { label: "Sekretariat umum", value: "Nama Nasrhubung" },
  { label: "WhatsApp", value: "+62 8xx-xxxx-xxxx" },
  { label: "Lokasi", value: "GOR Nusantara UGM" },
];

const jadwal = [
  { label: "Fase Grup", value: "1-10 Agustus 2026" },
  { label: "Fase Gugur", value: "11-18 Agustus 2026" },
  { label: "Semifinal & Final", value: "19-20 Agustus 2026" },
];

const socials = [
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
  { label: "TikTok", href: "#", Icon: TiktokIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

// The scrolling headline is rendered twice so the track loops seamlessly.
const marqueeItems = Array.from({ length: 16 });

export function Footer() {
  return (
    <footer>
      {/* Purple scrolling headline band */}
      <div className="overflow-hidden bg-[#8B5CF6] py-4">
        <div className="animate-marquee flex w-max items-center"
          style={{ animationDuration: '120s' }}>
          {marqueeItems.map((_, index) => (
            <span
              key={index}
              className="px-6 text-5xl font-black italic uppercase text-white sm:text-[12rem] mt-[1rem]"
            >
              UGM CUP 2026 -
            </span>
          ))}
        </div>
      </div>

      {/* Dark footer body */}
      <div className="bg-[#8B5CF6] text-white/50">
        <div className="mx-auto w-[87.5%] py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-5">
                {/* UGM university seal — ganti dengan aset asli bila tersedia */}
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-[8px] font-bold text-white/70">
                    UGM
                  </span>
                  <span className="text-[10px] font-semibold leading-tight tracking-wide text-white/70">
                    UNIVERSITAS
                    <br />
                    GADJAH MADA
                  </span>
                </div>

                <Image
                  src="/images/global/logo.webp"
                  alt="UGM CUP"
                  width={120}
                  height={30}
                  className="h-6 w-auto"
                />
              </div>

              <p className="mt-6 max-w-sm text-sm leading-relaxed">
                UGM CUP adalah turnamen bulutangkis nasional yang mempertemukan
                tim terbaik Universitas dan SMA/Sederajat se-Indonesia. Ajang ini
                menjadi panggung kompetisi, pembinaan atlet muda, sekaligus
                sarana mempererat persaudaraan antar institusi pendidikan melalui
                olahraga.
              </p>

              <div className="mt-6 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70 transition-colors hover:border-white/60 hover:text-white"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="text-sm font-black italic text-white">Navigasi</h4>
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
            <div>
              <h4 className="text-sm font-black italic text-white">kontak</h4>
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
            <div>
              <h4 className="text-sm font-black italic text-white">
                Jadwal Acara
              </h4>
              <div className="mt-4 space-y-4 text-sm">
                {jadwal.map((item) => (
                  <div key={item.label}>
                    <p className="font-bold text-white">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 text-center text-xs text-white/40">
            © 2026 UGM CUP. All rights reserved. Diselenggarakan oleh UKM Bulu
            Tangkis, Universitas Gadjah Mada.
          </div>
        </div>
      </div>
    </footer>
  );
}
