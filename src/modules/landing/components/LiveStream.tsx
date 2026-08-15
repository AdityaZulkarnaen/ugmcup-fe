import { YoutubeIcon } from "@/components/ui/icons";

const YOUTUBE_VIDEO_ID = "ZJNbEVa60Q8";

/**
 * Live Streaming section — embed YouTube live stream dengan tampilan premium.
 * Menggunakan warna deep-purple/midnight dari design system landing page.
 */
export function LiveStream() {
  return (
    <section className="relative overflow-hidden bg-[#F5F5F5] py-20 sm:py-28">
      <div className="relative mx-auto flex w-[87.5%] max-w-6xl flex-col items-center">
        {/* Eyebrow badge — Live status
        <div
          data-aos="fade-down"
          className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 shadow-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Siaran Langsung
        </div> */}

        {/* Heading */}
        <h2
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="mt-3 max-w-4xl text-center text-4xl font-black italic leading-[0.9] text-[#0B0B0F] sm:text-6xl lg:text-7xl"
        >
          Saksikan <span className="text-[#8B5AF7]">Final</span> <br />
          <span className="text-[#8B5AF7]">UGM CUP</span> 2026
        </h2>

        {/* <p
          data-aos="fade-up"
          data-aos-delay="180"
          className="mt-4 max-w-md text-center text-[15px] leading-relaxed text-[#5C5C66]"
        >
          Tidak ingin ketinggalan momen seru final UGM CUP 2026? Streaming langsung hanya disini!
        </p> */}

        {/* YouTube embed frame */}
        <div
          data-aos="zoom-in"
          data-aos-delay="240"
          data-aos-duration="900"
          className="mt-10 w-full sm:mt-14"
        >
          {/* Outer shadow card */}
          <div className="relative rounded-2xl p-[3px] sm:rounded-3xl">
            {/* Gradient border */}
            {/* <div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,90,247,0.8) 0%, rgba(2,245,212,0.6) 50%, rgba(139,90,247,0.4) 100%)",
              }}
              aria-hidden
            /> */}

            {/* Inner container: aspect-ratio 16/9 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black sm:rounded-3xl">
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=0&rel=0&modestbranding=1&color=white`}
                title="UGM CUP 2026 Live Streaming"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>

        {/* Subscribe CTA */}
        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#FF0000] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(255,0,0,0.25)] transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-[#8B5CF6] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] active:scale-95"
          >
            <YoutubeIcon className="h-5 w-5" />
            Tonton di YouTube
          </a>

          <span className="text-[13px] text-[#6B6B73]">
            atau nonton langsung di atas
          </span>
        </div>
      </div>
    </section>
  );
}
