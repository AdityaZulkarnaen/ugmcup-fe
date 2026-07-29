"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants/navigation";
import { socialLinks } from "@/lib/constants/social";
import { Button } from "@/components/ui/Button";
import { ArrowIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";

/** TikTok first, mirroring the mobile menu design. */
const menuSocials = [...socialLinks].reverse();

interface NavbarProps {
  /**
   * "auto" (default) switches to dark text once scrolled past the hero — used
   * on the landing page. "dark" keeps the light-on-dark look permanently, for
   * interior pages that have a dark background throughout.
   */
  variant?: "auto" | "dark";
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

  // Whether to render the dark-text-on-light treatment.
  const inverted = forceInverted || (variant === "auto" && scrolled);

  return (
    <>
    {/* The bar never moves. With the menu open it just re-skins to white with a
        dark logo, and the panel slides in underneath it. */}
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        menuOpen ? "bg-white" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/global/logo.webp"
            alt="UGMCUP"
            width={4800}
            height={4800}
            className={`h-10 w-36 transition duration-300 sm:h-12 sm:w-42 ${
              inverted || menuOpen ? "invert" : ""
            }`}
          />
        </Link>

        {/* `lg` rather than `md`: five links plus the logo and CTA do not fit a
            768px row without wrapping. */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.href, pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-1 text-sm transition-colors ${
                  isActive ? "font-bold" : "font-medium"
                } ${
                  inverted
                    ? isActive
                      ? "text-black"
                      : "text-black/60 hover:text-black"
                    : isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                {/* Gold rule marks the page you are on */}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-[#EF9F27]" />
                )}
              </Link>
            );
          })}
        </nav>

        <Button
          href="/pertandingan"
          variant="outline"
          className={`hidden sm:inline-flex ${inverted ? "border-black/30! text-black!" : ""}`}
        >
          Lihat Live Score
          <ArrowIcon />
        </Button>

        {/* Mobile trigger — also the close button, since the bar stays put */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden ${
            inverted || menuOpen
              ? " text-black hover:bg-black/5"
              : " text-white hover:bg-white/10"
          }`}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>

      {/*
        The sliding half of the menu. It is a sibling of the header rather than
        a child because the header's `backdrop-blur` makes it the containing
        block for any fixed descendant, which would size this to the bar instead
        of the viewport. It covers the whole screen but sits a layer below the
        header, so the bar stays visible and still while this slides under it —
        `pt-*` clears the bar's height. Kept mounted so the transition plays in
        both directions; unmounting it while closed would make it snap open.
      */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-40 flex flex-col bg-white pt-22 transition-transform duration-300 ease-out sm:pt-24 lg:hidden ${
          menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
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
                className={`text-3xl font-black italic transition-colors sm:text-4xl ${
                  isActive
                    ? "text-[#7C5CFF]"
                    : "text-[#0B0B0F] hover:text-[#7C5CFF]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Button
            href="/pertandingan"
            variant="solid"
            className="mt-8 px-6 py-3 text-base font-black italic"
            onClick={() => setMenuOpen(false)}
          >
            Lihat Live Score
            <ArrowIcon />
          </Button>
        </nav>

        <div className="flex flex-col items-center gap-6 px-6 pb-10">
          <div className="flex items-center gap-4">
            {menuSocials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F1F3] text-[#0B0B0F] transition-colors hover:bg-[#E4E4E8]"
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
