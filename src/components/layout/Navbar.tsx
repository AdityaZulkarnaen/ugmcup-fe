"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export function Navbar() {
  // True once the page has scrolled past the full-height hero section.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 96);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              scrolled ? "invert" : ""
            }`}
          />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-black hover:text-black/70"
                  : "text-white hover:text-white/70"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button
          href="#"
          variant="outline"
          className={scrolled ? "border-black/30! text-black!" : ""}
        >
          Dokumentasi
          <ArrowIcon />
        </Button>
      </div>
    </header>
  );
}
