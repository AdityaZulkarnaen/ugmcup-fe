"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

function ScrollToTopOnNavigation() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    // Stop ongoing Lenis smooth-scroll animation & momentum immediately and jump to top
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    // Also reset native window scroll position immediately
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, lenis]);

  return null;
}

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      <ScrollToTopOnNavigation />
      {children}
    </ReactLenis>
  );
}
