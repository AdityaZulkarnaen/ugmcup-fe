"use client";

import Image from "next/image";
import { useRef } from "react";
import { CarouselPager } from "@/components/ui/CarouselPager";
import { aboutGallery } from "@/lib/constants/about";

export function AboutGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Momentum / inertia refs
  const animId = useRef<number | null>(null);
  const lastMouseX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  const stopInertia = () => {
    if (animId.current !== null) {
      cancelAnimationFrame(animId.current);
      animId.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    stopInertia();
    isMouseDown.current = true;
    startX.current = e.pageX - track.offsetLeft;
    scrollLeft.current = track.scrollLeft;
    lastMouseX.current = e.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();

    const now = performance.now();
    const dt = now - lastTime.current;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    track.scrollLeft = scrollLeft.current - walk;

    if (dt > 0) {
      const dx = e.pageX - lastMouseX.current;
      velocity.current = dx / dt;
    }
    lastMouseX.current = e.pageX;
    lastTime.current = now;
  };

  const startInertia = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    stopInertia();

    let vel = velocity.current * 14;
    if (Math.abs(vel) < 0.5) return;

    const step = () => {
      const track = trackRef.current;
      if (!track || Math.abs(vel) < 0.2) {
        stopInertia();
        return;
      }
      track.scrollLeft -= vel;
      vel *= 0.93;
      animId.current = requestAnimationFrame(step);
    };

    animId.current = requestAnimationFrame(step);
  };

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="mx-auto w-full max-w-[1335px] px-6 sm:px-10 lg:px-12">
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={startInertia}
          onMouseUp={startInertia}
          onMouseMove={handleMouseMove}
          className="scrollbar-none flex items-center gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
        >
          {aboutGallery.map((photo, index) => {
            const isLg = index % 2 === 0;
            return (
              <div
                key={photo.id}
                data-aos="fade-up"
                data-aos-delay={`${index * 110}`}
                className="shrink-0 overflow-hidden rounded-[30px] select-none self-center flex items-center justify-center"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  height={isLg ? 450 : 540}
                  draggable={false}
                  className={`w-auto rounded-[30px] object-cover pointer-events-none select-none ${
                    isLg
                      ? "h-56 sm:h-[370px] lg:h-[450px]"
                      : "h-64 sm:h-[440px] lg:h-[540px]"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <CarouselPager trackRef={trackRef} label="Foto" className="mt-8 sm:mt-10" />
      </div>
    </section>
  );
}
