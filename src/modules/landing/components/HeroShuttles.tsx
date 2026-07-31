"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

interface Point {
  x: number;
  y: number;
}

interface Shuttle {
  id: string;
  src: string;
  /** Resting placement — the spot the shuttlecock has always occupied. */
  position: string;
  sizes: string;
  /** Where the flight starts and how the arc bends on its way in. */
  entry: { from: Point; via: Point; rotation: number };
  /** The same line carried on out of frame as the hero scrolls away. */
  exit: { via: Point; to: Point; rotation: number };
  /** Head start in seconds, so the three do not land together. */
  delay: number;
}

/**
 * Three rallies crossing the hero. Offsets are desktop pixels measured from the
 * resting spot, halved on phones; `via` is the bend of the arc, not a stop.
 * Entry and exit share a direction on purpose — the scroll reads as the same
 * shot continuing, not a new one.
 */
const shuttles: Shuttle[] = [
  {
    id: "cock-left",
    src: "/images/landing/cock2.png",
    position: "-left-20 top-42 h-70 w-70 sm:-left-48 sm:top-36 sm:h-132 sm:w-132",
    sizes: "(max-width: 640px) 160px, 528px",
    // Lifted from below the left edge, still climbing when it settles.
    entry: { from: { x: -420, y: 560 }, via: { x: -210, y: 190 }, rotation: -42 },
    exit: { via: { x: 0, y: 0 }, to: { x: 300, y: -320 }, rotation: 12 },
    delay: 0,
  },
  {
    id: "cock-right",
    src: "/images/landing/cock1.png",
    position:
      "-right-28 -rotate-12 sm:rotate-0 top-12 h-80 w-80 sm:-right-56 sm:top-2 sm:h-144 sm:w-144",
    sizes: "(max-width: 640px) 144px, 576px",
    // A smash dropping in from above the right corner, on its way down.
    entry: { from: { x: 400, y: 240 }, via: { x: 180, y: 100 }, rotation: 0 },
    exit: { via: { x: 0, y: 0 }, to: { x: -240, y: -240 }, rotation: -34 },
    delay: 0.05,
  },
  {
    id: "cock-bottom",
    src: "/images/landing/cock3.png",
    position:
      "bottom-0 translate-y-10 -right-20 h-65 w-65 sm:-bottom-52 sm:right-32 sm:h-120 sm:w-120 -rotate-12 sm:rotate-0",
    sizes: "(max-width: 640px) 64px, 480px",
    // A flat drive travelling right to left across the baseline.
    entry: { from: { x: 640, y: 300 }, via: { x: 240, y: 200 }, rotation: 0 },
    exit: { via: { x: 0, y: 0 }, to: { x: -100, y: -200 }, rotation: 0 },
    delay: 0.24,
  },
];

/**
 * The hero shuttlecocks, flown in with GSAP.
 *
 * Each one gets two transform layers so the two motions never fight: the inner
 * `flight` layer runs the entry arc once on load, the outer `drift` layer is
 * scrubbed by the scroll position and carries the trajectory on out of frame.
 * Placement and the base tilt stay on the outermost div, in Tailwind, exactly
 * where they were before.
 *
 * The images start hidden and GSAP reveals them, so nothing flashes at the
 * resting spot before the flight begins. They are decorative, so a browser
 * without JS simply does not show them.
 */
export function HeroShuttles() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        phone: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduced, phone } = context.conditions as Record<string, boolean>;

        // Motion is unwelcome: drop them straight into the resting pose.
        if (reduced) {
          gsap.set(root.querySelectorAll("[data-flight]"), { autoAlpha: 1 });
          return;
        }

        // Phones have a fraction of the room, so the same arcs at full size
        // would start and end miles outside the section.
        const scale = phone ? 0.45 : 1;
        const at = (point: Point) => ({ x: point.x * scale, y: point.y * scale });

        const entry = gsap.timeline();

        for (const shuttle of shuttles) {
          const flight = root.querySelector<HTMLElement>(
            `[data-flight="${shuttle.id}"]`,
          );
          const drift = root.querySelector<HTMLElement>(
            `[data-drift="${shuttle.id}"]`,
          );
          if (!flight || !drift) continue;

          const from = at(shuttle.entry.from);

          gsap.set(flight, {
            ...from,
            rotation: shuttle.entry.rotation,
            autoAlpha: 0,
          });

          entry
            .to(flight, { autoAlpha: 1, duration: 0.4, ease: "none" }, shuttle.delay)
            .to(
              flight,
              {
                motionPath: {
                  path: [from, at(shuttle.entry.via), { x: 0, y: 0 }],
                  curviness: 1.4,
                },
                rotation: 0,
                duration: 1.9,
                // Arrives fast and settles slowly, the way a shuttle loses speed.
                ease: "power3.out",
              },
              shuttle.delay,
            );

          gsap.to(drift, {
            motionPath: {
              path: [{ x: 0, y: 0 }, at(shuttle.exit.via), at(shuttle.exit.to)],
              curviness: 1.2,
            },
            rotation: shuttle.exit.rotation,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              // A touch of lag so the flight keeps moving after the wheel stops.
              scrub: 0.6,
            },
          });
        }
      },
    );

    return () => mm.revert();
  }, []);

  return (
    // Spans the hero, so it doubles as the ScrollTrigger's trigger box.
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0">
      {shuttles.map(({ id, src, position, sizes }) => (
        <div key={id} className={`absolute ${position}`}>
          {/* Outer layer: scrubbed by the scroll */}
          <div data-drift={id} className="h-full w-full">
            {/* Inner layer: the one-off flight in */}
            <div data-flight={id} className="relative h-full w-full invisible">
              <Image src={src} alt="" fill sizes={sizes} className="object-contain" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
