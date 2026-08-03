"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants/navigation";
import { socialLinks } from "@/lib/constants/social";
import { ArrowIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";

/** TikTok first, mirroring the mobile menu design. */
const menuSocials = [...socialLinks].reverse();

interface NavbarProps {
  /**
   * Controls the colour scheme of the bar.
   *
   * - `"auto"` (default) — transparent on the hero (white text / white logo),
   *   switches to the **Light** treatment once the page scrolls past the hero:
   *   white background, dark logo, dark text, black CTA pill.
   * - `"dark"` — always uses the dark/transparent look regardless of scroll.
   * - `"light"` — always uses the light treatment regardless of scroll.
   */
  variant?: "auto" | "dark" | "light";
  /** Forces the same inverted treatment used by the landing navbar after scroll. */
  forceInverted?: boolean;
}

/**
 * Which nav link the current URL belongs to. Sub-pages count as their section,
 * so `/pertandingan/sched-7` keeps "Pertandingan" marked. Placeholder `#` links
 * are never active.
 */
function isActiveLink(href: string, pathname: string): boolean {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ variant = "auto", forceInverted = false }: NavbarProps) {
  const pathname = usePathname();
  // True once the page has scrolled past the full-height hero section.
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "auto") return;
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 96);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // The open menu covers the viewport, so the page behind it must not scroll,
  // and Escape has to get out of it.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  /**
   * `inverted` = the Figma "Header [Light]" treatment:
   * white bar, dark logo, dark nav text, black CTA.
   * Active when: variant="light", forceInverted, OR variant="auto" and scrolled past hero, OR menu is open.
   */
  const inverted = variant === "light" || forceInverted || (variant === "auto" && scrolled) || menuOpen;

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* The bar. Never moves. Skins between Light and Dark treatments.      */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${inverted ? "bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-transparent backdrop-blur-md"
          }`}
      >
        <div className="mx-auto flex h-[76px] w-full max-w-[1280px] items-center justify-between px-8">

          {/* -------- Logo -------- */}
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <Image
              src="/images/global/logo.webp"
              alt="UGMCUP"
              width={4800}
              height={4800}
              className={`h-10 w-36 transition duration-300 sm:h-11 sm:w-40 ${inverted ? "invert" : ""
                }`}
            />
          </Link>

          {/* -------- Desktop Nav -------- */}
          {/* `lg` rather than `md`: five links + logo + CTA don't fit 768px without wrapping. */}
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 lg:flex"
          >
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href, pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    relative flex items-center justify-center rounded-full
                    px-4 py-1.5 text-sm font-semibold transition-colors
                    ${inverted
                      ? isActive
                        ? "text-[#1a162b]"
                        : "text-[#99a1af] hover:text-[#1a162b]"
                      : isActive
                        ? "text-[#02F5D4] font-bold"
                        : "text-white/70 hover:text-[#02F5D4]"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* -------- CTA Button -------- */}
          <div className="hidden shrink-0 items-center lg:flex">
            {inverted ? (
              /* Figma "Header [Light]" — solid dark pill with violet glow hover */
              <a
                href="/pertandingan"
                className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-[#1a162b] px-6 py-3 text-xs font-black italic text-white transition-all duration-300 hover:bg-[#8352D9] hover:shadow-[0_4px_20px_rgba(131,82,217,0.2)] hover:scale-[1.03] active:scale-95"
              >
                <span>Pertandingan</span>
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            ) : (
              /* Figma "Header [Dark]" — outline pill that turns into solid Mint button on hover */
              <a
                href="/pertandingan"
                className={`
                  group relative inline-flex items-center gap-2 overflow-hidden
                  rounded-full border border-white/50
                  px-6 py-3 text-xs font-black italic text-[#f4f0ff]
                  shadow-[inset_0_0_12px_rgba(255,255,255,0.08),inset_0_-8px_32px_rgba(30,13,73,0.5)]
                  transition-all duration-300 ease-out
                  hover:border-white hover:bg-[#02F5D4] hover:text-[#12102A]
                  hover:shadow-[inset_0_0_18px_rgba(255,255,255,0.08),inset_0_-12px_48px_rgba(2,245,212,0.5)]
                  hover:scale-[1.03] active:scale-95
                `}
              >
                <span>Pertandingan</span>
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            )}
          </div>

          {/* -------- Mobile Hamburger / Close -------- */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden ${inverted
                ? "text-[#1a162b] hover:bg-black/5"
                : "text-white hover:bg-white/10"
              }`}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile slide-in panel. Sibling of the header so it isn't clipped by  */}
      {/* backdrop-blur. `pt-*` clears the fixed bar height. Kept mounted so   */}
      {/* the close animation plays.                                           */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`fixed inset-0 z-40 flex flex-col bg-white pt-[76px] transition-transform duration-300 ease-out lg:hidden ${menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
          }`}
      >
        <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.href, pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`text-3xl font-black italic tracking-[-0.01em] leading-[40px] sm:text-4xl sm:leading-[48px] transition-colors ${isActive
                    ? "text-[#7C5CFF]"
                    : "text-[#1a162b] hover:text-[#7C5CFF]"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          <a
            href="/pertandingan"
            onClick={() => setMenuOpen(false)}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#1a162b] px-6 py-3 text-base font-black italic text-white transition-all duration-300 hover:bg-[#8352D9] hover:shadow-[0_4px_20px_rgba(131,82,217,0.4)] hover:scale-[1.03] active:scale-95"
          >
            <span>Lihat Pertandingan</span>
            <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </nav>

        <div className="flex flex-col items-center gap-6 px-6 pb-10">
          <div className="flex items-center gap-4">
            {menuSocials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F1F3] text-[#1a162b] transition-colors hover:bg-[#E4E4E8]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <p className="text-center text-sm text-[#6B6B73]">
            Copyright © 2026 UGM CUP. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
