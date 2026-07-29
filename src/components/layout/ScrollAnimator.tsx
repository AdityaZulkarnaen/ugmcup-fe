"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * AOS-style scroll reveal, mounted once in the root layout.
 *
 * Markup opts in with plain attributes, so a section stays a Server Component:
 *
 * ```tsx
 * <h2 data-aos="fade-up" data-aos-delay="120">…</h2>
 * ```
 *
 * | Attribute           | Values                                                        |
 * |---------------------|---------------------------------------------------------------|
 * | `data-aos`          | `fade` `fade-up` `fade-down` `fade-left` `fade-right`          |
 * |                     | `zoom-in` `zoom-in-up` `flip-up` `blur-in`                     |
 * | `data-aos-delay`    | milliseconds, e.g. `"150"`                                     |
 * | `data-aos-duration` | milliseconds, defaults to 700                                  |
 * | `data-aos-once`     | `"false"` to replay every time the element re-enters the view  |
 *
 * The hidden state lives in `globals.css` under `[data-aos]`; this component
 * only flips `.aos-animate` on. A `<noscript>` rule in the root layout unhides
 * everything when JS never arrives.
 */
export function ScrollAnimator() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("aos-animate");

    // No IntersectionObserver (or motion is unwelcome) — show everything and
    // never hide anything again.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      document.querySelectorAll("[data-aos]").forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            reveal(el);
            if (el.dataset.aosOnce !== "false") observer.unobserve(el);
          } else if (el.dataset.aosOnce === "false") {
            el.classList.remove("aos-animate");
          }
        }
      },
      // Trip a little before the element is fully in: the reveal should finish
      // around the time the reader's eye gets there, not after.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    /** Hands `delay`/`duration` to CSS as custom properties, then observes. */
    const register = (el: HTMLElement) => {
      if (el.dataset.aosBound) return;
      el.dataset.aosBound = "true";

      const { aosDelay, aosDuration } = el.dataset;
      if (aosDelay) el.style.setProperty("--aos-delay", `${aosDelay}ms`);
      if (aosDuration) el.style.setProperty("--aos-duration", `${aosDuration}ms`);

      observer.observe(el);
    };

    const scan = () =>
      document
        .querySelectorAll<HTMLElement>("[data-aos]:not([data-aos-bound])")
        .forEach(register);

    scan();

    // Carousels and other client sections mount after this effect runs, so keep
    // watching for markup that arrives later.
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      // A route change re-runs this effect; clearing the flag lets the next
      // pass re-observe the elements that survive the navigation.
      document
        .querySelectorAll<HTMLElement>("[data-aos-bound]")
        .forEach((el) => delete el.dataset.aosBound);
    };
  }, [pathname]);

  return null;
}
