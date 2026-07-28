import { Footer } from "@/components/layout/Footer";
import { LiveScoreCta } from "@/modules/landing/components/LiveScoreCta";
import { AboutHero } from "./components/AboutHero";
import { AboutIntro } from "./components/AboutIntro";
import { BehindPillars } from "./components/BehindPillars";
import { AboutGallery } from "./components/AboutGallery";

/**
 * "Tentang Kami" page module root.
 * Composes the module's section components; the app router renders this from
 * `app/tentang-kami/page.tsx`.
 */
export default function AboutUsPage() {
  return (
    <>
      <AboutHero />
      <AboutIntro />
      <BehindPillars />
      <AboutGallery />
      <LiveScoreCta />
      <Footer />
    </>
  );
}
