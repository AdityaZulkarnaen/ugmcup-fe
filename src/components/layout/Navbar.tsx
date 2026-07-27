"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

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
        <div className="flex items-center gap-2">
          <Image
            src="/images/global/logo.webp"
            alt="UGMCUP"
            width={4800}
            height={4800}
            className={`h-12 w-42 transition duration-300 ${
              inverted ? "invert" : ""
            }`}
          />
        </div>

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
          href="#"
          variant="outline"
          className={inverted ? "border-black/30! text-black!" : ""}
        >
          Dokumentasi
          <ArrowIcon />
        </Button>
      </div>
    </header>
  );
}
