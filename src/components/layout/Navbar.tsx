import Image from "next/image";
import { navLinks } from "@/lib/constants/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export function Navbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <Image
          src="/images/global/logo.webp"
          alt="UGMCUP"
          width={4800}
          height={4800}
          className="h-12 w-42"
        />
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <Button href="#" variant="outline">
        Dokumentasi
        <ArrowIcon />
      </Button>
    </header>
  );
}
