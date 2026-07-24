import { Hero } from "./components/Hero";

/**
 * Landing page module root.
 * Composes the module's section components; the app router renders this
 * from `app/page.tsx`.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
    </>
  );
}
