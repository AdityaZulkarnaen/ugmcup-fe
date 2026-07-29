import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { News } from "./components/News";
import { CountdownSection } from "./components/CountdownSection";
import { Venue } from "./components/Venue";
import { LiveScoreCta } from "./components/LiveScoreCta";
import { Footer } from "@/components/layout/Footer";

/**
 * Landing page module root.
 * Composes the module's section components; the app router renders this
 * from `app/page.tsx`.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <News />
      <CountdownSection />
      <Venue />
      <LiveScoreCta />
      <Footer />
    </>
  );
}
