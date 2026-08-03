"use client";

import { useEffect, useState } from "react";

/**
 * Preloader component based on Figma node 426-9760.
 * Simple, clean implementation: runs ONCE when the user first enters the website in their browser session.
 */
export function Preloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Only run on initial entrance per session
    const hasSeen = sessionStorage.getItem("ugmcup_preloader_seen");
    if (hasSeen) {
      return;
    }

    setIsVisible(true);
    document.body.style.overflow = "hidden";

    const duration = 2400; // ~2.4 seconds loading time
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Decelerates smoothly near 100%
      const easeOutQuart = 1 - Math.pow(1 - progress, 3.5);
      const currentCount = Math.floor(easeOutQuart * 100);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(100);
        setTimeout(() => {
          setIsExiting(true);
          sessionStorage.setItem("ugmcup_preloader_seen", "true");

          setTimeout(() => {
            setIsVisible(false);
            document.body.style.overflow = "";
          }, 600);
        }, 300);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#8B5CF6] transition-opacity duration-600 ease-in-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <p className="select-none font-['Montserrat'] font-black italic tracking-[-0.03em] text-[#02F5D4] text-[80px] sm:text-[120px] md:text-[165px] leading-none">
          {count}%
        </p>
      </div>
    </div>
  );
}
