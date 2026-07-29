"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date(2026, 7, 9, 0, 0, 0, 0);
const HOUR_MS = 60 * 60 * 1000;

interface CountdownValue {
  days: string;
  hours: string;
}

function getCountdownValue(): CountdownValue {
  const diff = Math.max(TARGET_DATE.getTime() - Date.now(), 0);
  const totalHours = Math.floor(diff / HOUR_MS);
  const days = Math.floor(totalHours / 24)
    .toString()
    .padStart(2, "0");
  const hours = (totalHours % 24).toString().padStart(2, "0");

  return {
    days,
    hours,
  };
}

function CountdownDigit({ digit, delay }: { digit: string; delay: number }) {
  return (
    // The tiles tip up into place one by one, like a flip clock settling.
    <div
      data-aos="flip-up"
      data-aos-delay={`${delay}`}
      className="relative flex h-24 w-18 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[#8B5AF7] shadow-[0_8px_0_rgba(0,0,0,0.04),0_16px_18px_rgba(78,44,150,0.12)] sm:h-70 sm:w-54 sm:rounded-[1.9rem] md:h-36 md:w-30 md:rounded-[1.75rem]"
    >
      <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#F5FFB0]" />
      <span className="relative translate-y-[0.08em] text-[2.8rem] font-black italic leading-none tracking-[-0.06em] text-[#E9FF53] sm:text-[7rem] md:text-[3.75rem]">
        {digit}
      </span>
    </div>
  );
}

interface CountdownUnitProps {
  label: string;
  value: string;
  /** Head start for this unit's tiles, so days flip before hours. */
  delayOffset: number;
}

function CountdownUnit({ label, value, delayOffset }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3">
        {value.split("").map((digit, index) => (
          <CountdownDigit
            key={`${label}-${index}`}
            digit={digit}
            delay={delayOffset + index * 120}
          />
        ))}
      </div>
      <p
        data-aos="fade-up"
        data-aos-delay={`${delayOffset + 260}`}
        className="mt-3 text-[1rem] font-black uppercase tracking-[-0.04em] text-[#050505] sm:mt-5 sm:text-[2rem] md:text-[1.45rem]"
      >
        {label}
      </p>
    </div>
  );
}

export function CountdownSection() {
  const [countdown, setCountdown] = useState<CountdownValue>(() =>
    getCountdownValue(),
  );

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownValue());
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="overflow-hidden bg-[#D7FF63] py-20 text-center text-[#0A0A0A] sm:py-28">
      <div className="mx-auto flex w-[87.5%] flex-col items-center">
        <h2
          data-aos="fade-up"
          className="max-w-[12ch] text-[clamp(2.4rem,4.5vw,4.9rem)] font-black italic leading-[0.95] tracking-tighter text-black sm:max-w-none sm:text-[clamp(3rem,4.5vw,4.9rem)]"
        >
          Event Dimulai Dalam?
        </h2>

        <div
          className="mt-10 flex items-start justify-center gap-2 sm:mt-14 sm:gap-x-12"
          aria-label="Hitung mundur menuju 9 Agustus 2026"
        >
          <CountdownUnit label="HARI" value={countdown.days} delayOffset={120} />

          <div
            data-aos="fade"
            data-aos-delay="380"
            className="pt-[2.9rem] text-[3rem] font-black leading-none text-[#8B5AF7] sm:pt-[7.2rem] sm:text-[6.2rem] md:pt-[3.3rem] md:text-[4.8rem]"
            aria-hidden="true"
          >
            :
          </div>

          <CountdownUnit label="JAM" value={countdown.hours} delayOffset={380} />
        </div>
      </div>
    </section>
  );
}