"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";

interface NavbarProps {
  /**
   * "auto" (default) switches to dark text once scrolled past the hero — used
   * on the landing page. "dark" keeps the light-on-dark look permanently, for
   * interior pages that have a dark background throughout.
   */
  variant?: "auto" | "dark";
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

export function Navbar({ variant = "auto" }: NavbarProps) {
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

  // Whether to render the dark-text-on-light treatment.
  const inverted = variant === "auto" && scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/global/logo.webp"
            alt="UGMCUP"
            width={4800}
            height={4800}
            className={`h-10 w-36 transition duration-300 sm:h-12 sm:w-42 ${
              inverted ? "invert" : ""
            }`}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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
          className={`hidden md:inline-flex ${inverted ? "border-black/30! text-black!" : ""}`}
        >
          Lihat Live Score
          <ArrowIcon />
        </Button>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
            inverted
              ? " text-black hover:bg-black/5"
              : " text-white hover:bg-white/10"
          }`}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu — dark panel so it stays readable over either treatment */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden">
          <nav
            className={`flex flex-col gap-1 rounded-2xl border-b bg-transparent p-2 shadow-xl backdrop-blur-9xl ${
              inverted
                ? "border-black/10 shadow-black/10"
                : "border-white/10 shadow-black/40"
            }`}
          >
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href, pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "bg-[#EF9F27] font-black text-white" // Active tetap menggunakan warna tema emas
                      : inverted
                        ? "font-semibold text-black hover:bg-black/5 hover:text-black"
                        : "font-semibold text-white hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EF9F27]" />
                  )}
                </Link>
              );
            })}

            <Button
              href="/pertandingan"
              variant="outline"
              className={`mt-1 justify-center ${
                inverted ? "font-semibold text-black hover:bg-black/5 hover:text-black" : "font-semibold text-white hover:bg-white/[0.04] hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Lihat Live Score
              <ArrowIcon />
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
